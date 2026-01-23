// Music Player Controller
// Automatically discovers songs from the songs/ folder
// Name files: 1.mp3, 2.mp3, etc. Metadata (title, artist) is read from ID3 tags

class MusicPlayer {
    constructor() {
        this.tracks = [];
        this.currentTrack = -1;
        this.isPlaying = false;
        this.isShuffle = false;
        this.isLoop = false;
        this.volume = 0.7;
        this.audio = new Audio();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        this.cacheElements();
        if (!this.playBtn) return;

        await this.discoverTracks();
        this.renderTracklist();
        this.setupEventListeners();
        this.setupAudioEvents();
        this.updateVolumeDisplay();
        this.audio.volume = this.volume;
        this.initialized = true;
    }

    async discoverTracks() {
        this.tracks = [];
        let trackNum = 1;
        const maxTracks = 100;

        while (trackNum <= maxTracks) {
            const found = await this.tryLoadTrack(trackNum);
            if (!found) break;
            trackNum++;
        }
    }

    async tryLoadTrack(num) {
        for (const ext of ['mp3', 'wav', 'ogg']) {
            const path = `songs/${num}.${ext}`;
            const exists = await this.probeFile(path);
            if (exists) {
                // Fetch the file to read metadata
                const metadata = await this.readMetadata(path, ext);
                const track = {
                    src: path,
                    title: metadata.title || `Track ${num}`,
                    artist: metadata.artist || 'Snitheads',
                    year: metadata.year || '',
                    duration: 0
                };
                console.log(`Loaded: ${path}`, metadata);
                this.tracks.push(track);
                return true;
            }
        }
        return false;
    }

    async probeFile(path) {
        return await window.DOMUtils.probeFile(path);
    }

    async readMetadata(path, ext) {
        if (ext !== 'mp3') {
            return { title: null, artist: null, year: null };
        }

        try {
            const response = await fetch(path);
            const buffer = await response.arrayBuffer();
            return this.parseID3(buffer);
        } catch {
            return { title: null, artist: null, year: null };
        }
    }

    parseID3(buffer) {
        const view = new DataView(buffer);
        const result = { title: null, artist: null, year: null };

        // Check for ID3v2 header
        if (this.getString(view, 0, 3) === 'ID3') {
            const version = view.getUint8(3);
            const size = this.getID3Size(view, 6);

            if (version === 3 || version === 4) {
                this.parseID3v2(view, 10, size, result, version);
            }
        }

        // Check for ID3v1 at end of file
        if (!result.title && buffer.byteLength > 128) {
            const offset = buffer.byteLength - 128;
            if (this.getString(view, offset, 3) === 'TAG') {
                result.title = this.getString(view, offset + 3, 30).trim() || null;
                result.artist = this.getString(view, offset + 33, 30).trim() || null;
                result.year = this.getString(view, offset + 93, 4).trim() || null;
            }
        }

        return result;
    }

    parseID3v2(view, start, size, result, version) {
        let offset = start;
        const end = start + size;

        while (offset < end - 10) {
            const frameId = this.getString(view, offset, 4);
            if (frameId === '\0\0\0\0' || frameId.charCodeAt(0) === 0) break;

            const frameSize = version === 4
                ? this.getID3Size(view, offset + 4)
                : view.getUint32(offset + 4);

            if (frameSize <= 0 || frameSize > size) break;

            const frameStart = offset + 10;

            if (frameId === 'TIT2') {
                result.title = this.readTextFrame(view, frameStart, frameSize);
            } else if (frameId === 'TPE1') {
                result.artist = this.readTextFrame(view, frameStart, frameSize);
            } else if (frameId === 'TYER' || frameId === 'TDRC') {
                result.year = this.readTextFrame(view, frameStart, frameSize);
                if (result.year && result.year.length > 4) {
                    result.year = result.year.substring(0, 4);
                }
            }

            offset += 10 + frameSize;
        }
    }

    readTextFrame(view, offset, size) {
        if (size <= 1) return null;

        const encoding = view.getUint8(offset);
        let text = '';

        if (encoding === 0 || encoding === 3) {
            // ISO-8859-1 or UTF-8
            text = this.getString(view, offset + 1, size - 1);
        } else if (encoding === 1 || encoding === 2) {
            // UTF-16
            text = this.getUTF16String(view, offset + 1, size - 1);
        }

        return text.replace(/\0/g, '').trim() || null;
    }

    getString(view, offset, length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const code = view.getUint8(offset + i);
            if (code === 0) break;
            str += String.fromCharCode(code);
        }
        return str;
    }

    getUTF16String(view, offset, length) {
        let str = '';
        const bom = view.getUint16(offset);
        const littleEndian = bom === 0xFFFE;
        const start = (bom === 0xFEFF || bom === 0xFFFE) ? 2 : 0;

        for (let i = start; i < length - 1; i += 2) {
            const code = view.getUint16(offset + i, littleEndian);
            if (code === 0) break;
            str += String.fromCharCode(code);
        }
        return str;
    }

    getID3Size(view, offset) {
        return ((view.getUint8(offset) & 0x7F) << 21) |
               ((view.getUint8(offset + 1) & 0x7F) << 14) |
               ((view.getUint8(offset + 2) & 0x7F) << 7) |
               (view.getUint8(offset + 3) & 0x7F);
    }

    renderTracklist() {
        const container = document.querySelector('.track-items');
        if (!container) return;

        if (this.tracks.length === 0) {
            container.innerHTML = `
                <div class="track-item no-tracks">
                    <span style="color: rgba(255,255,255,0.5); padding: 1rem;">
                        No songs found. Add mp3 files to the songs/ folder (name them 1.mp3, 2.mp3, etc.)
                    </span>
                </div>
            `;
            return;
        }

        container.innerHTML = this.tracks.map((track, index) => `
            <div class="track-item" data-track="${index}">
                <span class="track-number">${index + 1}</span>
                <div class="track-details">
                    <span class="track-name">${track.title}${track.year ? ` (${track.year})` : ''}</span>
                    <span class="track-duration">--:--</span>
                </div>
            </div>
        `).join('');

        // Re-cache track items and add listeners
        this.trackItems = document.querySelectorAll('.track-item');
        this.trackItems.forEach((item, index) => {
            item.addEventListener('click', () => this.selectTrack(index));
        });
    }

    cacheElements() {
        this.playBtn = document.querySelector('.play-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.shuffleBtn = document.querySelector('.shuffle-btn');
        this.loopBtn = document.querySelector('.loop-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.volumeFill = document.querySelector('.volume-fill');
        this.trackTitle = document.querySelector('.track-title');
        this.trackArtist = document.querySelector('.track-artist');
        this.timeCurrent = document.querySelector('.time-current');
        this.timeTotal = document.querySelector('.time-total');
        this.trackItems = document.querySelectorAll('.track-item');
        this.playIcon = document.querySelector('.play-btn .play-icon');
        this.pauseIcon = document.querySelector('.play-btn .pause-icon');
    }

    setupEventListeners() {
        this.playBtn?.addEventListener('click', () => this.togglePlay());
        this.prevBtn?.addEventListener('click', () => this.previousTrack());
        this.nextBtn?.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn?.addEventListener('click', () => this.toggleShuffle());
        this.loopBtn?.addEventListener('click', () => this.toggleLoop());

        this.progressBar?.addEventListener('click', (e) => this.seekTo(e));
        this.volumeSlider?.addEventListener('click', (e) => this.setVolume(e));
    }

    setupAudioEvents() {
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
    }

    onTimeUpdate() {
        if (!this.audio.duration) return;

        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        if (this.timeCurrent) {
            this.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    onMetadataLoaded() {
        if (this.timeTotal) {
            this.timeTotal.textContent = this.formatTime(this.audio.duration);
        }
        // Update duration in tracklist and tracks array
        if (this.currentTrack >= 0) {
            this.tracks[this.currentTrack].duration = this.audio.duration;
            if (this.trackItems[this.currentTrack]) {
                const durationEl = this.trackItems[this.currentTrack].querySelector('.track-duration');
                if (durationEl) {
                    durationEl.textContent = this.formatTime(this.audio.duration);
                }
            }
        }
    }

    onPlay() {
        this.isPlaying = true;
        this.updatePlayButton();
    }

    onPause() {
        this.isPlaying = false;
        this.updatePlayButton();
    }

    selectTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;

        this.currentTrack = index;
        const track = this.tracks[index];

        // Update display
        if (this.trackTitle) this.trackTitle.textContent = track.title;
        if (this.trackArtist) this.trackArtist.textContent = track.artist;

        // Update tracklist highlighting
        this.trackItems.forEach((item, i) => {
            item.classList.toggle('playing', i === index);
        });

        // Load and play
        this.audio.src = track.src;
        this.audio.play();
    }

    togglePlay() {
        if (this.tracks.length === 0) return;

        if (this.currentTrack === -1) {
            this.selectTrack(0);
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    updatePlayButton() {
        if (this.playIcon && this.pauseIcon) {
            this.playIcon.style.display = this.isPlaying ? 'none' : 'block';
            this.pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
        }
    }

    formatTime(seconds) {
        return window.Formatters.formatTime(seconds);
    }

    onTrackEnd() {
        if (this.isLoop) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.nextTrack();
        }
    }

    previousTrack() {
        if (this.tracks.length === 0) return;

        if (this.currentTrack === -1) {
            this.selectTrack(0);
            return;
        }

        // If more than 3 seconds in, restart current track
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        let newIndex = this.currentTrack - 1;
        if (newIndex < 0) {
            newIndex = this.tracks.length - 1;
        }

        this.selectTrack(newIndex);
    }

    nextTrack() {
        if (this.tracks.length === 0) return;

        if (this.currentTrack === -1) {
            this.selectTrack(0);
            return;
        }

        let newIndex;
        if (this.isShuffle) {
            do {
                newIndex = Math.floor(Math.random() * this.tracks.length);
            } while (newIndex === this.currentTrack && this.tracks.length > 1);
        } else {
            newIndex = (this.currentTrack + 1) % this.tracks.length;
        }

        this.selectTrack(newIndex);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn?.classList.toggle('active', this.isShuffle);
    }

    toggleLoop() {
        this.isLoop = !this.isLoop;
        this.loopBtn?.classList.toggle('active', this.isLoop);
    }

    seekTo(event) {
        if (this.currentTrack === -1 || !this.audio.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percentage = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = percentage * this.audio.duration;
    }

    setVolume(event) {
        const rect = this.volumeSlider.getBoundingClientRect();
        this.volume = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        if (this.volumeFill) {
            this.volumeFill.style.width = `${this.volume * 100}%`;
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    cleanup() {
        this.stop();
        this.isPlaying = false;
        this.currentTrack = -1;
        this.initialized = false;
    }
}

// Global music player instance
window.musicPlayer = new MusicPlayer();
