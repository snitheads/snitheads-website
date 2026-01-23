// Navigation Controller
// Handles transitions between room and content sections

const SECTION_CONTENT = {
    toys: {
        title: 'Toys',
        content: `
            <h2>Toys</h2>
            <p>Play interactive experiences created by Snitheads. Explore our collection of games on itch.io.</p>
            <div id="games-content">
                <!-- Games loaded dynamically by itch-integration.js -->
            </div>
        `,
        onLoad: () => {
            if (window.itchIntegration) {
                window.itchIntegration.initialize();
            }
        }
    },
    toons: {
        title: 'Toons',
        content: `
            <h2>Toons</h2>
            <p>Watch our animated creations. From short films to series, explore the world of Snitheads animation.</p>
            <div id="cartoons-content">
                <!-- Videos loaded dynamically by youtube-integration.js -->
            </div>
        `,
        onLoad: () => {
            if (window.youtubeIntegration) {
                window.youtubeIntegration.initialize();
            }
        }
    },
    tunes: {
        title: 'Tunes',
        content: `
            <h2>Tunes</h2>
            <p>Listen to the Snitheads soundtrack.</p>
            <div class="music-player">
                <div class="now-playing">
                    <div class="album-art">
                        <div class="album-art-placeholder"></div>
                    </div>
                    <div class="track-info">
                        <div class="track-title">Select a track</div>
                        <div class="track-artist">--</div>
                    </div>
                </div>
                <div class="progress-container">
                    <span class="time-current">0:00</span>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="time-total">0:00</span>
                </div>
                <div class="player-controls">
                    <button class="control-btn shuffle-btn" title="Shuffle">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
                    </button>
                    <button class="control-btn prev-btn" title="Previous">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="control-btn play-btn" title="Play">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <button class="control-btn next-btn" title="Next">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                    <button class="control-btn loop-btn" title="Loop">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                    </button>
                </div>
                <div class="volume-control">
                    <svg class="volume-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    <div class="volume-slider">
                        <div class="volume-fill"></div>
                    </div>
                </div>
            </div>
            <div class="tracklist">
                <h3 class="tracklist-title">Tracklist</h3>
                <div class="track-items">
                    <div class="track-item loading">
                        <span style="color: rgba(255,255,255,0.5);">Loading tracks...</span>
                    </div>
                </div>
            </div>
        `,
        onLoad: () => {
            if (window.musicPlayer) {
                window.musicPlayer.initialize();
            }
        }
    }
};

class NavigationController {
    constructor() {
        this.currentSection = null;
        this.sectionContainer = document.getElementById('section-container');
        this.sectionContent = document.getElementById('section-content');
        this.roomContainer = document.getElementById('room-container');
        this.backButton = document.getElementById('back-to-room');
        this.isTransitioning = false;

        this.setupEventListeners();
        this.handleInitialRoute();
    }

    setupEventListeners() {
        // Back button
        this.backButton.addEventListener('click', () => this.navigateToRoom());

        // Browser history
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.showSection(e.state.section, false);
            } else {
                this.hideSection(false);
            }
        });

        // Keyboard escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentSection) {
                this.navigateToRoom();
            }
        });
    }

    handleInitialRoute() {
        // Check if redirected from 404.html
        const redirectPath = sessionStorage.getItem('redirect');
        if (redirectPath) {
            sessionStorage.removeItem('redirect');
            const match = redirectPath.match(/^(toys|toons|tunes)\/?$/);
            if (match) {
                const sectionId = match[1];
                history.replaceState({ section: sectionId }, '', `/${sectionId}`);
                setTimeout(() => this.showSection(sectionId, false), 100);
                return;
            }
        }

        // Handle direct visits to section paths
        const pathname = window.location.pathname;
        const match = pathname.match(/\/(toys|toons|tunes)\/?$/);
        const sectionId = match ? match[1] : null;
        if (sectionId && SECTION_CONTENT[sectionId]) {
            setTimeout(() => this.showSection(sectionId, false), 100);
        }
    }

    navigateToSection(sectionId) {
        if (this.isTransitioning) return;
        this.showSection(sectionId, true);
    }

    showSection(sectionId, pushState = true) {
        if (this.isTransitioning || !SECTION_CONTENT[sectionId]) return;

        this.isTransitioning = true;
        this.currentSection = sectionId;

        // Update URL
        if (pushState) {
            history.pushState({ section: sectionId }, '', `/${sectionId}`);
        }

        // Load content
        this.sectionContent.innerHTML = SECTION_CONTENT[sectionId].content;
        this.sectionContent.classList.add('section-enter');

        // Call onLoad callback if exists
        const sectionConfig = SECTION_CONTENT[sectionId];
        if (sectionConfig.onLoad && typeof sectionConfig.onLoad === 'function') {
            sectionConfig.onLoad();
        }

        // Show section container
        this.sectionContainer.classList.remove('fully-hidden');
        requestAnimationFrame(() => {
            this.sectionContainer.classList.remove('hidden');
        });

        // Hide room title
        const roomTitle = document.getElementById('room-title');
        if (roomTitle) roomTitle.style.opacity = '0';

        setTimeout(() => {
            this.isTransitioning = false;
            this.sectionContent.classList.remove('section-enter');
        }, 400);
    }

    hideSection(pushState = true) {
        if (this.isTransitioning || !this.currentSection) return;

        this.isTransitioning = true;

        // Stop any playing video in the section
        if (window.youtubeIntegration) {
            window.youtubeIntegration.stopFeaturedPlayer();
        }

        this.sectionContent.classList.add('section-exit');

        // Update URL
        if (pushState) {
            history.pushState(null, '', window.location.pathname);
        }

        // Fade out section
        this.sectionContainer.classList.add('hidden');

        // Show room title
        const roomTitle = document.getElementById('room-title');
        if (roomTitle) roomTitle.style.opacity = '1';

        setTimeout(() => {
            this.sectionContainer.classList.add('fully-hidden');
            this.sectionContent.classList.remove('section-exit');
            this.currentSection = null;
            this.isTransitioning = false;

            // Resume TV player when returning to room
            if (window.youtubeIntegration) {
                window.youtubeIntegration.resumeTVPlayer();
            }
        }, 400);
    }

    navigateToRoom() {
        this.hideSection(true);
    }
}

// Global navigation instance
let navigationController = null;

// Global function for hotspots to call
function navigateToSection(sectionId) {
    if (navigationController) {
        navigationController.navigateToSection(sectionId);
    }
}

function initNavigation() {
    navigationController = new NavigationController();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
