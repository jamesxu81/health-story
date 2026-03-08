# API Contract: Photo Management

**Version**: 1.0.0  
**Date**: 2026-03-08  
**Base URL**: `https://{app}.vercel.app/api`  
**Authentication**: All endpoints require authenticated user context

---

## Overview

Endpoints for managing photos associated with illness records. Supports uploading photos to track visual symptoms (rashes, swelling, etc.) and retrieving them.

**Storage**: Vercel Blob Storage with automatic CDN distribution

---

## Endpoints

### 1. GET /illnesses/{illnessId}/photos

**Description**: Retrieve all photos for a specific illness.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID

**Query Parameters**:
- `limit` (optional): Pagination limit (default 20, max 100)
- `offset` (optional): Pagination offset (default 0)

**Request**:
```http
GET /api/illnesses/550e8400-e29b-41d4-a716-446655440000/photos HTTP/1.1
Authorization: Bearer {auth_token}
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "880e9500-e29b-41d4-a716-446655441201",
      "illness_id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Red rash on left arm, day 2 of cold",
      "file_id": "blob:ase_photo_550e8400_1708416000",
      "file_url": "https://blob.vercel-storage.com/ase_photo_550e8400_1708416000.jpeg",
      "mime_type": "image/jpeg",
      "size_bytes": 2048576,
      "uploaded_at": "2026-02-20T14:30:00Z",
      "created_at": "2026-02-20T14:30:00Z"
    },
    {
      "id": "880e9500-e29b-41d4-a716-446655441202",
      "illness_id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Swollen throat, comparison photo",
      "file_id": "blob:ase_photo_550e8400_1708502400",
      "file_url": "https://blob.vercel-storage.com/ase_photo_550e8400_1708502400.png",
      "mime_type": "image/png",
      "size_bytes": 1536000,
      "uploaded_at": "2026-02-21T10:15:00Z",
      "created_at": "2026-02-21T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "total_pages": 1
  }
}
```

**Error Responses**:
- `404 Not Found` - Illness not found
- `401 Unauthorized` - Not authenticated or user doesn't own illness
- `500 Internal Server Error` - Database or storage error

---

### 2. POST /illnesses/{illnessId}/photos

**Description**: Upload a new photo to an illness record.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID

**Request Headers**:
```http
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
- `file` (file, required): Image file (jpeg, png, gif, webp)
- `description` (string, optional): Text description of the photo

**Form Data Constraints**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `file` | binary | ✅ Yes | MIME in {jpeg, png, gif, webp}, size ≤25MB |
| `description` | string | No | 0-500 chars |

**Request Example**:
```bash
curl -X POST "https://app.vercel.app/api/illnesses/550e8400-e29b-41d4-a716-446655440000/photos" \
  -H "Authorization: Bearer {auth_token}" \
  -F "file=@/path/to/photo.jpeg" \
  -F "description=Red rash on left arm, day 2"
```

**Response (201 Created)**:
```json
{
  "id": "880e9500-e29b-41d4-a716-446655441203",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Red rash on left arm, day 2",
  "file_id": "blob:ase_photo_550e8400_1708589400",
  "file_url": "https://blob.vercel-storage.com/ase_photo_550e8400_1708589400.jpeg",
  "mime_type": "image/jpeg",
  "size_bytes": 2457600,
  "uploaded_at": "2026-02-22T09:50:00Z",
  "created_at": "2026-02-22T09:50:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Missing file, wrong mime type, invalid description length
- `413 Payload Too Large` - File exceeds 25MB limit
- `415 Unsupported Media Type` - MIME type not in {jpeg, png, gif, webp}
- `404 Not Found` - Illness not found
- `401 Unauthorized` - Not authenticated or user doesn't own illness
- `500 Internal Server Error` - Storage service error (Vercel Blob)

**Validation**:
```typescript
// File size validation
if (file.size > 25 * 1024 * 1024) {
  throw new Error('File exceeds 25MB limit');
}

// MIME type validation
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error(`Invalid MIME type: ${file.type}`);
}

// Description validation
if (description && description.length > 500) {
  throw new Error('Description exceeds 500 characters');
}
```

---

### 3. GET /illnesses/{illnessId}/photos/{photoId}

**Description**: Retrieve metadata and download URL for a specific photo.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID
- `photoId` (UUID): Photo record ID

**Query Parameters**:
- `redirect` (optional): If true, HTTP 302 redirect to file_url; if false (default), return metadata with URL

**Request**:
```http
GET /api/illnesses/550e8400-e29b-41d4-a716-446655440000/photos/880e9500-e29b-41d4-a716-446655441201 HTTP/1.1
Authorization: Bearer {auth_token}
```

**Response (200 OK)**:
```json
{
  "id": "880e9500-e29b-41d4-a716-446655441201",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Red rash on left arm, day 2 of cold",
  "file_id": "blob:ase_photo_550e8400_1708416000",
  "file_url": "https://blob.vercel-storage.com/ase_photo_550e8400_1708416000.jpeg",
  "mime_type": "image/jpeg",
  "size_bytes": 2048576,
  "uploaded_at": "2026-02-20T14:30:00Z"
}
```

**Response (302 Found)** if `?redirect=true`:
```http
HTTP/1.1 302 Found
Location: https://blob.vercel-storage.com/ase_photo_550e8400_1708416000.jpeg
```

**Error Responses**:
- `404 Not Found` - Photo or illness not found
- `401 Unauthorized` - User doesn't own illness
- `500 Internal Server Error` - Storage error

---

### 4. PUT /illnesses/{illnessId}/photos/{photoId}

**Description**: Update photo metadata (description only; file cannot be replaced).

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID
- `photoId` (UUID): Photo record ID

**Request Body**:
```json
{
  "description": "Red rash on left arm, day 2 - shown to doctor"
}
```

**Response (200 OK)**:
```json
{
  "id": "880e9500-e29b-41d4-a716-446655441201",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Red rash on left arm, day 2 - shown to doctor",
  "file_id": "blob:ase_photo_550e8400_1708416000",
  "file_url": "https://blob.vercel-storage.com/ase_photo_550e8400_1708416000.jpeg",
  "mime_type": "image/jpeg",
  "size_bytes": 2048576,
  "uploaded_at": "2026-02-20T14:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Description exceeds 500 chars
- `404 Not Found` - Photo or illness not found
- `401 Unauthorized` - User doesn't own illness
- `500 Internal Server Error` - Database error

---

### 5. DELETE /illnesses/{illnessId}/photos/{photoId}

**Description**: Remove a photo and delete from blob storage.

**Path Parameters**:
- `illnessId` (UUID): Parent illness record ID
- `photoId` (UUID): Photo record ID

**Request**:
```http
DELETE /api/illnesses/550e8400-e29b-41d4-a716-446655440000/photos/880e9500-e29b-41d4-a716-446655441201 HTTP/1.1
Authorization: Bearer {auth_token}
```

**Response (204 No Content)**:
```http
HTTP/1.1 204 No Content
```

**Error Responses**:
- `404 Not Found` - Photo or illness not found
- `401 Unauthorized` - User doesn't own illness
- `500 Internal Server Error` - Blob storage or database error

---

## Use Cases

### Use Case 1: Upload symptom photo on mobile

**Step 1: Choose photo and description**
```bash
curl -X POST "https://app.vercel.app/api/illnesses/abcd1234/photos" \
  -H "Authorization: Bearer {token}" \
  -F "file=@symptom.jpeg" \
  -F "description=Rash on chest - day 3"
```

**Response**: `{"id": "photo5678", "file_url": "https://blob...", "size_bytes": 2457600}`

### Use Case 2: View progression of photos over time

**Query**:
```bash
curl "https://app.vercel.app/api/illnesses/abcd1234/photos?limit=10" \
  -H "Authorization: Bearer {token}"
```

Returns: List of photos ordered by uploaded_at (supports US5: Analyze treatment trends with visual evidence)

### Use Case 3: Download original resolution for sharing with doctor

**Option A: Get download URL**
```bash
curl "https://app.vercel.app/api/illnesses/abcd1234/photos/photo5678?redirect=true" \
  -H "Authorization: Bearer {token}" \
  -L # follow redirect
```

Returns: Direct CDN URL via HTTP 302 redirect

---

## TypeScript Interfaces

```typescript
interface CreatePhotoRequest {
  file: File; // Multipart file input
  description?: string; // 0-500 chars
}

interface UpdatePhotoRequest {
  description?: string; // 0-500 chars
}

interface PhotoResponse {
  id: string; // UUID
  illness_id: string;
  description: string | null;
  file_id: string; // Reference to Vercel Blob
  file_url: string; // CDN URL for download
  mime_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  size_bytes: number;
  uploaded_at: string; // ISO datetime
  created_at: string;
}

interface PhotoListResponse {
  data: PhotoResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
  };
}
```

---

## Implementation Notes

1. **Storage**: Vercel Blob handles all file I/O; API only stores metadata (id, description, file_id, mime_type, size)
2. **URL Generation**: file_url is provided by Vercel Blob on upload; included in responses for direct CDN access
3. **File Replacement**: Not supported (prevents accidental overwrite); users delete + reupload to change
4. **Cascading Deletes**: When illness is deleted, all photos are deleted from blob storage (enforced in transaction)
5. **Mobile Optimization**: CDN URLs support range requests (resume downloads on unstable connections)
6. **Privacy**: All photos scoped to user's own illnesses via parent illness ownership check
7. **Compression**: Vercel CDN auto-compresses images for mobile networks (transparent to API consumer)
