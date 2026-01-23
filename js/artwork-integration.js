// Artwork Gallery Integration
// Automatically discovers artwork files from the images/artwork folder
// Add image files (PNG, JPG, GIF, etc.) to images/artwork/ and they'll appear automatically

class ArtworkIntegration {
    constructor() {
        this.artwork = [];
        this.containerElement = null;
        this.isLoading = false;
        this.error = null;
    }

    async initialize() {
        const pixContent = document.getElementById('pix-content');
        if (!pixContent) return;

        this.containerElement = pixContent;
        this.isLoading = true;

        // Show loading state
        this.renderLoadingState();

        // Discover artwork files
        await this.discoverArtwork();
        this.isLoading = false;

        // Render content based on state
        if (this.error && this.artwork.length === 0) {
            this.renderErrorState();
        } else if (this.artwork.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderContent();
        }
    }

    async discoverArtwork() {
        this.artwork = [];
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
        const basePath = 'images/artwork/';

        // First, try to load a manifest if it exists
        try {
            const response = await fetch(basePath + 'manifest.json', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                const files = data.files || [];

                for (const file of files) {
                    const item = this.createArtworkItem(file);
                    if (item) {
                        this.artwork.push(item);
                    }
                }
                return;
            }
        } catch (error) {
            // Manifest not found, fall through to probing
        }

        // Fallback: Probe for files sequentially
        for (let i = 1; i <= 50; i++) {
            let found = false;
            for (const ext of extensions) {
                const filename = `${i}.${ext}`;
                const path = basePath + filename;
                const exists = await window.DOMUtils.probeFile(path);
                if (exists) {
                    const item = this.createArtworkItem(filename);
                    if (item) {
                        this.artwork.push(item);
                    }
                    found = true;
                    break; // Move to next number
                }
            }
            if (!found && i > 1) {
                // Stop probing if we've scanned ahead without finding anything
                break;
            }
        }
    }

    createArtworkItem(filename) {
        const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
        const ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        if (!extensions.includes(ext)) {
            return null;
        }

        // Generate title from filename (remove extension, replace underscores/hyphens with spaces)
        const title = filename
            .substring(0, filename.lastIndexOf('.'))
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

        return {
            id: filename.replace(/\W/g, '_'),
            title: title,
            description: 'Artwork',
            path: `images/artwork/${filename}`
        };
    }

    // Render loading skeleton UI
    renderLoadingState() {
        const html = `
            <div class="pix-loading">
                <div class="section-grid pix-grid">
                    ${window.UIHelpers.generateSkeletonHTML(6, 'artwork')}
                </div>
            </div>
        `;
        this.containerElement.innerHTML = html;
    }

    // Render main content
    renderContent() {
        const html = `
            <div class="section-grid pix-grid">
                ${this.artwork.map(item => `
                    <div class="pix-item" data-artwork-id="${item.id}">
                        <div class="pix-thumbnail-container">
                            <img class="pix-thumbnail" src="${item.path}" alt="${item.title}" loading="lazy">
                            <div class="view-overlay">
                                <div class="view-icon">🔍</div>
                            </div>
                        </div>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        this.containerElement.innerHTML = html;
        this.setupClickHandlers();
    }

    // Setup click handlers for artwork items
    setupClickHandlers() {
        const items = this.containerElement.querySelectorAll('.pix-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const artworkId = item.dataset.artworkId;
                const artwork = this.artwork.find(a => a.id === artworkId);
                if (artwork) {
                    this.openLightbox(artwork);
                }
            });
        });
    }

    // Open lightbox for full-size artwork view
    openLightbox(artwork) {
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.className = 'artwork-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close">&times;</button>
                <img src="${artwork.path}" alt="${artwork.title}" class="lightbox-image">
                <div class="lightbox-info">
                    <h2>${artwork.title}</h2>
                    <p>${artwork.description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Close button handler
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', () => {
            lightbox.remove();
        });

        // Click outside to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });

        // Keyboard escape to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                lightbox.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Render error state
    renderErrorState() {
        const html = `
            <div class="pix-empty">
                <p>Unable to load artwork gallery</p>
            </div>
        `;
        this.containerElement.innerHTML = html;
    }

    // Render empty state
    renderEmptyState() {
        const html = `
            <div class="pix-empty">
                <p>No artwork available yet</p>
            </div>
        `;
        this.containerElement.innerHTML = html;
    }
}

// Global instance
window.artworkIntegration = new ArtworkIntegration();
