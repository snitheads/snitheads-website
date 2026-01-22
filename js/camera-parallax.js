// Camera Parallax Effect
// Subtly shifts the room image and hotspots based on mouse position
// Uses lerp for smooth, consistent movement speed

(function() {
    const MAX_SHIFT = 60; // Maximum pixels to shift in any direction
    const LERP_FACTOR = 0.02; // Lower = slower, more floaty (0.02 = very slow)

    let roomImage = null;
    let hotspotOverlay = null;
    let tvPlayerContainer = null;

    // Current and target positions
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    function init() {
        roomImage = document.getElementById('room-image');
        hotspotOverlay = document.getElementById('hotspot-overlay');
        tvPlayerContainer = document.getElementById('tv-player-container');
        if (!roomImage) return;

        // Track mouse movement on the room container
        const container = document.getElementById('room-container');
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        // Start animation loop
        animate();
    }

    function handleMouseMove(e) {
        // Get mouse position relative to viewport center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate offset from center (-1 to 1)
        const offsetX = (e.clientX - centerX) / centerX;
        const offsetY = (e.clientY - centerY) / centerY;

        // Set target (move opposite to mouse direction for natural feel)
        targetX = -offsetX * MAX_SHIFT;
        targetY = -offsetY * MAX_SHIFT;
    }

    function handleMouseLeave() {
        // Return to center
        targetX = 0;
        targetY = 0;
    }

    function animate() {
        // Lerp current position toward target
        currentX += (targetX - currentX) * LERP_FACTOR;
        currentY += (targetY - currentY) * LERP_FACTOR;

        // Apply transform
        const transform = `translate(${currentX}px, ${currentY}px)`;
        if (roomImage) {
            roomImage.style.transform = transform;
        }
        if (hotspotOverlay) {
            hotspotOverlay.style.transform = transform;
        }
        if (tvPlayerContainer) {
            tvPlayerContainer.style.transform = transform;
        }

        requestAnimationFrame(animate);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
