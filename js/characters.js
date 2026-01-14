// Walking Characters Configuration
// Adjust these values to customize the behavior
const CONFIG = {
    characterCount: 10,                          // Number of characters on screen
    characterGifs: ['images/walk.gif'],    // Array of GIF paths (add more for variety)
    minSpeed: 0.5,                              // Minimum movement speed
    maxSpeed: 1,                                // Maximum movement speed
    characterSize: 64,                          // Character size in pixels
    clickAnimationDuration: 300                 // Click animation duration in ms
};

// Character class
class WalkingCharacter {
    constructor(gifPath) {
        this.element = document.createElement('img');
        this.element.src = gifPath;
        this.element.className = 'walking-character';
        this.element.style.width = CONFIG.characterSize + 'px';
        this.element.style.height = CONFIG.characterSize + 'px';
        this.element.draggable = false;

        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.paused = false;

        this.element.addEventListener('click', () => this.onClick());
        this.element.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onClick();
        });
    }

    spawn() {
        // Random position within viewport
        const maxX = window.innerWidth - CONFIG.characterSize;
        const maxY = window.innerHeight - CONFIG.characterSize;
        this.x = Math.random() * maxX;
        this.y = Math.random() * maxY;

        // Random velocity
        this.setRandomDirection();

        this.updatePosition();
        document.getElementById('character-container').appendChild(this.element);
    }

    setRandomDirection() {
        const speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
        const angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.updateFlip();
    }

    updateFlip() {
        // Flip character based on horizontal direction
        if (this.dx > 0) {
            this.element.classList.add('character-flip');
        } else {
            this.element.classList.remove('character-flip');
        }
    }

    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    move() {
        if (this.paused) return;

        this.x += this.dx;
        this.y += this.dy;

        const maxX = window.innerWidth - CONFIG.characterSize;
        const maxY = window.innerHeight - CONFIG.characterSize;

        // Bounce off edges
        if (this.x <= 0 || this.x >= maxX) {
            this.dx *= -1;
            this.x = Math.max(0, Math.min(this.x, maxX));
            this.updateFlip();
        }
        if (this.y <= 0 || this.y >= maxY) {
            this.dy *= -1;
            this.y = Math.max(0, Math.min(this.y, maxY));
        }

        this.updatePosition();
    }

    onClick() {
        if (this.paused) return;

        this.paused = true;
        this.element.classList.add('character-clicked');

        setTimeout(() => {
            this.element.classList.remove('character-clicked');
            this.setRandomDirection();
            this.paused = false;
        }, CONFIG.clickAnimationDuration);
    }
}

// Main controller
const CharacterController = {
    characters: [],

    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('character-container')) {
            const container = document.createElement('div');
            container.id = 'character-container';
            document.body.appendChild(container);
        }

        // Create characters
        for (let i = 0; i < CONFIG.characterCount; i++) {
            const gifPath = CONFIG.characterGifs[i % CONFIG.characterGifs.length];
            const character = new WalkingCharacter(gifPath);
            character.spawn();
            this.characters.push(character);
        }

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    },

    animate() {
        this.characters.forEach(char => char.move());
        requestAnimationFrame(() => this.animate());
    },

    onResize() {
        // Keep characters within bounds after resize
        const maxX = window.innerWidth - CONFIG.characterSize;
        const maxY = window.innerHeight - CONFIG.characterSize;

        this.characters.forEach(char => {
            char.x = Math.min(char.x, maxX);
            char.y = Math.min(char.y, maxY);
            char.updatePosition();
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CharacterController.init());
} else {
    CharacterController.init();
}
