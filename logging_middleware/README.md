# Logging Middleware

A reusable TypeScript logging package for the Affordmed Campus Hiring Evaluation.

## Setup

```bash
npm install
npm run build
```

## Usage

```typescript
import { initLogger, Log, logger } from './logging_middleware/dist';

// Initialise once at startup
initLogger({
  baseUrl: 'http://4.224.186.213',
  accessToken: '<your_bearer_token>',
});

// Use the Log function
await Log('backend', 'info', 'service', 'Notification service started');
await Log('backend', 'error', 'handler', 'received string, expected bool');
await Log('backend', 'fatal', 'db', 'Critical database connection failure.');

// Or use convenience wrappers
await logger.info('frontend', 'component', 'NotificationList mounted');
await logger.warn('frontend', 'api', 'Retrying notification fetch after timeout');
```

## API

### `initLogger(config: LogConfig): void`
Must be called once before any `Log()` calls.

### `Log(stack, level, package, message): Promise<LogResponse | null>`
Sends a log entry to the Affordmed Test Server.

- **stack**: `"backend"` | `"frontend"`
- **level**: `"debug"` | `"info"` | `"warn"` | `"error"` | `"fatal"`
- **package** (backend only): `cache` | `controller` | `cron_job` | `db` | `domain` | `handler` | `repository` | `route` | `service`
- **package** (frontend only): `api` | `component` | `hook` | `page` | `state` | `style`
- **package** (shared): `auth` | `config` | `middleware` | `utils`
- **message**: descriptive log message
