import { BaseCommand } from './base-command.js';

export class HexdumpCommand extends BaseCommand {
    getHelp() {
        return {
            name: 'hexdump',
            description: 'Display file contents in hexadecimal and ASCII format',
            usage: 'hexdump [options] file',
            options: [
                { flag: '-C', description: 'Canonical hex+ASCII display' },
                { flag: '-x', description: 'Two-byte hexadecimal display' },
                { flag: '-d', description: 'Two-byte decimal display' },
                { flag: '-n length', description: 'Interpret only length bytes of input' },
                { flag: '-s offset', description: 'Skip offset bytes from the beginning' },
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
            this.addOutput('hexdump: missing file operand', 'error');
            this.addOutput('Try \'hexdump --help\' for more information.', 'error');
            return;
        }

        let canonical = false;
        let hexMode = false;
        let decimalMode = false;
        let length = null;
        let offset = 0;
        let filename = '';

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-C') {
                canonical = true;
            } else if (args[i] === '-x') {
                hexMode = true;
            } else if (args[i] === '-d') {
                decimalMode = true;
            } else if (args[i] === '-n' && i + 1 < args.length) {
                length = parseInt(args[i + 1]);
                i++; // Skip next arg
            } else if (args[i] === '-s' && i + 1 < args.length) {
                offset = parseInt(args[i + 1]);
                i++; // Skip next arg
            } else if (!filename) {
                filename = args[i];
            }
        }

        if (!filename) {
            this.addOutput('hexdump: missing file operand', 'error');
            return;
        }

        const content = await this.fileSystem.readFile(this.getCurrentDirectory(), filename);
        
        if (content !== null) {
            const bytes = this.stringToBytes(content);
            
            // Apply offset
            const startBytes = bytes.slice(offset);
            
            // Apply length limit
            const finalBytes = length ? startBytes.slice(0, length) : startBytes;
            
            if (canonical) {
                this.displayCanonical(finalBytes, offset);
            } else if (hexMode) {
                this.displayHex(finalBytes, offset);
            } else if (decimalMode) {
                this.displayDecimal(finalBytes, offset);
            } else {
                // Default canonical format
                this.displayCanonical(finalBytes, offset);
            }
        } else {
            this.addOutput(`hexdump: ${filename}: No such file or directory`, 'error');
        }
    }

    stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    displayCanonical(bytes, startOffset = 0) {
        const result = [];
        
        for (let i = 0; i < bytes.length; i += 16) {
            const chunk = bytes.slice(i, i + 16);
            const address = (startOffset + i).toString(16).padStart(8, '0');
            
            // Hex representation
            const hexParts = [];
            for (let j = 0; j < 16; j += 2) {
                if (j < chunk.length) {
                    const byte1 = chunk[j].toString(16).padStart(2, '0');
                    const byte2 = j + 1 < chunk.length ? chunk[j + 1].toString(16).padStart(2, '0') : '  ';
                    hexParts.push(byte1 + byte2);
                } else {
                    hexParts.push('    ');
                }
            }
            
            // ASCII representation
            const ascii = chunk.map(byte => 
                (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.'
            ).join('').padEnd(16, ' ');
            
            result.push(`${address}  ${hexParts.join(' ')}  |${ascii}|`);
        }
        
        // Add final address
        if (bytes.length > 0) {
            const finalAddress = (startOffset + bytes.length).toString(16).padStart(8, '0');
            result.push(finalAddress);
        }
        
        this.addOutput(result.join('\n'));
    }

    displayHex(bytes, startOffset = 0) {
        const result = [];
        
        for (let i = 0; i < bytes.length; i += 16) {
            const chunk = bytes.slice(i, i + 16);
            const address = (startOffset + i).toString(16).padStart(7, '0');
            
            const hexParts = [];
            for (let j = 0; j < chunk.length; j += 2) {
                const byte1 = chunk[j];
                const byte2 = j + 1 < chunk.length ? chunk[j + 1] : 0;
                const word = (byte2 << 8) | byte1;
                hexParts.push(word.toString(16).padStart(4, '0'));
            }
            
            result.push(`${address} ${hexParts.join(' ')}`);
        }
        
        this.addOutput(result.join('\n'));
    }

    displayDecimal(bytes, startOffset = 0) {
        const result = [];
        
        for (let i = 0; i < bytes.length; i += 16) {
            const chunk = bytes.slice(i, i + 16);
            const address = (startOffset + i).toString(16).padStart(7, '0');
            
            const decParts = [];
            for (let j = 0; j < chunk.length; j += 2) {
                const byte1 = chunk[j];
                const byte2 = j + 1 < chunk.length ? chunk[j + 1] : 0;
                const word = (byte2 << 8) | byte1;
                decParts.push(word.toString().padStart(5, ' '));
            }
            
            result.push(`${address} ${decParts.join(' ')}`);
        }
        
        this.addOutput(result.join('\n'));
    }
}