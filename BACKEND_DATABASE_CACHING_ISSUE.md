# JsonDatabase Caching Issue - v1.4.1

## Problem
The `JsonDatabase` class is reloading the entire `test-data.json` file from disk **on every query**, instead of loading once at startup and caching in memory.

## Evidence from Logs

```
Created singleton JsonDatabase instance
Attempting to load data... test-data.json  ← Initial load (expected)
Data loaded successfully from C:\omed\wolfmed\data\test-data.json

GET /tp/rooms 200 in 1448ms

Attempting to load data... test-data.json  ← Reload on query (NOT expected!)
Data loaded successfully from C:\omed\wolfmed\data\test-data.json
Finding in collection `rooms` with query: {}
GET /tp/rooms 200 in 285ms

Attempting to load data... test-data.json  ← Another reload!
Data loaded successfully from C:\omed\wolfmed\data\test-data.json
Finding in collection `rooms` with query: {}
GET /tp/rooms 200 in 376ms
```

Pattern: Every query triggers a full database reload from disk.

## Expected Behavior

The singleton pattern should:
1. Load `test-data.json` **once** when `JsonDatabase.getInstance()` is first called
2. Keep data in memory
3. All subsequent queries should use the cached in-memory data
4. Only reload from disk when:
   - Explicitly requested (e.g., `db.reload()`)
   - File changes detected (if file watching is implemented)
   - Server restarts

## Current Behavior

It appears the `load()` method is being called inside query operations:
- `find()`
- `findOne()`
- `insert()`
- `update()`

This causes:
- 250ms+ latency per request (file I/O overhead)
- High disk I/O
- Scaling issues as request volume increases

## Impact

With frontend polling every 30 seconds:
- Student on `/tp/rooms` page = 1 reload every 30s
- Teacher on `/tp` page = 1 reload every 30s
- 10 concurrent users = 10 reloads every 30s = **~1200 disk reads per hour**

With previous 5-second polling:
- 10 concurrent users = **~7200 disk reads per hour**

## Root Cause (Suspected)

Looking at `JsonDatabase` implementation, likely issue:

```typescript
// WRONG - loads on every query
async find(collection: string, query: any) {
  await this.load() // ← This shouldn't be here!
  // ...query logic
}

// CORRECT - load only on initialization
class JsonDatabase {
  private static instance: JsonDatabase
  private data: any = {}
  private loaded = false

  private constructor() {
    // Don't load here - load() can be async
  }

  static getInstance(): JsonDatabase {
    if (!this.instance) {
      this.instance = new JsonDatabase()
      // Load data immediately after creation
      this.instance.ensureLoaded()
    }
    return this.instance
  }

  private async ensureLoaded() {
    if (!this.loaded) {
      await this.load()
      this.loaded = true
    }
  }

  async find(collection: string, query: any) {
    // Don't reload - data already in memory
    // ...query logic using this.data
  }
}
```

## Recommended Fix

### Option 1: Remove load() from Query Methods (Recommended)

```typescript
// In JsonDatabase class

private loaded = false

async load() {
  if (this.loaded) {
    console.log('Database already loaded, skipping...')
    return
  }

  console.log('Attempting to load data...', this.filePath)
  // ... existing load logic
  this.loaded = true
}

async find(collection: string, query: any) {
  // Remove this line:
  // await this.load()

  // Data is already loaded via singleton initialization
  const items = this.data[collection] || []
  // ... rest of query logic
}
```

### Option 2: Add Load Guard (Quick Fix)

```typescript
private lastLoadTime = 0
private LOAD_CACHE_MS = 60000 // Only reload every 60 seconds max

async load() {
  const now = Date.now()
  if (now - this.lastLoadTime < this.LOAD_CACHE_MS) {
    console.log('Using cached data (loaded', (now - this.lastLoadTime) / 1000, 'seconds ago)')
    return
  }

  console.log('Attempting to load data...', this.filePath)
  // ... existing load logic
  this.lastLoadTime = now
}
```

### Option 3: Implement File Watching (Advanced)

```typescript
import { watch } from 'fs'

private setupFileWatch() {
  watch(this.filePath, async (eventType) => {
    if (eventType === 'change') {
      console.log('Database file changed, reloading...')
      this.loaded = false
      await this.load()
    }
  })
}
```

## Testing Checklist

After implementing fix:

- [ ] Server starts → "Attempting to load data" appears **once**
- [ ] Multiple queries → No additional "Attempting to load" logs
- [ ] Insert/Update operations → Changes persist in memory
- [ ] Server restart → Data reloads from disk
- [ ] Response times improve (~250ms → ~10ms for simple queries)

## Frontend Workaround

Until backend fix is deployed, frontend polling has been reduced:
- RoomList: 30 seconds (was 5 seconds)
- WaitingRoomView: 30 seconds (was 10 seconds)

This reduces database load by **6x**, but doesn't solve the root cause.

## Priority

**P1 - High**: This affects performance but not functionality. Should be fixed before v1.5.0 release.

## Related

- Package: `@teaching-playground/core` v1.4.1
- Class: `JsonDatabase`
- Method: `load()`, `find()`, `findOne()`, `insert()`, `update()`
