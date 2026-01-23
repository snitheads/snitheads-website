// Hotspot Configuration - Interactive Objects
// Positions are percentages relative to the room image
const HOTSPOTS = [
    {
        id: 'toons',
        label: 'Toons',
        section: 'toons',
        x: 25,
        y: 50,
        width: 80,
        height: 80,
        icon: '📺',
        description: 'Watch our toons'
    },
    {
        id: 'pix',
        label: 'Pix',
        section: 'pix',
        x: 50,
        y: 35,
        width: 80,
        height: 80,
        icon: '🖼️',
        description: 'View our artwork'
    },
    {
        id: 'toys',
        label: 'Toys',
        section: 'toys',
        x: 50,
        y: 75,
        width: 80,
        height: 80,
        icon: '🎮',
        description: 'Play our toys'
    },
    {
        id: 'tunes',
        label: 'Tunes',
        section: 'tunes',
        x: 75,
        y: 50,
        width: 80,
        height: 80,
        icon: '🎵',
        description: 'Listen to tunes'
    }
];

class HotspotManager {
    constructor() {
        this.hotspots = HOTSPOTS;
        this.overlay = document.getElementById('hotspot-overlay');
        this.elements = new Map();

        this.createHotspotElements();
        this.setupEventListeners();
    }

    createHotspotElements() {
        this.hotspots.forEach(hotspot => {
            const element = document.createElement('div');
            element.className = 'hotspot';
            element.dataset.id = hotspot.id;
            element.dataset.section = hotspot.section;
            element.style.cssText = `left: ${hotspot.x}%; top: ${hotspot.y}%; transform: translate(-50%, -50%); width: ${hotspot.width}px; height: ${hotspot.height}px;`;

            element.innerHTML = `
                <div class="placeholder-object ${hotspot.id}" style="width: ${hotspot.width}px; height: ${hotspot.height}px;">
                    <span class="icon">${hotspot.icon}</span>
                    <span class="label">${hotspot.label}</span>
                </div>
                <span class="hotspot-label">${hotspot.description}</span>
            `;

            this.overlay.appendChild(element);
            this.elements.set(hotspot.id, element);
        });
    }

    setupEventListeners() {
        this.elements.forEach((element, id) => {
            element.addEventListener('click', () => this.onHotspotClick(id));
            element.addEventListener('mouseenter', () => this.onHotspotHover(id, true));
            element.addEventListener('mouseleave', () => this.onHotspotHover(id, false));
        });
    }

    onHotspotClick(id) {
        const hotspot = this.hotspots.find(h => h.id === id);
        if (hotspot && typeof navigateToSection === 'function') {
            navigateToSection(hotspot.section);
        }
    }

    onHotspotHover(id, isHovering) {
        const element = this.elements.get(id);
        element.querySelector('.placeholder-object').classList.toggle('hovered', isHovering);
    }
}

// Global hotspot manager instance
let hotspotManager = null;

function initHotspots() {
    hotspotManager = new HotspotManager();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHotspots);
} else {
    initHotspots();
}
