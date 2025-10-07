# xterm.js Terminal Integration

This document describes the xterm.js integration for CyberQuest terminal emulation.

## Overview

The custom JavaScript terminals in Level 4 and Blue Team vs Red Team mode have been replaced with [xterm.js](https://xtermjs.org/), a professional terminal emulation library used by VS Code, Hyper, and other major applications.

## Benefits

### Over Custom Implementation
- **Better UX**: Professional terminal experience with proper cursor handling
- **Built-in Features**: Tab completion, command history, cursor movement all work correctly
- **Less Maintenance**: No need to maintain custom terminal input/output logic
- **Accessibility**: Better screen reader support and keyboard navigation
- **Performance**: Optimized rendering for large outputs
- **Extensibility**: Easy to add features like search, links, etc.

### Key Improvements
1. **Proper cursor movement**: Left/right arrows work correctly within the line
2. **Line editing**: Insert/delete characters anywhere in the command
3. **History navigation**: Up/down arrows to navigate command history
4. **Tab completion**: Works seamlessly with categorized suggestions
5. **Visual feedback**: Smooth cursor blinking and selection
6. **Copy/paste**: Works naturally with standard keyboard shortcuts

## Architecture

### Level 4 Terminal

```
TerminalApp (terminal-app.js)
    ↓
XtermAdapter (terminal/xterm-adapter.js)
    ↓
CommandProcessor (terminal/terminal-functions/command-processor.js)
    ↓
Individual Commands (terminal/terminal-commands/*.js)
```

**Key Files:**
- `app/static/js/simulated-pc/levels/level-four/apps/terminal-app.js` - Main terminal window
- `app/static/js/simulated-pc/levels/level-four/apps/terminal/xterm-adapter.js` - xterm.js integration layer

**Features:**
- Full xterm.js terminal with 24 rows, 1000 line scrollback
- Green-on-black theme matching hacker aesthetic
- Tab completion with categorized suggestions (commands, flags, directories, files)
- Command history with arrow navigation
- CTF flag detection and event emission
- Security command monitoring
- Color-coded output for different content types

### Blue Team Terminal

```
GameController (game-controller.js)
    ↓
BlueTeamXtermAdapter (xterm-adapter.js)
    ↓
Command handlers in GameController
```

**Key Files:**
- `app/static/js/blue-team-vs-red-team-mode/game-controller.js` - Game logic
- `app/static/js/blue-team-vs-red-team-mode/xterm-adapter.js` - xterm.js integration layer
- `app/static/js/blue-team-vs-red-team-mode/ui-manager.js` - UI updates
- `app/templates/blue-team-vs-red-team-mode/dashboard.html` - Dashboard layout

**Features:**
- Compact terminal with 20 rows for dashboard integration
- Timestamped output with success/error/normal indicators
- Command history with arrow navigation
- Clear command support
- Integration with game state and XP system

## Implementation Details

### CDN Integration

xterm.js is loaded from CDN in `app/templates/base.html`:

```html
<!-- xterm.js for terminal emulation -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.min.css" />
<script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.min.js"></script>
```

### Adapter Pattern

Both terminals use an adapter pattern that:
1. Wraps xterm.js API
2. Handles input events (keyboard, special keys)
3. Manages cursor position and line editing
4. Formats output with ANSI color codes
5. Integrates with existing command processors

### Backward Compatibility

The implementation maintains backward compatibility:
- Checks if xterm.js is loaded before using it
- Falls back to console errors if not available
- Preserves all existing command processing logic
- Keeps existing event emission for monitoring
- Maintains fallback UI elements (hidden when xterm active)

## Color Scheme

### Level 4 Terminal
- Background: `#000000` (black)
- Foreground: `#4ade80` (green-400)
- Cursor: `#4ade80` (green-400)
- Red: `#f87171` (errors, suspicious files)
- Yellow: `#facc15` (warnings)
- Blue: `#60a5fa` (suggestions, directories)
- Gray: `#6b7280` (info text)

### Blue Team Terminal
- Same color scheme as Level 4
- Green for success messages
- Red for error messages
- Gray for normal output

## API Reference

### XtermAdapter (Level 4)

```javascript
const adapter = new XtermAdapter(container, commandProcessor, terminalApp);

// Methods
adapter.writeLine(text, className);  // Write output with optional color class
adapter.clear();                      // Clear terminal
adapter.dispose();                    // Clean up
```

### BlueTeamXtermAdapter

```javascript
const adapter = new BlueTeamXtermAdapter(container, gameController);

// Methods
adapter.addOutput(text, type);  // type: 'normal', 'success', 'error'
adapter.clear();                // Clear terminal
adapter.dispose();              // Clean up
```

## Testing

### Manual Testing Checklist

**Level 4 Terminal:**
- [ ] Terminal displays with green text on black background
- [ ] Can type commands
- [ ] Enter executes commands
- [ ] Tab completion shows suggestions
- [ ] Up/Down arrows navigate command history
- [ ] Left/Right arrows move cursor within line
- [ ] Backspace deletes characters
- [ ] Ctrl+C cancels current line
- [ ] Commands execute correctly (help, ls, cat, etc.)
- [ ] Output is color-coded appropriately
- [ ] Flags are detected and events emitted
- [ ] Terminal fits container and resizes properly

**Blue Team Terminal:**
- [ ] Terminal displays in dashboard
- [ ] Can type commands
- [ ] Commands execute (help, status, alerts, etc.)
- [ ] Output is timestamped
- [ ] Success/error colors work
- [ ] Command history works
- [ ] Clear command works
- [ ] Terminal integrates with game state

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (responsive sizing)

## Troubleshooting

### Terminal doesn't appear
- Check browser console for errors
- Verify xterm.js CDN is accessible (not blocked by firewall/adblocker)
- Check if container element exists in DOM

### Terminal appears but input doesn't work
- Check if xterm adapter was initialized properly
- Verify command processor is connected
- Check browser console for JavaScript errors

### Terminal looks wrong
- Verify CSS is loaded
- Check if FitAddon is working (should auto-size)
- Verify container has proper dimensions

### Commands don't execute
- Check if command processor is connected
- Verify command handlers exist
- Check browser console for errors during execution

## Future Enhancements

Potential improvements:
1. **Link detection**: Make URLs and file paths clickable
2. **Search**: Add Ctrl+F to search terminal output
3. **Themes**: Support light/dark theme switching
4. **Persistence**: Save terminal history between sessions
5. **Unicode support**: Enhance unicode rendering
6. **WebGL renderer**: Enable WebGL for better performance
7. **Ligatures**: Support programming ligatures in fonts
8. **Image protocol**: Display images in terminal (sixel/iTerm2)

## References

- [xterm.js Documentation](https://xtermjs.org/docs/)
- [xterm.js GitHub](https://github.com/xtermjs/xterm.js)
- [xterm.js API Reference](https://xtermjs.org/docs/api/terminal/)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)

## Support

For issues or questions about the terminal implementation:
1. Check browser console for errors
2. Verify xterm.js CDN is accessible
3. Review this documentation
4. Check xterm.js documentation for advanced features
