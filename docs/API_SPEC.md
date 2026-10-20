# API Specification

This document describes the API routes currently visible in `server/index.ts`. It is not a guarantee that every external provider is configured or reachable. Responses can evolve; update this document alongside route changes.

## Generation and task status

### `POST /api/generate`

Starts an asynchronous generation task.

Request body:
```json
{
  "prompt": "string (required, non-empty, maximum 50000 characters)",
  "agents": "array (optional)",
  "feedback": "string (optional)",
  "isHighThinking": "boolean (optional)",
  "agentModels": "object or provider-specific configuration (optional)"
}
```

On acceptance, the route returns a `taskId` and a `plan`. The task is processed asynchronously. The implementation currently includes simulated build, test, and deploy progress stages; these stages must not be interpreted as proof of a real production build, test run, or deployment.

Validation errors include:
- `400`: missing or blank prompt.
- `413`: prompt exceeds the route's length limit.
- Other processing failures are handled by the server error middleware.

### `GET /api/tasks/:id`

Returns the task record when found, or `404` with `{ "error": "Task not found" }`.

Task records can include `status`, `progress`, `result`, `agents`, timestamps, and generated files. Available fields depend on the task stage and generation result. If Firestore is configured, reads and writes depend on valid Firebase configuration and permissions. Without persistent storage, task state is ephemeral.

### Staging files

- `GET /staging/:taskId`
- `GET /staging/:taskId/*`
- `GET /api/staging/:taskId`
- `GET /api/staging/:taskId/*`

These routes serve files from a completed task result. A successful response is not evidence that the generated application has been compiled or tested. Missing files should return `404`; staging isolation and browser-level validation remain important security requirements.

## Developer assistance

### `POST /api/debug`

Request body includes `code` and optional error details. Returns the AI service's debugging result. Missing code returns `400`.

### `POST /api/lint`

Request body includes `code` and optional `language` (defaults to `typescript`). Returns the AI service's lint result. Missing code returns `400`. This is an AI assistance endpoint, not a substitute for running the project's actual compiler or linter.

### `POST /api/format`

Request body includes `code` and optional `language` (defaults to `typescript`). Returns an object containing `formatted`. Missing code returns `400`.

## Status and billing

### `GET /api/health`

Reports configuration signals for AI credentials, queue, GitHub OAuth credentials, and storage. The AI signal checks for configured environment-variable names; it does not verify provider reachability, key validity, quota, or model access. The route returns HTTP `503` when no recognized AI credential is configured and `200` otherwise.

### `GET /api/billing/status`

Reports billing as disabled and checkout/purchase verification as unconfigured. Paid plans must not be activated based on UI state alone.

## General error handling

The server error middleware returns HTTP `500` for unhandled errors. In development, the response may include the error message; production responses use a generic message. Clients should handle network failures, `400`, `404`, `413`, `429`, `500`, and degraded health responses.

## Security and integration boundaries

- Keep provider secrets on the server; do not ship privileged API keys in frontend bundles.
- Do not interpret environment-variable presence as successful provider authentication.
- Configure Firestore and access controls before relying on durable task state.
- Do not claim generated output was built, tested, or deployed unless the corresponding steps actually ran and their results were checked.
