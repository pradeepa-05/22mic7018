# Campus Notification System

Affordmed Campus Hiring Evaluation – Full Stack Track

## Repository Structure

```
<your-roll-number>/
├── logging_middleware/          # Reusable TS logging package
├── notification_app_be/         # Express/TypeScript backend
├── notification_app_fe/         # Next.js/MUI frontend
└── notification_system_design.md
```

---

## Quick Start

### 1. Set your Access Token

After completing the Pre-Test Setup (registration + auth), copy your Bearer token.

**Backend:**
```bash
cd notification_app_be
cp .env.example .env
# Edit .env: set ACCESS_TOKEN=<your_token>
```

**Frontend:**
```bash
cd notification_app_fe
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_ACCESS_TOKEN=<your_token>
```

### 2. Build the Logging Middleware

```bash
cd logging_middleware
npm install
npm run build
```

### 3. Start the Backend

```bash
cd notification_app_be
npm install
npm run dev       # development (ts-node-dev)
# or
npm run build && npm start
```
Backend runs at **http://localhost:5000**

### 4. Run Stage 1 Priority Inbox Script

```bash
cd notification_app_be
npx ts-node src/stage1_priority_inbox.ts
```

### 5. Start the Frontend

```bash
cd notification_app_fe
npm install
npm run dev
```
Frontend runs at **http://localhost:3000**

---

## API Endpoints (Backend)

| Method | Path                               | Description                           |
|--------|------------------------------------|---------------------------------------|
| GET    | /health                            | Health check                          |
| GET    | /api/notifications                 | All notifications (paginated)         |
| GET    | /api/notifications?notification_type=Placement | Filtered by type         |
| GET    | /api/notifications/priority?n=10   | Top-N priority notifications          |

---

## Frontend Pages

| Route      | Description                                      |
|------------|--------------------------------------------------|
| `/`        | All Notifications – filter by type, paginate     |
| `/priority`| Priority Inbox – top-N by weight + recency       |
