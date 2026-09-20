# CampusSaathi API Reference Specification (Stage 3)

Official API specification for the **CampusSaathi** platform — *Your Intelligent Campus Companion*.

---

## 1. Global Architecture & Standards

### 1.1 Response Envelope Format

All responses follow a predictable JSON envelope structure:

#### Success Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation."
  }
}
```

### 1.2 Authentication & Session Mechanism
- **Mechanism**: Cryptographically signed JSON Web Token (JWT via HMAC-SHA256).
- **Transport**: `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookie named `campus_auth_session`.
- **Identity Source**: Strictly resolved from verified session payload (`userId`, `identifier`, `role`, `department`). Client query parameters (e.g. `?studentId=...`) are rejected for authorization.

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates a user and issues an HttpOnly session cookie.

- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "identifier": "STU2024CSE001",
    "password": "Password123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "identifier": "STU2024CSE001",
        "name": "Aarav Sharma",
        "role": "STUDENT",
        "department": "CSE"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Both identifier and password are required." } }`
  - `401 Unauthorized`: `{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid ID or password." } }`

---

### `POST /api/auth/logout`
Terminates the session and invalidates the session cookie.

- **Auth Required**: Optional
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged out successfully."
    }
  }
  ```

---

### `GET /api/auth/me`
Retrieves the safe profile details of the authenticated session.

- **Auth Required**: Yes (`STUDENT`, `TEACHER`, or `ADMIN`)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "identifier": "STU2024CSE001",
        "name": "Aarav Sharma",
        "role": "STUDENT",
        "email": "aarav.sharma@campus.edu",
        "department": "CSE"
      }
    }
  }
  ```
- **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Not authenticated."
    }
  }
  ```

---

## 3. Student Endpoints (`/api/student`)

All student endpoints require an authenticated session where `role === "STUDENT"`. Identity is derived internally from `session.identifier`.

### `GET /api/student/profile`
- **Role**: `STUDENT`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "student": {
        "studentId": "STU2024CSE001",
        "department": "CSE",
        "year": 3,
        "semester": 6,
        "cgpa": 8.84,
        "phone": "+91 98765 43210"
      }
    }
  }
  ```

### `GET /api/student/dashboard`
- **Role**: `STUDENT`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "profile": { ... } | null,
      "marks": [ ... ],
      "timetables": [ ... ],
      "notices": [ ... ],
      "tickets": [ ... ]
    }
  }
  ```

### `GET /api/student/marks`
- **Role**: `STUDENT`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "subjectCode": "CS601",
        "subjectName": "Database Management Systems",
        "semester": 6,
        "internalMarks": 36,
        "endSemMarks": 52,
        "totalMarks": 88,
        "grade": "A+"
      }
    ]
  }
  ```

### `GET /api/student/timetable`
- **Role**: `STUDENT`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "department": "CSE",
        "semester": 6,
        "dayOfWeek": "Monday",
        "slots": [
          {
            "time": "09:30 AM - 10:30 AM",
            "subjectCode": "CS601",
            "subjectName": "Database Management Systems",
            "room": "Room 302"
          }
        ]
      }
    ]
  }
  ```

### `GET /api/student/attendance`
- **Role**: `STUDENT`
- **Note**: Attendance data model pending institutional integration. Strictly returns empty list without fake data.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": []
  }
  ```

### `GET /api/student/tickets`
- **Role**: `STUDENT`
- **Success Response (`200 OK`)**: Returns tickets submitted by this student (`userId === session.identifier`).

---

## 4. Teacher Endpoints (`/api/teacher`)

All teacher endpoints require an authenticated session where `role === "TEACHER"`.

### `GET /api/teacher/profile`
- **Role**: `TEACHER`
- **Success Response (`200 OK`)**: Returns teacher profile and cabin location.

### `GET /api/teacher/dashboard`
- **Role**: `TEACHER`
- **Success Response (`200 OK`)**: Returns assigned lecture slots, notices, and tickets.

### `GET /api/teacher/timetable`
- **Role**: `TEACHER`
- **Success Response (`200 OK`)**: Returns timetable slots where `slots.teacherId === session.identifier`.

### `GET /api/teacher/classes`
- **Role**: `TEACHER`
- **Success Response (`200 OK`)**: Returns unique teaching batches derived from the active timetable, or empty array.

### `GET /api/teacher/tickets`
- **Role**: `TEACHER`
- **Success Response (`200 OK`)**: Returns tickets submitted by this teacher.

---

## 5. Administrator Endpoints (`/api/admin`)

All admin endpoints require an authenticated session where `role === "ADMIN"`. Returns `403 Forbidden` for students and teachers.

### `GET /api/admin/profile`
- **Role**: `ADMIN`
- **Success Response (`200 OK`)**: Returns admin user profile.

### `GET /api/admin/users`
- **Role**: `ADMIN`
- **Query Params**: `?role=STUDENT` / `?role=TEACHER` (optional)
- **Success Response (`200 OK`)**: Returns full directory of system users without password hashes.

### `GET /api/admin/students`
- **Role**: `ADMIN`
- **Success Response (`200 OK`)**: Returns all student records.

### `GET /api/admin/teachers`
- **Role**: `ADMIN`
- **Success Response (`200 OK`)**: Returns all faculty records.

### `GET /api/admin/notices`
- **Role**: `ADMIN`
- **Success Response (`200 OK`)**: Returns all circulars with IDs.

### `GET /api/admin/system`
- **Role**: `ADMIN`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "operational",
      "database": "connected",
      "counts": {
        "users": 34,
        "students": 20,
        "teachers": 10,
        "marks": 60,
        "timetables": 12,
        "tickets": 3,
        "notices": 4
      }
    }
  }
  ```

---

## 6. General Notices & Helpdesk Endpoints

### `GET /api/notices`
- **Auth Required**: Yes (`STUDENT`, `TEACHER`, or `ADMIN`)
- **Success Response (`200 OK`)**: Returns sorted official institutional notices.

### `GET /api/tickets`
- **Auth Required**: Yes
- **Behavior**: Scoped by role. Students and Teachers retrieve only their own tickets (`userId === session.identifier`). Admins retrieve all tickets.

### `POST /api/tickets`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "category": "IT Support",
    "description": "Wi-Fi access point offline in Lab 4.",
    "priority": "HIGH"
  }
  ```
- **Success Response (`201 Created`)**: Returns newly created ticket with generated ticket ID (e.g. `CS-TKT-1004`).

### `GET /api/tickets/[id]`
- **Auth Required**: Yes
- **Behavior**: Retrieves single ticket by `ticketId`. Enforces that non-admin users can only view their own tickets.

---

## 7. Institution & Campus Branding Endpoints (`/api/institution`)

### `GET /api/institution/profile`
- **Auth Required**: No (Public)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Purnachandra Group of Institutions",
      "code": "PGI",
      "tagline": "Knowledge is Power",
      "established": "2017",
      "logo": "/branding/institute-logo.png",
      "logoSvg": "/branding/institute-logo.svg",
      "address": null,
      "website": null,
      "email": null,
      "phone": null
    }
  }
  ```

### `GET /api/institution/branding`
- **Auth Required**: No (Public)
- **Success Response (`200 OK`)**: Returns separate configurations for application branding and institutional branding.

### `GET /api/institution/settings`
- **Auth Required**: No (Public)
- **Success Response (`200 OK`)**: `{ "success": true, "data": {} }`
