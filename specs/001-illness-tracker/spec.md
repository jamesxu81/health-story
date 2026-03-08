# Feature Specification: Health Records & Illness Tracker

**Feature Branch**: `001-illness-tracker`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "Build an application that can help me organize my health records. illness can be recorded with detailed symptoms, what caused it and upload photos if needed, and should able to view history for same ill, and find the cure used, timeline, trend etc"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Illness with Symptoms & Causes (Priority: P1)

A user experiences an illness and wants to create a detailed record in the system. They need to document what symptoms they're experiencing, what they believe caused the illness, and when it started.

**Why this priority**: This is the core value of the application—the primary action that all other features depend on. Without the ability to record illnesses, there's no data to view or analyze.

**Independent Test**: User can successfully create and save an illness record with symptoms and causes. This can be tested independently by verifying the record appears in the system and can be retrieved.

**Acceptance Scenarios**:

1. **Given** user is on the create illness page, **When** user enters illness name, symptoms, cause, and date, **Then** system saves the record and shows confirmation
2. **Given** user enters multiple symptoms (comma-separated or list format), **When** user saves, **Then** all symptoms are stored and linked to the illness
3. **Given** user enters cause of illness, **When** user saves, **Then** cause is stored with the illness record
4. **Given** user leaves a required field empty, **When** user attempts to save, **Then** system shows validation error and prevents save

---

### User Story 2 - Upload & Attach Photos to Illness Records (Priority: P2)

A user wants to attach photos to their illness records for visual documentation (e.g., rash photos, test results, prescriptions). They need to upload one or more photos and associate them with an illness record.

**Why this priority**: Photos provide visual evidence and medical documentation value. This is essential for conditions with visible symptoms and for storing medical test result images. High user value but doesn't block use of the system if unavailable.

**Independent Test**: User can upload photos to an illness record and retrieve them later. This can be tested independently by creating a record, uploading photos, and verifying they appear when viewing the record.

**Acceptance Scenarios**:

1. **Given** user is viewing an illness record, **When** user clicks "add photo" and selects a file, **Then** photo is uploaded and displayed
2. **Given** user has uploaded photos, **When** user views the illness record, **Then** photos are displayed in a gallery or list
3. **Given** user attempts to upload a non-image file, **When** user submits, **Then** system rejects the file and shows error message
4. **Given** user wants to remove a photo, **When** user clicks delete on a photo, **Then** photo is removed from the record

---

### User Story 3 - View Illness History & Timeline (Priority: P1)

A user wants to view all their past illness records organized chronologically. They need to see a complete history of illnesses with dates, symptoms, and associated information to understand their health patterns.

**Why this priority**: Once records exist, viewing them is essential to derive value from the system. This enables users to identify patterns and understand their health journey. Critical for MVP.

**Independent Test**: User can view a list of all past illness records sorted by date. This can be tested by creating multiple illness records and verifying they appear in chronological order.

**Acceptance Scenarios**:

1. **Given** user has created illness records, **When** user navigates to history view, **Then** all illnesses are displayed sorted by most recent first
2. **Given** user views the illness history, **When** user clicks on an illness, **Then** detailed view of that illness record is displayed
3. **Given** user has had multiple illnesses, **When** user views history, **Then** timeline shows clear dates for each illness
4. **Given** illness history is empty, **When** user views history page, **Then** system shows helpful message "No illness records yet"

---

### User Story 4 - Track Cures & Treatments Used (Priority: P2)

A user wants to record what treatments or cures were effective for each illness. They need to document medications, home remedies, doctor recommendations, and whether they worked.

**Why this priority**: Treatment tracking is valuable for future reference ("What helped when I had this before?") but doesn't block core recording functionality. Enhances the history value significantly.

**Independent Test**: User can add treatments to an illness record and mark them as effective or ineffective. This can be tested by creating an illness, adding treatments, and verifying they're stored and retrievable.

**Acceptance Scenarios**:

1. **Given** user has an illness record, **When** user clicks "add treatment" and enters treatment details, **Then** treatment is linked to the illness
2. **Given** user has added treatments, **When** user marks a treatment as "effective" or "ineffective", **Then** status is saved
3. **Given** user views an illness record with treatments, **When** user searches for past illnesses, **Then** they can see which treatments worked before
4. **Given** user is viewing an illness without treatments, **When** user clicks "add treatment", **Then** treatment form appears

---

### User Story 5 - Analyze Trends & Patterns (Priority: P3)

A user wants to see patterns and trends across their illness history. This includes frequency of specific illnesses, seasonal patterns, recurring symptoms, and recovery times.

**Why this priority**: Trend analysis is a value-add feature that helps users understand their health better but isn't essential for core functionality. Can be deferred to later phases.

**Independent Test**: System generates trend reports showing frequency of illnesses, seasonal patterns, or symptom clusters. This can be tested by creating multiple illness records and verifying trend calculations are accurate.

**Acceptance Scenarios**:

1. **Given** user has multiple illness records over time, **When** user views trends dashboard, **Then** system shows frequency of each illness type
2. **Given** user has illness data spanning multiple seasons, **When** user views seasonal trends, **Then** system highlights which illnesses are more common in which seasons
3. **Given** user has multiple illnesses with similar symptoms, **When** user views symptom clustering, **Then** system groups illnesses with common symptoms
4. **Given** user has recovery time data, **When** user views trends, **Then** system shows average recovery time per illness type

---

### Edge Cases

- What happens when user uploads a very large photo (>50MB)?
- How does system handle if user tries to view an illness record for another user's account?
- What happens if network connection drops during photo upload?
- How does system handle duplicate illness records for the same condition on the same date?
- What happens if user deletes an illness record—is it permanently deleted or archived?
- How does system handle when user has no records yet?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new illness record with a name, date, symptoms, and cause
- **FR-002**: System MUST store and associate multiple symptoms with a single illness record
- **FR-003**: System MUST provide a photo upload capability that accepts common image formats (JPG, PNG, GIF, WebP)
- **FR-004**: System MUST display uploaded photos associated with an illness record in a viewable gallery
- **FR-005**: System MUST allow users to retrieve and view complete history of all past illness records
- **FR-006**: System MUST organize illness history chronologically (most recent first)
- **FR-007**: System MUST allow users to add, edit, and delete treatments/cures associated with an illness
- **FR-008**: System MUST allow marking treatments as effective or ineffective for reference
- **FR-009**: System MUST support searching/filtering illness history by illness name, date range, or symptoms
- **FR-010**: System MUST provide trend analysis showing frequency of recurrent illnesses
- **FR-011**: System MUST calculate and display average recovery time for each illness type
- **FR-012**: System MUST generate seasonal trend insights if sufficient data exists
- **FR-013**: System MUST validate that illness name and date are provided before allowing record creation; symptoms and cause are optional
- **FR-014**: System MUST enforce a maximum file size of 25MB on photo uploads to support high-resolution medical images
- **FR-015**: System MUST provide users the ability to edit existing illness records (with change history optional)

### Key Entities

- **Illness Record**: Represents a single illness episode
  - Attributes: ID, name, date_started, date_ended (optional), symptoms (array), cause, notes
  - Relationships: Has many Photos, Has many Treatments, Has many History entries

- **Symptom**: Describes a symptom of an illness
  - Attributes: ID, name, severity (mild/moderate/severe), duration
  - Relationships: Belongs to Illness

- **Photo/Attachment**: A photo or document attached to an illness record
  - Attributes: ID, file_name, file_path, upload_date, description (optional)
  - Relationships: Belongs to Illness

- **Treatment/Cure**: A treatment used for an illness
  - Attributes: ID, name, type (medicine/home_remedy/doctor_recommendation), effectiveness (effective/ineffective/unknown), date_started, date_ended (optional), notes
  - Relationships: Belongs to Illness

- **Health Timeline**: A chronological view of all health events
  - Attributes: illness_records[], sorted by date
  - Derived from: All Illness Records

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create an illness record with symptoms and cause in under 2 minutes
- **SC-002**: Photo uploads (up to 10MB) complete successfully in under 30 seconds on standard network
- **SC-003**: System can retrieve and display illness history for 100+ records in under 2 seconds
- **SC-004**: Users can search illness history and get results in under 1 second for datasets up to 500 records
- **SC-005**: System displays illness timeline accurately with 100% date ordering accuracy
- **SC-006**: 95% of photo uploads succeed on first attempt with clear error messages for failures
- **SC-007**: Trend analysis calculations are accurate and complete within 3 seconds even for users with 10+ years of records
- **SC-008**: User can view trend dashboard without technical knowledge (UX should be self-explanatory)
- **SC-009**: System prevents accidental data loss (e.g., delete confirmation, undo option, or archive instead of delete)
- **SC-010**: System achieves WCAG 2.1 AA accessibility compliance for all core features

## Assumptions

- Users will record illnesses with reasonable accuracy (dates, symptoms, causes)
- Photos will be from standard smartphone or camera sources (reasonable file sizes)
- The application is primarily for personal use (single-user per account, not shared medical records)
- Data retention policy: Records are kept indefinitely unless user deletes them
- Internet connection required for photo upload; core recording can work offline if designed
- Authentication is handled separately (out of scope for this feature)
- Data privacy/security compliance follows general best practices: all data encrypted at rest and in transit, users can request data deletion, activity logging for security audits

## Open Questions

- Should the system support exporting records (PDF, CSV) for sharing with doctors?
- Should there be a "similar illness" suggestion feature based on past records?
- Should users be able to set reminders for follow-ups on chronic illnesses?
- Should the system track medication interactions or side effects?
