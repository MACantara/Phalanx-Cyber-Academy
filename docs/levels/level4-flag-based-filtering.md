# Level 4 Flag-Based File System Filtering

## Overview

The Level 4 CTF system now includes flag-based filtering to show only the files and directories that contain flags relevant to the current session. This prevents confusion by hiding files associated with flags not selected for the current 7-flag session.

## Implementation

### File System Structure Updates

Each file and directory in `ctf-file-system.json` now includes a `flag_ids` array containing the flag IDs associated with that file:

```json
{
  ".bashrc": {
    "type": "file",
    "content": "...",
    "flag_ids": ["WHT-ENV"]
  },
  "/home/admin": {
    "type": "directory",
    "contents": {...},
    "flag_ids": ["WHT-ENV2", "WHT-BACKUP", "WHT-HIST"]
  }
}
```

### API Changes

#### New Endpoints

1. **`/api/level4/hosts-data`** (Modified)
   - Now filters the file system based on the 7 randomly selected flags for the session
   - Only shows files/directories associated with selected flags
   - Includes necessary parent directories for navigation

2. **`/api/level4/hosts-data-full`** (New)
   - Returns the complete unfiltered file system (for debugging)

3. **`/api/level4/test-filtering`** (New)
   - Test endpoint to verify filtering with custom flags
   - Usage: `/api/level4/test-filtering?flags=WHT-ENV,WHT-SRC,WHT-DB`

### Filtering Logic

The filtering system:
1. Identifies files/directories with selected flag IDs
2. Includes parent directories needed for navigation
3. Preserves essential navigation files (like `mission_brief.txt`)
4. Maintains directory structure integrity

### Flag Mappings

All 15 available flags are mapped to specific files:

- **WHT-ENV**: `/home/researcher/.bashrc`
- **WHT-SRC**: `/var/www/html/index.html`
- **WHT-CFG**: `/etc/nginx/nginx.conf`
- **WHT-ENV2**: `/home/admin/.env`
- **WHT-SUID**: `/usr/local/bin/backup_script.sh`
- **WHT-LOG**: `/var/log/nginx/access.log`
- **WHT-COMPL**: `/tmp/ctf_completion.txt`
- **WHT-DB**: `/var/www/html/admin/config.php`
- **WHT-BACKUP**: `/home/admin/backup_script.sh`
- **WHT-SSL**: `/etc/ssl/private/server.key`
- **WHT-CRON**: `/etc/crontab`
- **WHT-PROC**: `/proc/1/environ`
- **WHT-HIST**: `/home/admin/.bash_history`
- **WHT-NET**: `/etc/hosts`
- **WHT-TEMP**: `/tmp/debug.log`

## Benefits

1. **Reduced Confusion**: Users only see files relevant to their current session
2. **Consistent Experience**: Each session presents exactly 7 challenges
3. **Maintained Navigation**: Directory structure remains intact for exploration
4. **Dynamic Content**: Same system works for different flag combinations

## Session-Based Randomization

The system uses `get_selected_flags()` to determine which 7 flags are active for the current session, ensuring consistency throughout the user's CTF experience.

## Testing

Use the test endpoint to verify filtering:
```
/api/level4/test-filtering?flags=WHT-ENV,WHT-SRC,WHT-DB
```

This will show only files associated with environment analysis, source code review, and database credential flags.