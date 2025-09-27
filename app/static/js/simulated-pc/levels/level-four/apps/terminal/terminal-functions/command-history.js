export class CommandHistory {
    constructor(maxSize = 100) {
        this.history = [];
        this.maxSize = maxSize;
        this.currentIndex = -1;
    }

    addCommand(command) {
        // Don't add empty commands or duplicate consecutive commands
        if (!command.trim() || (this.history.length > 0 && this.history[this.history.length - 1] === command)) {
            return;
        }

        this.history.push(command);
        
        // Maintain maximum size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        }
        
        this.currentIndex = this.history.length;
    }

    getPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    getNext() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        } else if (this.currentIndex === this.history.length - 1) {
            this.currentIndex = this.history.length;
            return '';
        }
        return null;
    }

    getHistory() {
        return [...this.history];
    }

    reset() {
        this.currentIndex = this.history.length;
    }
}
