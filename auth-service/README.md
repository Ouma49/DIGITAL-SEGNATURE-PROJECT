# AUTH SERVICE API Documentation 

**Base URL**: `/auth`

## Authentication & User Management Endpoints

---

### `POST /auth/register`

Registers a new user account.

---

**Headers:**

* `Content-Type: application/json`

---

**Request Body:**

```json
{
  "name": "Bilal ALOUI",
  "email": "bilal@example.com",
  "password": "password"
}
```

---

**Input Validation Rules:**

* All fields (`name`, `email`, `password`) are required and must be non-empty.
* Email must follow a valid format: `example@domain.com`.

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "message": "Registration success."
}
```

---

**Client Error Responses:**

* **Missing Fields or Empty Input**

    * **Status Code:** `400 Bad Request`
    * **Body:**

  ```json
  {
    "status": "error",
    "message": "All fields (name, email, password) are required."
  }
  ```

* **Invalid Email Format**

    * **Status Code:** `400 Bad Request`
    * **Body:**

  ```json
  {
    "status": "error",
    "message": "Invalid email format."
  }
  ```

---

**Server Error Response:**

* **Status Code:** `500 Internal Server Error`
* **Body:**

```json
{
  "status": "error",
  "message": "Internal server error."
}
```

---

### `POST /auth/login`

Authenticates a user and returns a JWT along with user information.
Also logs the login attempt with the user's IP and user-agent.

* JWT is generated using the user's ID and role.
---

**Headers:**

* `Content-Type: application/json`
* `User-Agent: <user's browser or client>`
* `X-Forwarded-For: <client IP>` (optional; defaults to `127.0.0.1` if missing)

---

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "YourPassword123"
}
```

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "token": "<jwt_token>",
  "userInfo": {
    "email": "bilal@example.com",
    "fullName": "Bilal ALOUI",
    "organization": "Example Org",   // Empty string if null
    "role": 2                   // User Or 2 for ADMIN, etc.
  }
}
```

---

**Error Response:**

* **Status Code:** `401 Unauthorized`
* **Body:**

```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

## Protected Endpoints

These endpoints require a valid `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### `GET /check-token`

Checks the validity of a JWT access token.

---

**Success Response (Valid Token):**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "valid": true
}
```

---

**Error Responses:**

* **Missing or Malformed Authorization Header:**
* **Status Code:** `401 Unauthorized`

```json
{
  "status": "error",
  "message": "Missing or invalid Authorization header"
}
```

* **Invalid or Expired Token:**
* **Status Code:** `401 Unauthorized`

```json
{
  "status": "error",
  "valid": false
}
```

* **Internal Error During Token Verification:**
* **Status Code:** `401 Unauthorized`

```json
{
  "status": "error",
  "valid": false
}
```

---

### `GET /auth/me`

Retrieves the authenticated user's profile information.

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "userInfo": {
    "email": "user@example.com",
    "fullName": "John Doe",
    "organization": "Example Corp",
    "role": 2
  }
}
```

* `email`: User's email address
* `fullName`: User's full name
* `organization`: Name of the user's organization (empty string if null)
* `role`: User's role 

---

**Error Responses:**

* **401 Unauthorized:**

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

* **404 Not Found:**

```json
{
  "status": "error",
  "message": "User not found"
}
```

---

### `GET /auth/login-history`

Returns the authenticated user's login history, including IP address, user-agent, and timestamp.

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "history": [
    {
      "ipAddress": "192.168.1.10",
      "userAgent": "Mozilla/5.0",
      "loginAt": 1714598312  // Unix timestamp (seconds since epoch)
    },
    ...
  ]
}
```

---

**Error Response (Unauthorized):**

* **Status Code:** `401 Unauthorized`
* **Body:**

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

---

### `PUT /auth/update`

Updates the authenticated user's profile information (full name and organization name).

---


**Request Body:**

```json
{
  "name": "New Full Name",
  "company": "New Organization Name"
}
```

* `name`: **Required**, new full name of the user
* `company`: **Optional**, new organization name

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "userInfo": {
    "email": "bilal@example.com",
    "fullName": "New Full Name",
    "organization": "New Organization Name",
    "role": 2
  }
}
```

---

**Error Responses:**

* **401 Unauthorized:**

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

* **404 Not Found:**

```json
{
  "status": "error",
  "message": "User not found"
}
```

* **500 Internal Server Error (Update Failed):**

```json
{
  "status": "error",
  "message": "Failed to update profile"
}
```
---
### `PUT /auth/update-password`

Allows an authenticated user to change their account password.

---

**Request Body:**

```json
{
  "current-password": "oldPassword123",
  "new-password": "newPassword456",
  "confirm-password": "newPassword456"
}
```

* `current-password`: **Required**, the current password of the user
* `new-password`: **Required**, the new desired password
* `confirm-password`: **Required**, must match the new password

---

**Success Response:**

* **Status Code:** `200 OK`
* **Body:**

```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

---

**Error Responses:**

* **401 Unauthorized (invalid token):**

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

* **401 Unauthorized (wrong current password):**

```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

* **404 Not Found:**

```json
{
  "status": "error",
  "message": "User not found"
}
```

* **400 Bad Request (fields missing):**

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

* **400 Bad Request (passwords don't match):**

```json
{
  "status": "error",
  "message": "New passwords do not match"
}
```

* **500 Internal Server Error (update failed or missing password):**

```json
{
  "status": "error",
  "message": "Failed to update password"
}
```
