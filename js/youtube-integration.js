// YouTube Integration Module
// Fetches videos from YouTube channel RSS feed and displays them in the cartoons section

const YOUTUBE_CONFIG = {
    channelId: 'UCyEV-UcKPN8cCdFFoJrfEeQ', // Snitheads YouTube channel
    cacheDuration: 30 * 60 * 1000,     // 30 minutes cache
    cacheKey: 'snitheads_youtube_cache'
};

// RSS to JSON API (free tier: 10k requests/day, handles CORS)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

class YouTubeIntegration {
    constructor(config = YOUTUBE_CONFIG) {
        this.config = config;
        this.cacheManager = new window.CacheManager(config.cacheKey, config.cacheDuration);
        this.videos = [];
        this.currentVideoId = null;
        this.isLoading = false;
        this.error = null;
        this.tvPlayer = null;
        this.tvPlayerReady = false;
        this.apiLoaded = false;
    }

    getFeedUrl() {
        return `https://www.youtube.com/feeds/videos.xml?channel_id=${this.config.channelId}`;
    }

    async fetchVideos() {
        // Check cache first
        const cached = this.cacheManager.get();
        if (cached) {
            this.videos = cached;
            return this.videos;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(this.getFeedUrl())}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                throw new Error(data.message || 'Failed to fetch feed');
            }

            this.videos = data.items.map(item => ({
                id: this.extractVideoId(item.link),
                title: item.title,
                description: this.truncateDescription(item.description),
                thumbnail: item.thumbnail || this.getThumbnailUrl(this.extractVideoId(item.link)),
                publishedAt: new Date(item.pubDate),
                link: item.link
            }));

            this.cacheManager.set(this.videos);

        } catch (err) {
            this.error = err.message;
            console.error('YouTube fetch error:', err);
        } finally {
            this.isLoading = false;
        }

        return this.videos;
    }

    extractVideoId(url) {
        const match = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/);
        return match ? match[1] : null;
    }

    getThumbnailUrl(videoId, quality = 'mqdefault') {
        return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    }

    truncateDescription(desc, maxLength = 100) {
        if (!desc) return '';
        const stripped = desc.replace(/<[^>]*>/g, '');
        if (stripped.length <= maxLength) return stripped;
        return stripped.substring(0, maxLength).trim() + '...';
    }

    // ==========================================
    // TV Player (Landing Page)
    // ==========================================

    loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (this.apiLoaded) {
                resolve();
                return;
            }

            // Check if already loaded
            if (window.YT && window.YT.Player) {
                this.apiLoaded = true;
                resolve();
                return;
            }

            // Load the API
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Wait for API to load
            window.onYouTubeIframeAPIReady = () => {
                this.apiLoaded = true;
                resolve();
            };
        });
    }

    async initTVPlayer() {
        const tvContainer = document.getElementById('tv-player');
        if (!tvContainer) return;

        // Fetch videos first
        await this.fetchVideos();

        if (this.videos.length === 0) {
            return;
        }

        // Set the current video to the latest
        this.currentVideoId = this.videos[0].id;

        // Load YouTube IFrame API
        await this.loadYouTubeAPI();

        // Create the player
        this.tvPlayer = new YT.Player('tv-player', {
            videoId: this.currentVideoId,
            playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                loop: 1,
                modestbranding: 1,
                playlist: this.currentVideoId, // Required for loop to work
                playsinline: 1,
                rel: 0
            },
            events: {
                onReady: (event) => {
                    this.tvPlayerReady = true;
                    event.target.playVideo();
                },
                onStateChange: (event) => {
                    // If video ends, play the next one or loop
                    if (event.data === YT.PlayerState.ENDED) {
                        event.target.playVideo();
                    }
                }
            }
        });
    }

    pauseTVPlayer() {
        if (this.tvPlayer && this.tvPlayerReady) {
            this.tvPlayer.pauseVideo();
        }
    }

    resumeTVPlayer() {
        if (this.tvPlayer && this.tvPlayerReady) {
            this.tvPlayer.playVideo();
            this.tvPlayer.mute(); // Always muted in the room
        }
    }

    // ==========================================
    // Cartoons Section (Full Screen Menu)
    // ==========================================

    renderLoadingState() {
        return `
            <div id="featured-player-container">
                <div class="featured-player-loading">
                    <div class="loading-pulse"></div>
                </div>
            </div>
            <h3 class="video-grid-title">All Cartoons</h3>
            <div class="section-grid">
                ${window.UIHelpers.generateSkeletonHTML(6, 'video')}
            </div>
        `;
    }

    renderErrorState() {
        return `
            <div class="video-error">
                <p>Unable to load videos at this time.</p>
                <button onclick="window.youtubeIntegration.retry()" class="retry-button">
                    Try Again
                </button>
                <p class="fallback-link">
                    Visit our <a href="https://www.youtube.com/channel/${this.config.channelId}"
                    target="_blank" rel="noopener">YouTube channel</a> directly.
                </p>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="video-empty">
                <p>No cartoons available yet. Check back soon!</p>
                <p class="fallback-link">
                    Visit our <a href="https://www.youtube.com/channel/${this.config.channelId}"
                    target="_blank" rel="noopener">YouTube channel</a>
                </p>
            </div>
        `;
    }

    renderFeaturedPlayer(videoId) {
        // autoplay=1 and unmuted since user clicked to get here
        return `
            <div id="featured-player-container">
                <div class="featured-player">
                    <iframe
                        id="featured-video-iframe"
                        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1"
                        title="Featured cartoon"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        `;
    }

    renderVideoGrid() {
        return `
            <h3 class="video-grid-title">All Cartoons</h3>
            <div class="section-grid video-grid">
                ${this.videos.map(video => `
                    <div class="section-item video-item ${video.id === this.currentVideoId ? 'now-playing' : ''}"
                         data-video-id="${video.id}"
                         onclick="window.youtubeIntegration.switchVideo('${video.id}')">
                        <div class="video-thumbnail-container">
                            <img
                                src="${video.thumbnail}"
                                alt="${window.DOMUtils.escapeHtml(video.title)}"
                                class="video-thumbnail"
                                loading="lazy"
                            />
                            <div class="play-overlay">
                                <span class="play-icon">&#9658;</span>
                            </div>
                            ${video.id === this.currentVideoId ? '<span class="now-playing-badge">Now Playing</span>' : ''}
                        </div>
                        <h3>${window.DOMUtils.escapeHtml(video.title)}</h3>
                        <p class="video-date">${window.Formatters.formatDate(video.publishedAt)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderContent() {
        if (this.error) {
            return this.renderErrorState();
        }

        if (this.videos.length === 0) {
            return this.renderEmptyState();
        }

        return this.renderFeaturedPlayer(this.currentVideoId) + this.renderVideoGrid();
    }

    stopFeaturedPlayer() {
        const iframe = document.getElementById('featured-video-iframe');
        if (iframe) {
            // Stop playback by clearing the src
            iframe.src = '';
        }
    }

    switchVideo(videoId) {
        // Always scroll to top when a video is clicked
        const sectionContainer = document.getElementById('section-container');
        window.DOMUtils.scrollToTop(sectionContainer);

        if (videoId === this.currentVideoId) return;

        this.currentVideoId = videoId;

        // Update the iframe src
        const iframe = document.getElementById('featured-video-iframe');
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
        }

        // Update now-playing badges using helper
        const container = document.getElementById('cartoons-content');
        window.UIHelpers.toggleNowPlayingBadge(container, '.video-item', videoId, 'videoId');
    }

    async retry() {
        this.cacheManager.clear();
        this.error = null;
        await this.initialize();
    }

    async initialize() {
        const container = document.getElementById('cartoons-content');
        if (!container) return;

        // Pause TV player when opening section
        this.pauseTVPlayer();

        // Show loading state
        container.innerHTML = this.renderLoadingState();

        // Fetch videos (may already be cached from TV player)
        await this.fetchVideos();

        // Set initial video
        if (this.videos.length > 0 && !this.currentVideoId) {
            this.currentVideoId = this.videos[0].id;
        }

        // Render content
        container.innerHTML = this.renderContent();
    }
}

// Global instance
window.youtubeIntegration = new YouTubeIntegration();

// Initialize TV player when page loads
window.DOMUtils.onReady(() => {
    window.youtubeIntegration.initTVPlayer();
});
