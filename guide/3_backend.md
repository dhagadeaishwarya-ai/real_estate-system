# Part 3: Backend API & Security Engineering

This module explains the backend's core operations, focusing on JWT security, password hashing, Express controllers, and role-based route access controls.

---

## 1. The JSON Web Token (JWT) Authentication Cycle

Instead of server-side sessions, our system uses standard stateless JWTs. Here is the operational cycle:

```text
[ React Client ]                                             [ Express Server ]
       |                                                             |
       |---- 1. POST /api/auth/login (Credentials) ----------------->|
       |                                                             |-- 2. Compares hash
       |                                                             |-- 3. Signs JWT token
       |<--- 4. Response: { token: "eyJ...", user: {...} } ----------|
       |
  (Saves token
   in localStorage)
       |
       |---- 5. GET /api/bookings (Headers: Auth: Bearer token) ---->|
       |                                                             |-- 6. Verifies signature
       |                                                             |-- 7. Appends req.user
       |                                                             |-- 8. Fetches DB records
       |<--- 9. Response: [ { booking_id: 1, ... } ] ----------------|
```

---

## 2. Password Safety with BcryptJS

Never save a user's password as plain text. In `authController.js`, when a user registers, we calculate a secure hash:

```javascript
// 1. Generate a cryptographic salt (10 rounds is the standard balance of speed and strength)
const salt = await bcrypt.genSalt(10);

// 2. Hash the raw password using the salt
const hashedPassword = await bcrypt.hash(password, salt);
```

During login, we use `bcrypt.compare()` which hashes the input password with the same salt used during registration to see if the resulting hashes match, ensuring the plain-text password is never stored or exposed.

---

## 3. JWT Signing and Expiry

Upon successful login or registration, the server signs a new token:

```javascript
const token = jwt.sign(
  { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' } // Session remains valid for 7 days
);
```

---

## 4. Role-Based Route Authorization Middleware

In `backend/middleware/authMiddleware.js`, we write two key middleware interceptors:

### A. Token Validation: `authenticateToken`
Checks the incoming request's `Authorization` header. If present, it strips the `Bearer ` prefix, validates the token using our system secret, decodes the payload, and appends the decoded details onto the Express Request object as `req.user`.

### B. Role Gatekeeper: `requireRoles(rolesArr)`
A higher-order function that verifies if the authenticated user's role is included in the permitted actions list:

```javascript
function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    // Check if the user's role (e.g. 'buyer') is in the allowed roles (e.g. ['admin', 'agent'])
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}
```

### Applying Roles to Endpoints
In `backend/routes/propRoutes.js`, we apply these guards to enforce permissions:

```javascript
// Anyone can view properties:
router.get('/', getProperties);

// Only authenticated Admins, Agents, or Sellers can list new properties:
router.post('/', authenticateToken, requireRoles(['admin', 'agent', 'seller']), createProperty);
```
