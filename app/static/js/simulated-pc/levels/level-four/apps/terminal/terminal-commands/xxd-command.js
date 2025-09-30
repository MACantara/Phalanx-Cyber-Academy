import { BaseCommand } from './base-command.js';

export class XxdCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'xxd',
            description: 'Make a hexdump or do the reverse',
            usage: 'xxd [options] [file]',
            options: [
                { flag: 'file', description: 'File to dump in hex format' },
                { flag: '-l len', description: 'Stop after writing len octets' },
                { flag: '-s offset', description: 'Start at offset bytes abs.' },
                { flag: '--help', description: 'Display this help and exit' }
            ]
        };
    }

    async execute(args) {
        if (args.includes('--help')) {
            this.showHelp();
            return;
        }

        if (args.length === 0) {
            this.addOutput('xxd: missing file operand', 'error');
            return;
        }

        let length = null;
        let offset = 0;
        let filename = args[args.length - 1];

        // Parse options
        for (let i = 0; i < args.length - 1; i++) {
            if (args[i] === '-l' && i + 1 < args.length - 1) {
                length = parseInt(args[i + 1]);
            } else if (args[i] === '-s' && i + 1 < args.length - 1) {
                offset = parseInt(args[i + 1]);
            }
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const bytes = this.stringToBytes(content);
            this.displayHexDump(bytes, offset, length);
            
            // Check for hidden flags in hex data
            if (content.includes('WHT{') || content.includes('flag')) {
                this.addOutput('# Hex analysis may reveal hidden data patterns', 'text-blue-400');
            }
        } else {
            this.addOutput(`xxd: ${filename}: No such file or directory`, 'error');
        }
    }

    stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    displayHexDump(bytes, startOffset = 0, maxLength = null) {
        const end = maxLength ? Math.min(startOffset + maxLength, bytes.length) : bytes.length;
        
        for (let i = startOffset; i < end; i += 16) {
            const offset = i.toString(16).padStart(8, '0');
            const hexBytes = [];
            const asciiChars = [];
            
            for (let j = 0; j < 16; j++) {
                if (i + j < end) {
                    const byte = bytes[i + j];
                    hexBytes.push(byte.toString(16).padStart(2, '0'));
                    asciiChars.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
                } else {
                    hexBytes.push('  ');
                    asciiChars.push(' ');
                }
                
                if (j === 7) {
                    hexBytes.push(' ');
                }
            }
            
            this.addOutput(`${offset}: ${hexBytes.join(' ')} |${asciiChars.join('')}|`);
        }
    }
}