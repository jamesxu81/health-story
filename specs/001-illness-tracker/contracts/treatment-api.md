# API Contract: Treatment Management

**Version**: 1.0.0  
**Date**: 2026-03-08  
**Base URL**: `https://{app}.vercel.app/api`  
**Authentication**: All endpoints require authenticated user context

---

## Overview

Endpoints for managing treatments/cures associated with an illness record.

---

## Endpoints

### 1. GET /illnesses/{illnessId}/treatments

**Description**: Retrieve all treatments for a specific illness.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID

**Query Parameters**:
- `effectiveness` (optional): Filter by `"effective"` or `"ineffective"`
- `limit` (optional): Pagination limit (default 50)
- `offset` (optional): Pagination offset (default 0)

**Request**:
```http
GET /api/illnesses/550e8400-e29b-41d4-a716-446655440000/treatments HTTP/1.1
Authorization: Bearer {auth_token}
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "660e9500-e29b-41d4-a716-446655441111",
      "illness_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Paracetamol 500mg Every 4 Hours",
      "type": "medicine",
      "effectiveness": "effective",
      "started_at": "2026-02-20T10:00:00Z",
      "ended_at": "2026-02-22T18:00:00Z",
      "notes": "Reduced fever significantly",
      "created_at": "2026-02-20T10:15:00Z",
      "updated_at": "2026-02-22T18:00:00Z"
    },
    {
      "id": "660e9500-e29b-41d4-a716-446655441112",
      "illness_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rest and Fluids",
      "type": "home_remedy",
      "effectiveness": "effective",
      "started_at": "2026-02-20T00:00:00Z",
      "ended_at": null,
      "notes": "Continued throughout recovery",
      "created_at": "2026-02-20T09:00:00Z",
      "updated_at": "2026-02-27T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "total_pages": 1
  }
}
```

**Error Responses**:
- `404 Not Found` - Illness not found
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Database error

---

### 2. POST /illnesses/{illnessId}/treatments

**Description**: Add a new treatment to an illness record.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID

**Request Body**:
```json
{
  "name": "Paracetamol 500mg Every 4 Hours",
  "type": "medicine",
  "effectiveness": "unknown",
  "started_at": "2026-02-20T10:00:00Z",
  "ended_at": null,
  "notes": "Reducing fever and headache"
}
```

**Request Fields**:

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | 1-255 chars | `"Honey and Lemon"` |
| `type` | enum | ✅ Yes | `medicine`, `home_remedy`, `doctor_recommendation` | `"medicine"` |
| `effectiveness` | enum | ✅ Yes | `effective`, `ineffective`, `unknown` | `"unknown"` |
| `started_at` | ISO datetime | ✅ Yes | Valid timestamp | `"2026-02-20T10:00:00Z"` |
| `ended_at` | ISO datetime | No | ≥ started_at if provided | `"2026-02-22T18:00:00Z"` |
| `notes` | string | No | 0-2000 chars | `"Took every 4 hours"` |

**Response (201 Created)**:
```json
{
  "id": "770e9500-e29b-41d4-a716-446655441113",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Paracetamol 500mg Every 4 Hours",
  "type": "medicine",
  "effectiveness": "unknown",
  "started_at": "2026-02-20T10:00:00Z",
  "ended_at": null,
  "notes": "Reducing fever and headache",
  "created_at": "2026-03-08T10:30:00Z",
  "updated_at": "2026-03-08T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Missing required field, invalid data (e.g., ended_at < started_at)
- `404 Not Found` - Illness not found
- `401 Unauthorized` - Not authenticated or user doesn't own illness
- `500 Internal Server Error` - Database error

---

### 3. PUT /illnesses/{illnessId}/treatments/{treatmentId}

**Description**: Update a treatment record (primarily to mark as effective/ineffective).

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID
- `treatmentId` (UUID): Treatment record ID

**Request Body** (all fields optional):
```json
{
  "name": "Paracetamol 500mg Every 4 Hours",
  "effectiveness": "effective",
  "ended_at": "2026-02-22T18:00:00Z",
  "notes": "Reduced fever significantly within 2 hours"
}
```

**Response (200 OK)**:
```json
{
  "id": "660e9500-e29b-41d4-a716-446655441111",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Paracetamol 500mg Every 4 Hours",
  "type": "medicine",
  "effectiveness": "effective",
  "started_at": "2026-02-20T10:00:00Z",
  "ended_at": "2026-02-22T18:00:00Z",
  "notes": "Reduced fever significantly within 2 hours",
  "updated_at": "2026-03-08T15:45:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid data validation
- `404 Not Found` - Treatment or illness not found
- `401 Unauthorized` - User doesn't own illness
- `500 Internal Server Error` - Database error

---

### 4. DELETE /illnesses/{illnessId}/treatments/{treatmentId}

**Description**: Remove a treatment from an illness record.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID
- `treatmentId` (UUID): Treatment record ID

**Request**:
```http
DELETE /api/illnesses/550e8400-e29b-41d4-a716-446655440000/treatments/660e9500-e29b-41d4-a716-446655441111 HTTP/1.1
Authorization: Bearer {auth_token}
```

**Response (204 No Content)**:
```http
HTTP/1.1 204 No Content
```

**Error Responses**:
- `404 Not Found` - Treatment or illness not found
- `401 Unauthorized` - User doesn't own illness
- `500 Internal Server Error` - Database error

---

## Use Cases

### Use Case 1: record treatment → mark effective

**Step 1: Create treatment (before knowing effectiveness)**
```bash
curl -X POST https://app.vercel.app/api/illnesses/abcd1234/treatments \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Paracetamol",
    "type": "medicine",
    "effectiveness": "unknown",
    "started_at": "2026-03-08T10:00:00Z"
  }'
# Returns: {"id": "treat5678", "effectiveness": "unknown"}
```

**Step 2: Update after seeing results**
```bash
curl -X PUT https://app.vercel.app/api/illnesses/abcd1234/treatments/treat5678 \
  -H "Authorization: Bearer {token}" \
  -d '{
    "effectiveness": "effective",
    "ended_at": "2026-03-08T18:00:00Z",
    "notes": "Fever subsided within 2 hours"
  }'
# Returns: {"id": "treat5678", "effectiveness": "effective"}
```

### Use Case 2: View effective treatments for same illness in future

This supports the user's need to "find the cure used" as mentioned in the spec.

**Query**:
```bash
curl "https://app.vercel.app/api/illnesses/abcd1234/treatments?effectiveness=effective" \
  -H "Authorization: Bearer {token}"
# Returns: [list of effective treatments that helped before]
```

---

## TypeScript Interfaces

```typescript
interface CreateTreatmentRequest {
  name: string; // 1-255 chars
  type: "medicine" | "home_remedy" | "doctor_recommendation";
  effectiveness: "effective" | "ineffective" | "unknown";
  started_at: string; // ISO datetime
  ended_at?: string; // ISO datetime, optional, ≥ started_at
  notes?: string; // 0-2000 chars
}

interface UpdateTreatmentRequest {
  name?: string;
  type?: "medicine" | "home_remedy" | "doctor_recommendation";
  effectiveness?: "effective" | "ineffective" | "unknown";
  started_at?: string;
  ended_at?: string | null;
  notes?: string | null;
}

interface TreatmentResponse {
  id: string; // UUID
  illness_id: string;
  name: string;
  type: "medicine" | "home_remedy" | "doctor_recommendation";
  effectiveness: "effective" | "ineffective" | "unknown";
  started_at: string; // ISO datetime
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Implementation Notes

1. **User Isolation**: Verified via parent illness ownership
2. **Effectiveness Tracking**: Critical for trend analysis (US5) - enables "what worked before?" queries
3. **Temporal Data**: started_at/ended_at enable recovery time analysis (future trends feature)
4. **Notes Field**: Stores qualitative feedback ("worked faster than expected", "side effects")
