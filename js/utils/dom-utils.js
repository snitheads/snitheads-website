/**
 * DOM Utilities
 * Shared DOM manipulation and helper functions
 */

/**
 * Execute callback when DOM is ready
 * Consolidates duplicate DOMContentLoaded pattern used across all modules
 */
function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Smooth scroll element to top
 * @param {HTMLElement} element - Element to scroll
 * @param {string} behavior - Scroll behavior ('smooth' or 'auto')
 */
function scrollToTop(element, behavior = 'smooth') {
    if (element) {
        element.scrollTo({ top: 0, behavior });
    }
}

/**
 * Check if a file exists by making a HEAD request (with GET fallback)
 * @param {string} path - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
async function probeFile(path) {
    try {
        // Try HEAD request first (more efficient)
        try {
            const response = await fetch(path, { method: 'HEAD' });
            return response.ok;
        } catch (headError) {
            // Fallback to GET if HEAD fails (some servers don't support HEAD)
            const response = await fetch(path, { method: 'GET' });
            return response.ok;
        }
    } catch {
        return false;
    }
}

// Export to global scope for vanilla JS usage
window.DOMUtils = {
    onReady,
    escapeHtml,
    scrollToTop,
    probeFile
};
