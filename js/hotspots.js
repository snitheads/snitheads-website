// Hotspot Configuration - Interactive Objects
// Positions are percentages relative to the room image
const HOTSPOTS = [
    {
        id: 'cartoons',
        label: 'Cartoons',
        section: 'cartoons',
        x: 20,
        y: 40,
        width: 120,
        height: 150,
        icon: '📺',
        description: 'Watch our cartoons'
    },
    {
        id: 'games',
        label: 'Games',
        section: 'games',
        x: 50,
        y: 45,
        width: 100,
        height: 80,
        icon: '🎮',
        description: 'Play our games'
    },
    {
        id: 'contact',
        label: 'Contact',
        section: 'contact',
        x: 80,
        y: 40,
        width: 90,
        height: 120,
        icon: '📱',
        description: 'Get in touch'
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
