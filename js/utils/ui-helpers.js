/**
 * UI Helpers
 * Shared UI rendering utilities
 */

/**
 * Generate skeleton loading HTML
 * @param {number} count - Number of skeleton items
 * @param {string} itemType - Type of item ('video', 'game', 'artwork')
 * @returns {string} HTML string for skeleton items
 */
function generateSkeletonHTML(count, itemType) {
    const skeletonMap = {
        video: `
            <div class="section-item video-item loading">
                <div class="video-thumbnail-container">
                    <div class="loading-pulse"></div>
                </div>
                <h3 class="loading-text-title"></h3>
                <p class="loading-text-date"></p>
            </div>
        `,
        game: `
            <div class="game-item loading">
                <div class="game-thumbnail-container">
                    <div class="game-thumbnail-skeleton"></div>
                </div>
                <h3 class="loading-text-title"></h3>
                <p class="loading-text-desc"></p>
            </div>
        `,
        artwork: `
            <div class="pix-item loading">
                <div class="pix-thumbnail-container">
                    <div class="loading-pulse"></div>
                </div>
            </div>
        `
    };

    const template = skeletonMap[itemType] || skeletonMap.video;
    return Array(count).fill().map(() => template).join('');
}

/**
 * Toggle "Now Playing" badge on items
 * @param {HTMLElement} container - Container element
 * @param {string} itemSelector - Selector for items (e.g., '.video-item')
 * @param {string} activeId - ID of the active item
 * @param {string} dataAttribute - Data attribute to match (e.g., 'videoId')
 * @param {string} badgeText - Text for badge
 */
function toggleNowPlayingBadge(container, itemSelector, activeId, dataAttribute, badgeText = 'Now Playing') {
    if (!container) return;

    container.querySelectorAll(itemSelector).forEach(item => {
        const itemId = item.dataset[dataAttribute];
        const isActive = itemId === activeId;
        const thumbnailContainer = item.querySelector('.video-thumbnail-container, .game-thumbnail-container');
        const existingBadge = thumbnailContainer?.querySelector('.now-playing-badge');

        if (isActive && !existingBadge && thumbnailContainer) {
            const badge = document.createElement('span');
            badge.className = 'now-playing-badge';
            badge.textContent = badgeText;
            thumbnailContainer.appendChild(badge);
        } else if (!isActive && existingBadge) {
            existingBadge.remove();
        }
    });
}

/**
 * Create overlay element
 * @param {string} className - CSS class name
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} Overlay element
 */
function createOverlay(className, innerHTML) {
    const overlay = document.createElement('div');
    overlay.className = className;
    overlay.innerHTML = innerHTML;
    return overlay;
}

// Export to global scope for vanilla JS usage
window.UIHelpers = {
    generateSkeletonHTML,
    toggleNowPlayingBadge,
    createOverlay
};
