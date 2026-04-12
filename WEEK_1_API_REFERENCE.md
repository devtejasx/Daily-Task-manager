# Week 1 Authentication - Complete API Reference

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`  
**Auth Required:** ❌ No  
**Rate Limit:** 5 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

**Required Fields:**
- `email` (string, valid email)
- `name` (string, min 2 chars)
- `password` (string, min 8 chars)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "level": 1,
      "totalXp": 0,
      "streak": 0,
      "theme": "dark",
      "twoFactorEnabled": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDQwMDAwMDAsImV4cCI6MTcwNDYwNDgwMH0.xyz"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**

❌ **(409 Conflict) - Email already exists**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

❌ **(400 Bad Request) - Missing fields**
```json
{
  "success": false,
  "message": "Missing required fields: email, name, password"
}
```

❌ **(400 Bad Request) - Weak password**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecurePassword123!"
  }'
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`  
**Auth Required:** ❌ No  
**Rate Limit:** 10 requests/minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "level": 1,
      "totalXp": 0,
      "streak": 0,
      "theme": "dark"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDQwMDAwMDAsImV4cCI6MTcwNDYwNDgwMH0.xyz"
  },
  "message": "Login successful"
}
```

**Error Responses:**

❌ **(401 Unauthorized) - Invalid credentials**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

❌ **(404 Not Found) - User not found**
```json
{
  "success": false,
  "message": "User not found"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### 3. Get User Profile
**Endpoint:** `GET /auth/profile`  
**Auth Required:** ✅ Yes (Bearer Token)
**Rate Limit:** Unlimited

**Headers Required:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "level": 1,
    "totalXp": 0,
    "streak": 0,
    "theme": "dark",
    "twoFactorEnabled": false,
    "notificationsEnabled": true,
    "language": "en",
    "timezone": "UTC",
    "bio": "",
    "avatar": "",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

**Error Responses:**

❌ **(401 Unauthorized) - No token**
```json
{
  "success": false,
  "message": "No token provided"
}
```

❌ **(401 Unauthorized) - Invalid token**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

❌ **(401 Unauthorized) - Expired token**
```json
{
  "success": false,
  "message": "Token expired"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Update User Profile
**Endpoint:** `PUT /auth/profile`  
**Auth Required:** ✅ Yes (Bearer Token)  
**Rate Limit:** 10 requests/minute

**Headers Required:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "bio": "I love productivity",
  "theme": "light",
  "language": "en",
  "timezone": "America/New_York",
  "notificationsEnabled": true,
  "twoFactorEnabled": false
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Updated",
    "bio": "I love productivity",
    "theme": "light",
    "notificationsEnabled": true,
    "updatedAt": "2024-01-20T11:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**

❌ **(400 Bad Request) - Validation error**
```json
{
  "success": false,
  "message": "Invalid theme value"
}
```

❌ **(401 Unauthorized) - Not authenticated**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "theme": "light"
  }'
```

---

## System Endpoints

### Health Check
**Endpoint:** `GET /health`  
**Auth Required:** ❌ No

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/health
```

---

## Token Format

### JWT Token Structure
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDQwMDAwMDAsImV4cCI6MTcwNDYwNDgwMH0.6tZhf4HzPcTg7H9v8K2j4L1m0N3o5Q6r7S8t9U0v1W
```

### Decoded Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1704000000,
  "exp": 1704604800
}
```

**Token Expiration:** 7 days from creation

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, etc |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Backend error |

---

## Error Handling

### Generic Error Response Format
```json
{
  "success": false,
  "message": "Description of what went wrong",
  "error": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_EXISTS` - Email already registered
- `INVALID_TOKEN` - Token malformed or expired
- `MISSING_FIELDS` - Required fields missing
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `USER_NOT_FOUND` - User doesn't exist
- `SERVER_ERROR` - Internal server error

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Registration                                         │
│ POST /auth/register                                         │
│ → Returns: user + JWT token                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Store Token in localStorage                              │
│ localStorage.setItem('token', jwtToken)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Send Authenticated Request                               │
│ GET /auth/profile                                           │
│ Headers: Authorization: Bearer {token}                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend Validates Token                                  │
│ Middleware checks JWT signature & expiration                │
│ → If valid: Attach userId to request                        │
│ → If invalid: Return 401 Unauthorized                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Return Protected Resource                                │
│ 200 OK with user data                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Integration

### Using the API
```typescript
import { apiClient } from '@/services/api'

// Register
const response = await apiClient.post('/auth/register', {
  email: 'user@example.com',
  name: 'John',
  password: 'SecurePass123!'
})

// Login
const loginResponse = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'SecurePass123!'
})

// Get Profile (token auto-included)
const profile = await apiClient.get('/auth/profile')

// Update Profile
const updated = await apiClient.put('/auth/profile', {
  name: 'Jane',
  theme: 'light'
})
```

### Using the Hook
```typescript
import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, login, register, logout, isLoading } = useAuth()

  const handleRegister = async () => {
    await register('user@example.com', 'John', 'password')
  }

  return (
    <div>
      {user && <p>Welcome, {user.name}</p>}
      <button onClick={handleRegister}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## Testing Tools

### Postman
1. Import the endpoints above into Postman
2. Create variables for `token` and `baseUrl`
3. Set `baseUrl` = `http://localhost:5000/api`
4. Copy token from register/login response into `token` variable
5. Use in request headers: `Authorization: Bearer {{token}}`

### cURL
```bash
# Create a script to test all endpoints
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq -r '.data.token')

echo "Token: $TOKEN"

curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Thunder Client (VS Code Extension)
Similar to Postman but built into VS Code for easier testing during development.

---

## Rate Limiting

**Current Limits:**
- Register: 5 requests/minute per IP
- Login: 10 requests/minute per IP
- Profile: Unlimited

**Rate Limit Headers Returned:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1704090000
```

---

## Security Notes

✅ **Implemented:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- CORS configured for frontend only
- Tokens expire in 7 days
- Password required on registration (min 8 chars)
- Email uniqueness enforced

⚠️ **To Add Later:**
- Token refresh endpoint
- Password reset flow
- Two-factor authentication
- Account lockout after failed logins
- Audit logging

---

## Quick Reference Table

| Operation | Method | Endpoint | Auth | Response |
|-----------|--------|----------|------|----------|
| Health | GET | /health | ❌ | Status |
| Register | POST | /auth/register | ❌ | User + Token |
| Login | POST | /auth/login | ❌ | User + Token |
| Profile | GET | /auth/profile | ✅ | User Data |
| Update | PUT | /auth/profile | ✅ | Updated User |

---

**All endpoints ready for testing! Start with the Health check, then Register, then Login.** 🚀
