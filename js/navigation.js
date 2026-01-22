// Navigation Controller
// Handles transitions between room and content sections

const SECTION_CONTENT = {
    games: {
        title: 'Games',
        content: `
            <h2>Games</h2>
            <p>Welcome to our games collection. Here you'll find interactive experiences created by Snitheads.</p>
            <div class="section-grid">
                <div class="section-item">
                    <div class="item-placeholder">Coming Soon</div>
                    <h3>Game 1</h3>
                    <p>Description of the first game.</p>
                </div>
                <div class="section-item">
                    <div class="item-placeholder">Coming Soon</div>
                    <h3>Game 2</h3>
                    <p>Description of the second game.</p>
                </div>
            </div>
        `
    },
    cartoons: {
        title: 'Cartoons',
        content: `
            <h2>Cartoons</h2>
            <p>Watch our animated creations. From short films to series, explore the world of Snitheads animation.</p>
            <div class="section-grid">
                <div class="section-item">
                    <div class="item-placeholder">Coming Soon</div>
                    <h3>Cartoon 1</h3>
                    <p>Description of the first cartoon.</p>
                </div>
                <div class="section-item">
                    <div class="item-placeholder">Coming Soon</div>
                    <h3>Cartoon 2</h3>
                    <p>Description of the second cartoon.</p>
                </div>
            </div>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2>Contact</h2>
            <p>Get in touch with Snitheads. We'd love to hear from you!</p>
            <div class="contact-info">
                <div class="contact-item">
                    <span class="contact-icon">✉️</span>
                    <span>hello@snitheads.com</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">🐦</span>
                    <span>@snitheads</span>
                </div>
            </div>
        `
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
        const hash = window.location.hash.slice(1);
        if (hash && SECTION_CONTENT[hash]) {
            setTimeout(() => this.showSection(hash, false), 100);
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
            history.pushState({ section: sectionId }, '', `#${sectionId}`);
        }

        // Load content
        this.sectionContent.innerHTML = SECTION_CONTENT[sectionId].content;
        this.sectionContent.classList.add('section-enter');

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
