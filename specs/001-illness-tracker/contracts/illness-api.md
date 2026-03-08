# API Contract: Illness Management

**Version**: 1.0.0  
**Date**: 2026-03-08  
**Base URL**: `https://{app}.vercel.app/api`  
**Authentication**: All endpoints require authenticated user context (middleware)

---

## Overview

Endpoints for creating, reading, updating, and deleting illness records. All operations are scoped to the authenticated user.

---

## Endpoints

### 1. GET /illnesses

**Description**: Retrieve all illness records for the authenticated user, organized chronologically.

**Query Parameters**:

| Parameter | Type | Required | Example | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `"resolved"` or `"active"` | Filter by illness status |
| `date_from` | ISO date | No | `"2026-01-01"` | Filter: start date ≥ this date |
| `date_to` | ISO date | No | `"2026-03-31"` | Filter: start date ≤ this date |
| `search` | string | No | `"cold"` | Search illness name (exact match, case-insensitive) |
| `limit` | integer | No | `20` | Pagination: items per page (default 50, max 100) |
| `offset` | integer | No | `0` | Pagination: skip N items (default 0) |

**Request Headers**:
```http
GET /api/illnesses?status=active&limit=20 HTTP/1.1
Host: app.vercel.app
Authorization: Bearer {auth_token}
Content-Type: application/json
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Common Cold",
      "date_started": "2026-02-20",
      "date_ended": "2026-02-27",
      "status": "resolved",
      "symptoms": [
        {
          "name": "Cough",
          "severity": "moderate",
          "duration": "4 days"
        }
      ],
      "cause": "Public transport",
      "photo_count": 1,
      "treatment_count": 3,
      "recovery_days": 7,
      "created_at": "2026-02-20T09:00:00Z",
      "updated_at": "2026-02-27T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "total_pages": 3
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Invalid query parameters (e.g., malformed date)
- `500 Internal Server Error` - Database error

---

### 2. POST /illnesses

**Description**: Create a new illness record.

**Request Headers**:
```http
POST /api/illnesses HTTP/1.1
Host: app.vercel.app
Authorization: Bearer {auth_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Common Cold",
  "date_started": "2026-02-20",
  "symptoms": [
    {
      "name": "Cough",
      "severity": "moderate",
      "duration": "3 days"
    }
  ],
  "cause": "Exposed at work",
  "notes": "Started with scratchy throat"
}
```

**Request Fields** (as per spec data model):

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | 1-255 chars | `"Flu"` |
| `date_started` | ISO date | ✅ Yes | ≤ today, valid date | `"2026-02-20"` |
| `symptoms` | array | No | 0-50 items, each: `{name, severity?, duration?}` | See sample |
| `cause` | string | No | 0-1000 chars | `"Stressed immune system"` |
| `notes` | string | No | 0-5000 chars | `"Using rest and fluids"` |

**Response (201 Created)**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655441001",
  "name": "Common Cold",
  "date_started": "2026-02-20",
  "date_ended": null,
  "status": "active",
  "symptoms": [
    {
      "name": "Cough",
      "severity": "moderate",
      "duration": "3 days"
    }
  ],
  "cause": "Exposed at work",
  "notes": "Started with scratchy throat",
  "created_at": "2026-03-08T10:30:00Z",
  "updated_at": "2026-03-08T10:30:00Z"
}
```

**Response Headers**:
```http
HTTP/1.1 201 Created
Location: /api/illnesses/660e8400-e29b-41d4-a716-446655441001
Content-Type: application/json
```

**Error Responses**:
- `400 Bad Request` - Missing required field, invalid data
  ```json
  {
    "error": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
  ```
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Database error

---

### 3. GET /illnesses/{id}

**Description**: Retrieve a single illness record with associated treatments and photos.

**Path Parameter**:
- `id` (UUID): Illness record ID

**Request Headers**:
```http
GET /api/illnesses/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: app.vercel.app
Authorization: Bearer {auth_token}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Common Cold",
  "date_started": "2026-02-20",
  "date_ended": "2026-02-27",
  "status": "resolved",
  "symptoms": [
    {
      "name": "Cough",
      "severity": "moderate",
      "duration": "4 days"
    }
  ],
  "cause": "Public transport",
  "notes": "Resolved with rest",
  "treatments": [
    {
      "id": "660e9500-e29b-41d4-a716-446655441111",
      "name": "Paracetamol 500mg",
      "type": "medicine",
      "effectiveness": "effective",
      "started_at": "2026-02-20T10:00:00Z",
      "ended_at": "2026-02-22T18:00:00Z"
    }
  ],
  "photos": [
    {
      "id": "770e9500-e29b-41d4-a716-446655442222",
      "description": "Throat inspection",
      "file_id": "vercel-blob://abc123",
      "size_bytes": 3145728,
      "mime_type": "image/jpeg",
      "uploaded_at": "2026-02-21T14:30:00Z"
    }
  ],
  "created_at": "2026-02-20T09:00:00Z",
  "updated_at": "2026-02-27T14:00:00Z"
}
```

**Error Responses**:
- `404 Not Found` - Illness not found or belongs to different user
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Database error

---

### 4. PUT /illnesses/{id}

**Description**: Update an illness record (including marking as resolved with end date).

**Path Parameter**:
- `id` (UUID): Illness record ID

**Request Headers**:
```http
PUT /api/illnesses/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: app.vercel.app
Authorization: Bearer {auth_token}
Content-Type: application/json
```

**Request Body** (all fields optional for PATCH semantics):
```json
{
  "name": "Common Cold (resolved)",
  "date_started": "2026-02-20",
  "date_ended": "2026-02-27",
  "symptoms": [
    {
      "name": "Cough",
      "severity": "mild",
      "duration": "4 days"
    }
  ],
  "cause": "Public transport",
  "notes": "Fully recovered by day 7"
}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Common Cold (resolved)",
  "date_started": "2026-02-20",
  "date_ended": "2026-02-27",
  "status": "resolved",
  ...
  "updated_at": "2026-03-08T15:45:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid data (e.g., date_ended < date_started)
- `404 Not Found` - Illness not found
- `401 Unauthorized` - Not authenticated or user doesn't own record
- `500 Internal Server Error` - Database error

---

### 5. DELETE /illnesses/{id}

**Description**: Delete (or archive) an illness record.

**Path Parameter**:
- `id` (UUID): Illness record ID

**Request Headers**:
```http
DELETE /api/illnesses/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: app.vercel.app
Authorization: Bearer {auth_token}
```

**Response (204 No Content)**:
```http
HTTP/1.1 204 No Content
```

**Error Responses**:
- `404 Not Found` - Illness not found
- `401 Unauthorized` - User doesn't own record
- `500 Internal Server Error` - Database error

**Note**: Deletion cascades to all associated Treatments and Photos.

---

## Error Handling Standard

All errors follow this format:

```json
{
  "error": "{error_message}",
  "error_code": "{ERROR_CODE}",
  "details": [
    {
      "field": "{field_name}",
      "message": "{field_specific_error}"
    }
  ],
  "timestamp": "2026-03-08T10:30:00Z",
  "request_id": "{unique_request_id_for_debugging}"
}
```

**Common Error Codes**:
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Missing or invalid auth
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource doesn't exist
- `CONFLICT` - Constraint violation (e.g., duplicate name + date)
- `INTERNAL_ERROR` - Unexpected server error

---

## Rate Limiting

- **Limit**: 1000 requests per hour per authenticated user
- **Headers**:
  ```http
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 2026-03-08T11:30:00Z
  ```
- **Over limit response**: `429 Too Many Requests`

---

## Response Metadata

All list endpoints include pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "total_pages": 3
  }
}
```

---

## Examples

### Example 1: Create Illness and Mark as Resolved Later

**Step 1: Create**
```bash
curl -X POST https://app.vercel.app/api/illnesses \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Headache",
    "date_started": "2026-03-08",
    "symptoms": [{"name": "Head pain", "severity": "moderate"}],
    "cause": "Stress"
  }'
# Returns: {"id": "abcd1234", "status": "active", ...}
```

**Step 2: Mark Resolved (After 2 days)**
```bash
curl -X PUT https://app.vercel.app/api/illnesses/abcd1234 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "date_ended": "2026-03-10"
  }'
# Returns: {"id": "abcd1234", "status": "resolved", "recovery_days": 2, ...}
```

### Example 2: Search for Past Illnesses

```bash
curl "https://app.vercel.app/api/illnesses?search=cold&status=resolved" \
  -H "Authorization: Bearer {token}"
# Returns: {"data": [{illness records matching "cold"}], "pagination": {...}}
```

---

## TypeScript Interfaces

```typescript
// Request types
interface CreateIllnessRequest {
  name: string; // 1-255 chars, required
  date_started: string; // ISO date, required, ≤ today
  symptoms?: Symptom[]; // 0-50 items
  cause?: string; // 0-1000 chars
  notes?: string; // 0-5000 chars
}

interface UpdateIllnessRequest {
  name?: string;
  date_started?: string;
  date_ended?: string | null;
  symptoms?: Symptom[];
  cause?: string | null;
  notes?: string | null;
}

// Response types
interface IllnessResponse {
  id: string; // UUID
  name: string;
  date_started: string; // ISO date
  date_ended: string | null;
  status: "active" | "resolved";
  symptoms: Symptom[];
  cause: string | null;
  notes: string | null;
  photo_count?: number;
  treatment_count?: number;
  recovery_days?: number;
  created_at: string; // ISO datetime
  updated_at: string;
}

interface ListIllnessResponse {
  data: IllnessResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
  };
}

interface ErrorResponse {
  error: string;
  error_code: string;
  details?: Array<{field: string; message: string}>;
  timestamp: string;
  request_id: string;
}
```

---

## Implementation Notes

1. **User Isolation**: All queries include `WHERE user_id = $1` (from authenticated context)
2. **Timestamps**: All timestamps in UTC; frontend converts to user's timezone
3. **Pagination**: Default 50 items, max 100 per request
4. **Soft Delete**: Currently hard delete; consider soft delete for audit trail (future)
5. **Change History**: Future enhancement to track updates for regression analysis
