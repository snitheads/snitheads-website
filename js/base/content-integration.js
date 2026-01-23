/**
 * Base Content Integration Class
 * Provides common functionality for all content integration modules
 * (YouTube, Itch.io, Artwork)
 */

class ContentIntegration {
    /**
     * @param {string} containerId - ID of the container element
     * @param {Object} config - Configuration object
     */
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = config;
        this.containerElement = null;
        this.isLoading = false;
        this.error = null;
        this.content = [];
    }

    /**
     * Initialize the integration (template method)
     * Subclasses can override to add custom initialization logic
     */
    async initialize() {
        this.containerElement = document.getElementById(this.containerId);
        if (!this.containerElement) {
            console.error(`Container element #${this.containerId} not found`);
            return;
        }

        // Show loading state
        this.setLoading(true);
        this.renderLoadingState();

        try {
            // Fetch content (implemented by subclasses)
            await this.fetchContent();

            // Render content (implemented by subclasses)
            if (this.error) {
                this.renderErrorState();
            } else if (!this.content || this.content.length === 0) {
                this.renderEmptyState();
            } else {
                this.renderContent();
            }
        } catch (err) {
            this.setError(err.message);
            this.renderErrorState();
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Fetch content - MUST be implemented by subclasses
     */
    async fetchContent() {
        throw new Error('fetchContent() must be implemented by subclass');
    }

    /**
     * Render content - MUST be implemented by subclasses
     */
    renderContent() {
        throw new Error('renderContent() must be implemented by subclass');
    }

    /**
     * Render loading skeleton state
     */
    renderLoadingState() {
        if (!this.containerElement) return;

        const itemType = this.getItemType();
        const itemCount = this.getLoadingItemCount();

        const html = `
            <div class="${this.containerId}-loading">
                ${this.renderLoadingHeader ? this.renderLoadingHeader() : ''}
                <div class="section-grid ${this.containerId}-grid">
                    ${window.UIHelpers.generateSkeletonHTML(itemCount, itemType)}
                </div>
            </div>
        `;

        this.containerElement.innerHTML = html;
    }

    /**
     * Render error state with retry button
     */
    renderErrorState() {
        if (!this.containerElement) return;

        const errorConfig = this.getErrorConfig();

        const html = `
            <div class="${this.containerId}-error">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <h3>${errorConfig.title}</h3>
                <p>${this.error || errorConfig.message}</p>
                ${errorConfig.retryable ? `<button class="retry-button">${errorConfig.retryText}</button>` : ''}
                ${errorConfig.fallbackLink ? `
                    <p class="fallback-link">
                        <a href="${errorConfig.fallbackLink}" target="_blank" rel="noopener noreferrer">
                            ${errorConfig.fallbackText}
                        </a>
                    </p>
                ` : ''}
            </div>
        `;

        this.containerElement.innerHTML = html;

        // Attach retry handler
        if (errorConfig.retryable) {
            const retryBtn = this.containerElement.querySelector('.retry-button');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.retry());
            }
        }
    }

    /**
     * Render empty state when no content available
     */
    renderEmptyState() {
        if (!this.containerElement) return;

        const emptyConfig = this.getEmptyConfig();

        const html = `
            <div class="${this.containerId}-empty">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <h3>${emptyConfig.title}</h3>
                <p>${emptyConfig.message}</p>
                ${emptyConfig.fallbackLink ? `
                    <p class="fallback-link">
                        <a href="${emptyConfig.fallbackLink}" target="_blank" rel="noopener noreferrer">
                            ${emptyConfig.fallbackText}
                        </a>
                    </p>
                ` : ''}
            </div>
        `;

        this.containerElement.innerHTML = html;
    }

    /**
     * Retry fetching content
     */
    async retry() {
        this.error = null;
        await this.initialize();
    }

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
    }

    /**
     * Set error state
     */
    setError(error) {
        this.error = error;
        this.isLoading = false;
    }

    /**
     * Get item type for skeleton loading (override in subclass)
     */
    getItemType() {
        return 'video'; // Default
    }

    /**
     * Get number of skeleton items to show (override in subclass)
     */
    getLoadingItemCount() {
        return 6; // Default
    }

    /**
     * Get error configuration (override in subclass)
     */
    getErrorConfig() {
        return {
            title: 'Unable to Load Content',
            message: 'Something went wrong',
            retryable: true,
            retryText: 'Try Again',
            fallbackLink: null,
            fallbackText: null
        };
    }

    /**
     * Get empty state configuration (override in subclass)
     */
    getEmptyConfig() {
        return {
            title: 'No Content Available',
            message: 'Check back soon!',
            fallbackLink: null,
            fallbackText: null
        };
    }
}

// Export to global scope for vanilla JS usage
window.ContentIntegration = ContentIntegration;
