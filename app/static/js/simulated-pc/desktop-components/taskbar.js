export class Taskbar {
    constructor(container, windowManager) {
        this.container = container;
        this.windowManager = windowManager;
        this.init();
    }

    init() {
        this.createTaskbar();
        this.bindEvents();
    }

    createTaskbar() {
        this.taskbarElement = document.createElement('div');
        this.taskbarElement.className = 'absolute bottom-0 left-0 w-full h-12 bg-gray-800 border-t border-gray-600 flex items-center px-2.5 shadow-lg';
        this.taskbarElement.innerHTML = `
            <button class="bg-gray-700 border border-gray-600 text-white px-4 py-2 text-xs font-mono hover:bg-green-400 hover:text-black transition-all duration-200 hover:shadow-lg cursor-pointer rounded" id="start-btn">
                <i class="bi bi-grid-3x3-gap mr-1"></i> Quit Simulation
            </button>
        `;
        
        this.container.appendChild(this.taskbarElement);
    }

    bindEvents() {
        // Start button functionality - directly trigger exit
        const startBtn = this.taskbarElement.querySelector('#start-btn');
        startBtn.addEventListener('click', () => {
            this.exitSimulation();
        });
    }

    exitSimulation() {
        window.dispatchEvent(new CustomEvent('exitSimulation'));
    }
}
