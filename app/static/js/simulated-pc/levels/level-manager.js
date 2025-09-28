/**
 * Level Manager - Centralized loading and management of all levels
 */


export class LevelManager {
    constructor() {
        this.levels = new Map();
        this.currentLevel = null;
        this.loadedModules = new Map();
        
        // Level configs will be loaded dynamically when needed
    }

    async loadLevelConfig(levelId) {
        if (this.loadedModules.has(levelId)) {
            return this.loadedModules.get(levelId);
        }

        let levelConfig;
        try {
            switch (levelId) {
                case 1:
                    const level1Module = await import('./level-one/level-config.js');
                    levelConfig = level1Module.Level1Config;
                    break;
                case 2:
                    const level2Module = await import('./level-two/level-config.js');
                    levelConfig = level2Module.Level2Config;
                    break;
                case 3:
                    const level3Module = await import('./level-three/level-config.js');
                    levelConfig = level3Module.Level3Config;
                    break;
                case 4:
                    const level4Module = await import('./level-four/level-config.js');
                    levelConfig = level4Module.Level4Config;
                    break;
                case 5:
                    const level5Module = await import('./level-five/level-config.js');
                    levelConfig = level5Module.Level5Config;
                    break;
                default:
                    throw new Error(`Unknown level ID: ${levelId}`);
            }
            
            this.loadedModules.set(levelId, levelConfig);
            this.registerLevel(levelConfig);
            return levelConfig;
        } catch (error) {
            console.error(`Failed to load level ${levelId} config:`, error);
            throw error;
        }
    }
    
    registerLevel(config) {
        this.levels.set(config.id, config);
    }
    
    async loadLevel(levelId) {
        // First load the config if not already loaded
        let config = this.levels.get(levelId);
        if (!config) {
            config = await this.loadLevelConfig(levelId);
        }
        
        console.log(`Loading Level ${levelId}: ${config.name}`);
        console.log(`Level-specific modules will be loaded dynamically for optimal performance`);
        
        try {
            // Load level-specific modules
            await this.loadLevelModules(levelId, config);
            this.currentLevel = config;
            return config;
        } catch (error) {
            console.error(`Failed to load level ${levelId}:`, error);
            throw error;
        }
    }
    
    async loadLevelModules(levelId, config) {
        const levelPath = `./level-${this.getLevelWord(levelId)}`;
        
        // Load dialogues
        for (const dialogue of config.dialogues) {
            try {
                const module = await import(`${levelPath}/dialogues/${dialogue}.js`);
                this.loadedModules.set(`${levelId}-dialogue-${dialogue}`, module);
            } catch (error) {
                console.warn(`Failed to load dialogue ${dialogue} for level ${levelId}:`, error);
            }
        }
        
        // Load level-specific apps if they exist
        try {
            const appsModule = await import(`${levelPath}/apps/index.js`);
            this.loadedModules.set(`${levelId}-apps`, appsModule);
        } catch (error) {
            // Apps module is optional
            console.log(`No custom apps module for level ${levelId}`);
        }
        
        // Load level-specific data if it exists
        try {
            const dataModule = await import(`${levelPath}/data/index.js`);
            this.loadedModules.set(`${levelId}-data`, dataModule);
        } catch (error) {
            // Data module is optional
            console.log(`No custom data module for level ${levelId}`);
        }
        
        // Load special features for level 5
        if (levelId === 5) {
            try {
                const evidenceTracker = await import(`${levelPath}/evidence-tracker.js`);
                const scoringSystem = await import(`${levelPath}/scoring-system.js`);
                
                this.loadedModules.set(`${levelId}-evidence-tracker`, evidenceTracker);
                this.loadedModules.set(`${levelId}-scoring-system`, scoringSystem);
            } catch (error) {
                console.warn(`Failed to load level 5 special features:`, error);
            }
        }
    }
    
    getLevelWord(levelId) {
        const words = ['one', 'two', 'three', 'four', 'five'];
        return words[levelId - 1] || levelId.toString();
    }
    
    getLevel(levelId) {
        return this.levels.get(levelId);
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getLoadedModule(key) {
        return this.loadedModules.get(key);
    }
    
    getAllLevels() {
        return Array.from(this.levels.values());
    }
    
    unloadLevel() {
        if (this.currentLevel) {
            console.log(`Unloading Level ${this.currentLevel.id}: ${this.currentLevel.name}`);
            this.loadedModules.clear();
            this.currentLevel = null;
        }
    }
}

// Global instance
export const levelManager = new LevelManager();
