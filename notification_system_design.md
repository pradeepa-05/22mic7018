# Notification System Design

## Stage 1

### Problem Statement

The campus notifications application receives a high volume of real-time notifications
(Placements, Results, Events). Users lose track of important notifications due to the noise.
We must build a **Priority Inbox** that always surfaces the top-N most important **unread**
notifications first, where N is user-configurable (10, 15, 20, …).

### Priority Algorithm

Each notification is assigned a **priority score**:

```
priority_score = weight × 10^13 + epoch_milliseconds(Timestamp)
```

**Weights:**

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

Multiplying the weight by `10^13` guarantees that type-based priority **always dominates**
recency. Within the same type, a more recent notification ranks higher.

**Example:**

| Notification            | Type      | Weight | Score (approx)            |
|-------------------------|-----------|--------|---------------------------|
| "Advanced Micro Devices"| Placement | 3      | 3×10^13 + 1745338182000   |
| "mid-sem"               | Result    | 2      | 2×10^13 + 1745338290000   |
| "farewell"              | Event     | 1      | 1×10^13 + 1745338266000   |

Result: Placement beats Result, which beats Event – regardless of timestamp.

### Maintaining Top-N Efficiently

New notifications arrive continuously. To keep the priority inbox up-to-date without
full re-sorts on every update:

- **In-memory min-heap of size N**: As new notifications arrive, compare each against
  the heap's minimum. If the new notification's score exceeds the minimum, evict the
  minimum and insert the new item. This runs in **O(log N)** per insertion.
- **Polling**: The frontend polls `GET /api/notifications/priority?n=N` every 30 seconds
  (configurable). The backend re-computes from the test-server data at each call.
- **Incremental updates (future)**: A WebSocket/SSE channel would push deltas, enabling
  the client to update the heap locally without full re-fetches.

### Architecture (Stage 1)

```
┌──────────────────────────────────────────────────────┐
│               Affordmed Test Server                   │
│  GET /evaluation-service/notifications (protected)    │
│  POST /evaluation-service/logs         (protected)    │
└─────────────────────┬────────────────────────────────┘
                      │ Bearer token (OAuth)
                      ▼
┌──────────────────────────────────────────────────────┐
│            notification_app_be (Node/Express/TS)      │
│                                                       │
│  GET /api/notifications          – all (paginated)   │
│  GET /api/notifications/priority – top-N priority    │
│                                                       │
│  Layers:                                              │
│    route → controller → service → test-server API    │
│    Every layer logs via Logging Middleware            │
└──────────────────────────────────────────────────────┘
```

### Code Structure

```
notification_app_be/src/
├── config/         – env-based config
├── controllers/    – HTTP layer (request/response)
├── middleware/     – requestLogger, errorHandler
├── routes/         – Express routers
├── services/       – business logic (fetch + prioritise)
├── utils/          – logger (calls Affordmed log API)
└── stage1_priority_inbox.ts  – standalone Stage 1 script
```

---

## Stage 2

### Frontend Architecture

```
notification_app_fe/src/
├── api/        – Axios calls to notification_app_be
├── components/ – NotificationCard, Navbar (Material UI)
├── hooks/      – useNotifications, usePriorityNotifications
├── pages/      – index.tsx (All), priority.tsx (Priority Inbox)
├── state/      – viewed/unviewed tracking (localStorage)
├── styles/     – MUI theme
└── utils/      – frontend logger (calls Affordmed log API)
```

### Viewed vs Unread

- Each notification's ID is stored in **localStorage** after the user clicks "Mark as read".
- On mount the hook enriches fetched notifications with a `viewed: boolean` flag by
  checking the local set.
- Unread items are highlighted with a blue border; read items are de-emphasised.
- A red "New" chip and unread count badge make unread items immediately scannable.

### Responsive Design

- **Mobile-first** layout with MUI `Container maxWidth="md"` and responsive `sx` props.
- Navbar collapses labels to icons on small screens.
- Filter chips wrap gracefully on narrow viewports.

### API Query Parameters (Stage 2 Extension)

The Affordmed test server's `GET /evaluation-service/notifications` now supports:

| Parameter          | Description                              |
|--------------------|------------------------------------------|
| `limit`            | Max notifications per page               |
| `page`             | Page number (1-indexed)                  |
| `notification_type`| Filter: `Event` \| `Result` \| `Placement` |

The frontend passes these through the backend proxy at
`GET /api/notifications?limit=10&page=1&notification_type=Placement`.

### Logging Integration

Every significant action is logged to the Affordmed test server:

| Layer       | Examples                                                  |
|-------------|-----------------------------------------------------------|
| page        | Page mount, filter change                                 |
| hook        | Data fetch initiated/completed, error                     |
| api         | Axios call start/success/failure                          |
| component   | (future: render count, interaction events)                |
| state       | (future: bulk mark-as-read)                              |

### Error Handling

- Network failures surface as `<Alert severity="error">` in the UI.
- The logger never throws; failures are silently swallowed to protect the UI.
- HTTP 4xx/5xx from the backend are caught in Axios interceptors and mapped to
  user-friendly error messages.

---

## Logging Middleware Design

```
logging_middleware/src/index.ts
```

### Key Design Decisions

1. **Single `Log(stack, level, package, message)` signature** – matches the evaluation spec.
2. **Lazy initialisation via `initLogger(config)`** – decouples startup from import time.
3. **Silent failure** – any network/auth error is caught and logged to `console.error`
   only; the host application never crashes because of a log call.
4. **Convenience wrappers** – `logger.debug/info/warn/error/fatal` reduce boilerplate.
5. **TypeScript-first** – all enums (Stack, Level, Package) are enforced at compile time,
   preventing invalid values from reaching the API.
