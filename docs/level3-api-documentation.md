# Level 3 API Documentation

## Overview

The Level 3 API (`/api/level3`) provides backend data management for Level 3: Malware Mayhem gameplay. This API replaces the previous frontend-only data loading system and offers randomized, server-controlled data selection for enhanced gameplay variety.

## Architecture

### Previous System
- Frontend JavaScript loaded JSON files directly
- Client-side random selection of 5 items per category
- All data processing handled in browser

### New System  
- Backend Flask API manages data loading and randomization
- Server-side random selection ensures consistent gameplay
- API endpoints provide structured, validated data
- Frontend receives pre-processed data via HTTP requests

## API Endpoints

### Base URL: `/api/level3`

### 1. Game Data Endpoint
**GET** `/game-data`

Primary endpoint for Level 3 gameplay data.

**Response:**
```json
{
  "success": true,
  "data": {
    "malware": {
      "malware_file.exe": {
        "id": "malware_id",
        "name": "Malware Name", 
        "type": "Ransomware",
        "riskLevel": "Critical",
        "reputationDamage": 25,
        "financialDamage": 50000,
        // ... other malware properties
      }
      // 5 randomly selected malware items
    },
    "processes": {
      "system": [...], // All legitimate system processes
      "gaming": [...], // All gaming processes  
      "application": [...], // All application processes
      "malware": [...] // 5 randomly selected malicious processes
    },
    "encrypted_files": {
      "level3_ransomware_files": [
        {
          "id": "file_001",
          "originalName": "file.ext",
          "priority": "Critical",
          "reputationRecovery": 8,
          // ... other file properties
        }
        // 5 randomly selected encrypted files
      ]
    }
  },
  "summary": {
    "malware_count": 5,
    "malicious_processes_count": 5, 
    "encrypted_files_count": 5,
    "legitimate_processes_count": 12,
    "source": "Level 3 JSON data files with randomization"
  }
}
```

### 2. Data Status Endpoint
**GET** `/data-status`

Provides information about data availability and counts.

**Response:**
```json
{
  "success": true,
  "data_available": true,
  "malware_count": 10,
  "malicious_processes_count": 12,
  "encrypted_files_count": 18,
  "total_legitimate_processes": 12,
  "source_files": [
    "malware-data.json",
    "process-data.json", 
    "encrypted-files-data.json"
  ]
}
```

### 3. Statistics Endpoint  
**GET** `/stats`

Comprehensive statistics about the Level 3 dataset.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_malware": 10,
    "malware_types": {
      "Ransomware": 2,
      "Trojan": 3,
      "Spyware": 2,
      // ... other types
    },
    "total_reputation_damage": 215,
    "total_financial_damage": 403000,
    "total_processes": {
      "system": 6,
      "gaming": 4, 
      "application": 2,
      "malware": 12
    },
    "total_encrypted_files": 18,
    "file_priorities": {
      "Critical": 4,
      "High": 6,
      "Medium": 5,
      "Low": 3
    },
    "total_reputation_recovery": 95,
    "source": "Level 3 JSON data files"
  }
}
```

### 4. Sample Data Endpoint
**GET** `/sample`

Small sample of data for testing purposes.

**Response:**
```json
{
  "success": true,
  "sample_data": {
    "malware": {}, // 2 random malware items
    "malicious_processes": [], // 2 random malicious processes
    "encrypted_files": [] // 2 random encrypted files
  },
  "message": "Sample Level 3 data for testing"
}
```

### 5. Individual Category Endpoints

**GET** `/malware?randomize=true&count=5`
- Returns malware data with optional randomization

**GET** `/processes?randomize=true&count=5`  
- Returns process data with optional randomization

**GET** `/encrypted-files?randomize=true&count=5`
- Returns encrypted files data with optional randomization

## Data Sources

The API loads data from three JSON files:

1. **malware-data.json** - 10 malware entries with comprehensive threat intelligence
2. **process-data.json** - System, gaming, application, and 12 malicious processes  
3. **encrypted-files-data.json** - 18 ransomware-encrypted files with recovery data

## Frontend Integration

### Updated Level3DataManager

The frontend `Level3DataManager` class has been updated to use the API:

```javascript
export class Level3DataManager {
    async loadData() {
        // Loads data from /api/level3/game-data
        const response = await fetch('/api/level3/game-data');
        const apiData = await response.json();
        
        // Data is pre-randomized by backend
        this.selectedMalware = apiData.data.malware;
        this.selectedProcesses = this.buildProcessList(apiData.data.processes);
        this.selectedEncryptedFiles = apiData.data.encrypted_files.level3_ransomware_files;
    }
}
```

### Key Changes

1. **No more client-side JSON fetching** - All data comes from API
2. **Server-side randomization** - Backend selects 5 items per category  
3. **Consistent data structure** - API maintains same interface as previous system
4. **Better error handling** - Centralized error management in backend
5. **Caching support** - Backend caches JSON data to avoid repeated file reads

## Benefits

1. **Performance** - Reduced client-side processing and faster data loading
2. **Consistency** - Server-controlled randomization ensures fair gameplay
3. **Scalability** - Centralized data management enables future enhancements
4. **Maintainability** - Single source of truth for data processing logic
5. **Security** - Server-side validation and sanitization of data
6. **Analytics** - Backend can track data usage patterns
7. **Flexibility** - Easy to add new endpoints or modify data selection logic

## Error Handling

All endpoints include comprehensive error handling:

- **File not found** - Graceful fallback to empty datasets
- **JSON parsing errors** - Detailed error messages and fallbacks  
- **Invalid requests** - Proper HTTP status codes and error descriptions
- **Server errors** - Exception catching with logging

## Caching Strategy

- JSON files are loaded once and cached in memory
- Cache is refreshed on application restart
- Future enhancement: TTL-based cache invalidation

## Testing

Run the test suite:
```bash
python test_app.py       # Basic integration test
python test_game_data.py # Game data endpoint test
```

## Future Enhancements

1. **Database Integration** - Move from JSON files to database storage
2. **Dynamic Difficulty** - Adjust randomization based on user performance
3. **Session Tracking** - Track which data sets were used per session
4. **A/B Testing** - Multiple randomization strategies
5. **Real-time Updates** - WebSocket support for live data updates