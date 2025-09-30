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
import { HeadCommand } from '../terminal-commands/head-command.js';
import { TailCommand } from '../terminal-commands/tail-command.js';
import { WcCommand } from '../terminal-commands/wc-command.js';
import { SortCommand } from '../terminal-commands/sort-command.js';
import { UniqCommand } from '../terminal-commands/uniq-command.js';
import { CutCommand } from '../terminal-commands/cut-command.js';
import { AwkCommand } from '../terminal-commands/awk-command.js';
import { SedCommand } from '../terminal-commands/sed-command.js';
import { HexdumpCommand } from '../terminal-commands/hexdump-command.js';
import { HintsCommand } from '../terminal-commands/hints-command.js';
import { SubmitFlagCommand } from '../terminal-commands/submit-flag-command.js';

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
            'grep': new GrepCommand(this.processor),
            'head': new HeadCommand(this.processor),
            'tail': new TailCommand(this.processor),
            'wc': new WcCommand(this.processor),
            'sort': new SortCommand(this.processor),
            'uniq': new UniqCommand(this.processor),
            'cut': new CutCommand(this.processor),
            'awk': new AwkCommand(this.processor),
            'sed': new SedCommand(this.processor),
            'hexdump': new HexdumpCommand(this.processor),
            'hints': new HintsCommand(this.processor),
            'submit-flag': new SubmitFlagCommand(this.processor)
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
