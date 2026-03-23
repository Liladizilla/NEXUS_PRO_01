# Odyseus AI Mesh API Specification

## 1. Generation API

### POST /api/generate
Synthesize a new software architecture based on a user prompt.

**Request Body:**
```json
{
  "prompt": "string",
  "agents": "array",
  "feedback": "string (optional)"
}
```

**Response:**
```json
{
  "taskId": "string",
  "plan": {
    "agents": "array",
    "systemLoad": "number",
    "complexity": "number",
    "concurrentUsers": "number",
    "metrics": "array"
  }
}
```

## 2. Task API

### GET /api/tasks/:id
Retrieve the status and result of a generation task.

**Response:**
```json
{
  "status": "string (queued|processing|synthesizing|building|testing|deploying|completed|failed)",
  "progress": "number",
  "result": {
    "projectName": "string",
    "files": "array",
    "stagingUrl": "string"
  },
  "agents": "array",
  "updatedAt": "string"
}
```

## 3. Monitoring API

### GET /api/health
Check the health and status of the Odyseus mesh.

**Response:**
```json
{
  "status": "ok",
  "services": {
    "ai": "online",
    "queue": "online",
    "auth": "online",
    "storage": "online"
  },
  "mesh": "stable",
  "uptime": "number"
}
```

## 4. Error Codes
- **400:** Bad Request (e.g., missing prompt)
- **401:** Unauthorized (e.g., invalid API key)
- **429:** Too Many Requests (Rate limit exceeded)
- **500:** Internal Server Error (Pipeline failure)
