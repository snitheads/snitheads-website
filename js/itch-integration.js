// itch.io Games Integration
// Handles displaying games from the snitheads itch.io profile

const ITCH_CONFIG = {
    username: 'snitheads',
    profileUrl: 'https://snitheads.itch.io'
};

// Demo games configuration - update with real games when published to snitheads.itch.io
// Each game needs: id, title, description, thumbnail, embedUrl, gameUrl
const DEMO_GAMES = [
    {
        id: 'game-1',
        title: 'Coming Soon',
        description: 'Your first game will appear here',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EGame 1%3C/text%3E%3C/svg%3E',
        embedUrl: '#',
        gameUrl: 'https://snitheads.itch.io',
        publishedAt: new Date()
    },
    {
        id: 'game-2',
        title: 'Coming Soon',
        description: 'Your second game will appear here',
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%23999" text-anchor="middle" dominant-baseline="middle"%3EGame 2%3C/text%3E%3C/svg%3E',
        embedUrl: '#',
        gameUrl: 'https://snitheads.itch.io',
        publishedAt: new Date()
    }
];

class ItchIntegration {
    constructor(config = {}) {
        this.config = { ...ITCH_CONFIG, ...config };
        this.games = [];
        this.currentGameId = null;
        this.containerElement = null;
        this.isLoading = false;
        this.error = null;
    }

    // Fetch games from demo configuration or update for real API calls
    async fetchGames() {
        try {
            // Currently uses demo games
            // When real games are published, replace with API call
            this.games = [...DEMO_GAMES];
            this.error = null;
            return this.games;
        } catch (error) {
            console.error('Error fetching games:', error);
            this.error = error.message;
            this.games = [];
            return [];
        }
    }

    // Initialize the games section
    async initialize() {
        const gamesContent = document.getElementById('games-content');
        if (!gamesContent) return;

        this.containerElement = gamesContent;
        this.isLoading = true;

        // Show loading state
        this.renderLoadingState();

        // Fetch games
        await this.fetchGames();
        this.isLoading = false;

        // Render content based on state
        if (this.error) {
            this.renderErrorState();
        } else if (this.games.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderContent();
            // Set first game as current
            this.currentGameId = this.games[0].id;
            this.loadFeaturedGame(this.games[0].id);
        }
    }

    // Render loading skeleton UI
    renderLoadingState() {
        const html = `
            <div class="toys-loading">
                <div class="featured-game-loading">
                    <div class="featured-game-skeleton"></div>
                </div>
                <h3 class="toys-grid-title">Games</h3>
                <div class="section-grid toys-grid">
                    ${window.UIHelpers.generateSkeletonHTML(3, 'game')}
                </div>
            </div>
        `;
        this.containerElement.innerHTML = html;
    }

    // Render main content
    renderContent() {
        const html = `
            <div id="featured-game-container" class="featured-game-container">
                <div class="featured-game">
                    <div id="featured-game-player"></div>
                </div>
                <div id="featured-game-info" class="featured-game-info">
                    <h3 id="featured-game-title"></h3>
                    <p id="featured-game-desc"></p>
                    <a id="featured-game-link" class="game-link" target="_blank" rel="noopener noreferrer">
                        Play on itch.io
                    </a>
                </div>
            </div>
            <h3 class="toys-grid-title">All Games</h3>
            <div class="section-grid toys-grid">
                ${this.games.map(game => `
                    <div class="game-item" data-game-id="${game.id}">
                        <div class="game-thumbnail-container">
                            <img class="game-thumbnail" src="${game.thumbnail}" alt="${game.title}" loading="lazy">
                            <div class="play-overlay">
                                <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                            ${this.currentGameId === game.id ? '<span class="now-playing-badge">Now Playing</span>' : ''}
                        </div>
                        <h3>${game.title}</h3>
                        <p>${game.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        this.containerElement.innerHTML = html;

        // Attach click handlers to game items
        this.containerElement.querySelectorAll('.game-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const gameId = item.dataset.gameId;
                this.loadFeaturedGame(gameId);
            });
        });
    }

    // Load a game in the featured player
    loadFeaturedGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        this.currentGameId = gameId;

        // Update featured game display
        const playerDiv = document.getElementById('featured-game-player');
        const titleEl = document.getElementById('featured-game-title');
        const descEl = document.getElementById('featured-game-desc');
        const linkEl = document.getElementById('featured-game-link');

        if (playerDiv) {
            if (game.embedUrl !== '#') {
                // Real game embed
                playerDiv.innerHTML = `
                    <iframe
                        src="${game.embedUrl}"
                        allowfullscreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        loading="lazy">
                    </iframe>
                `;
            } else {
                // Demo game - show placeholder
                playerDiv.innerHTML = `
                    <div class="game-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 6h-7V3H10v3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H4V8h16v10zm-6-3.5l2.5 3h3V9h-3l-2.5 3.5L12 9H9v9h3l2-2.5z"/>
                        </svg>
                        <p>${game.title}</p>
                        <p>Coming soon to snitheads.itch.io</p>
                    </div>
                `;
            }
        }

        // Update game info
        if (titleEl) titleEl.textContent = game.title;
        if (descEl) descEl.textContent = game.description;
        if (linkEl) {
            linkEl.href = game.gameUrl;
            linkEl.style.display = game.embedUrl !== '#' ? 'inline-block' : 'none';
        }

        // Update "Now Playing" badges using helper
        window.UIHelpers.toggleNowPlayingBadge(this.containerElement, '.game-item', gameId, 'gameId');
    }

    // Render error state
    renderErrorState() {
        const html = `
            <div class="toys-error">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-2h-2v2h2v-2zm0-2h-2v2h2v-2z"/>
                </svg>
                <h3>Unable to Load Games</h3>
                <p>${this.error || 'Something went wrong'}</p>
                <button class="retry-btn">Try Again</button>
                <a href="${this.config.profileUrl}" target="_blank" rel="noopener noreferrer" class="game-link">
                    Visit itch.io Profile
                </a>
            </div>
        `;
        this.containerElement.innerHTML = html;

        // Add retry handler
        this.containerElement.querySelector('.retry-btn')?.addEventListener('click', () => {
            this.initialize();
        });
    }

    // Render empty state
    renderEmptyState() {
        const html = `
            <div class="toys-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <h3>No Games Yet</h3>
                <p>Games will appear here when published to itch.io</p>
                <a href="${this.config.profileUrl}" target="_blank" rel="noopener noreferrer" class="game-link">
                    Check itch.io Profile
                </a>
            </div>
        `;
        this.containerElement.innerHTML = html;
    }
}

// Global instance
window.itchIntegration = new ItchIntegration();
