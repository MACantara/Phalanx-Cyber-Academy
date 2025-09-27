// Import all terminal commands from terminal-commands directory
import { LsCommand } from '../terminal-commands/ls-command.js';
import { CdCommand } from '../terminal-commands/cd-command.js';
import { CatCommand } from '../terminal-commands/cat-command.js';
import { PwdCommand } from '../terminal-commands/pwd-command.js';
import { WhoamiCommand } from '../terminal-commands/whoami-command.js';
import { ClearCommand } from '../terminal-commands/clear-command.js';
import { HelpCommand } from '../terminal-commands/help-command.js';
import { HistoryCommand } from '../terminal-commands/history-command.js';
import { EchoCommand } from '../terminal-commands/echo-command.js';
import { DateCommand } from '../terminal-commands/date-command.js';
import { UnameCommand } from '../terminal-commands/uname-command.js';
import { NmapCommand } from '../terminal-commands/nmap-command.js';
import { PingCommand } from '../terminal-commands/ping-command.js';
import { FindCommand } from '../terminal-commands/find-command.js';
import { GrepCommand } from '../terminal-commands/grep-command.js';

export class CommandRegistry {
    constructor(processor) {
        this.processor = processor;
        this.commands = this.initializeCommands();
    }

    initializeCommands() {
        return {
            'ls': new LsCommand(this.processor),
            'cd': new CdCommand(this.processor),
            'cat': new CatCommand(this.processor),
            'pwd': new PwdCommand(this.processor),
            'whoami': new WhoamiCommand(this.processor),
            'clear': new ClearCommand(this.processor),
            'help': new HelpCommand(this.processor),
            'history': new HistoryCommand(this.processor),
            'echo': new EchoCommand(this.processor),
            'date': new DateCommand(this.processor),
            'uname': new UnameCommand(this.processor),
            'nmap': new NmapCommand(this.processor),
            'ping': new PingCommand(this.processor),
            'find': new FindCommand(this.processor),
            'grep': new GrepCommand(this.processor)
        };
    }

    getCommand(commandName) {
        return this.commands[commandName.toLowerCase()];
    }

    hasCommand(commandName) {
        return commandName.toLowerCase() in this.commands;
    }

    getAllCommands() {
        return Object.keys(this.commands);
    }

    registerCommand(name, commandInstance) {
        this.commands[name.toLowerCase()] = commandInstance;
    }

    unregisterCommand(name) {
        delete this.commands[name.toLowerCase()];
    }
}
