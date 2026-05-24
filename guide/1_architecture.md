# Part 1: High-Level System Architecture

Welcome! This guide is designed to walk you through the structural blueprint of the **NovaReal Real Estate Property Management System**, helping you understand exactly **what** technologies are used, **why** they were chosen, and **how** they communicate.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React Client (Port 5173)]
        A[React Pages / Views] -->|Reads state| B(AuthContext & State)
        A -->|Triggers actions| C[Axios Client Services]
        C -->|Includes JWT Token| D[Authorization Header]
    end

    subgraph Backend [Node & Express API (Port 5000)]
        E[Express Server] -->|Validates JWT| F[Auth Middleware]
        E -->|Routes Traffic| G[Controllers]
        G -->|Executes SQL| H[MySQL Connection Pool]
    end

    subgraph Database [Relational SQL Store (Port 3306)]
        I[(MySQL Database)]
    end

    C -->|HTTP API Requests| E
    H -->|Reads/Writes| I
```

---

## 2. Technology Stack Selection Rationale

### A. The Core Language: JavaScript
* **Single Language across stack**: Using JavaScript for both the frontend (ReactJS) and the backend (Node.js) allows sharing parsing logic, reducing context-switching, and speeding up development.

### B. Frontend Framework: ReactJS (Vite Engine)
* **What**: React is a component-driven UI library. Vite is a modern frontend build tool that is significantly faster than legacy environments (like Create React App).
* **Why**: React's virtual DOM manages UI rendering dynamically. When data changes (e.g. searching properties), React updates only the affected card components instead of reloading the page.

### C. Backend API: Node.js & Express.js
* **What**: Node.js executes JS outside the browser. Express.js is a minimal, flexible web server framework for Node.
* **Why**: Node's asynchronous, non-blocking I/O model handles high-concurrency connections efficiently. Express lets us write RESTful endpoints (e.g. `/api/properties`) with minimal boilerplates.

### D. Relational Storage: MySQL
* **What**: MySQL is a standard, robust Relational Database Management System (RDBMS).
* **Why**: Real estate platforms depend on **relational integrity**. Properties are owned by specific users (Sellers/Agents) and bookings associate a specific Buyer with a specific Property. Using foreign keys ensures that if a user deletes their account, their active properties and visits cascade-delete cleanly, avoiding orphaned or corrupted database rows.

---

## 3. Package Directory & Package Descriptions

To build this ecosystem, we utilized standard npm libraries. Here is what they are and why they are present:

### Backend Dependencies (`backend/package.json`)
* **`express`**: Web framework for bootstraping server routing, parameters parsing, and middleware chains.
* **`mysql2`**: Promisified driver for MySQL. Allows using modern `async/await` syntax instead of standard callback structures, yielding much cleaner code.
* **`bcryptjs`**: Cryptographic password hashing library. Never store plain text passwords! Bcrypt salts and hashes passwords so they remain fully protected even if a database breach occurs.
* **`jsonwebtoken` (JWT)**: Secure credential token signing. Generates a cryptographically signed compact string to verify user roles and identity between requests without server-side sessions.
* **`cors`**: Express middleware enabling Cross-Origin Resource Sharing. Restricts or allows our frontend domain (on port `5173`) to safely communicate with our backend server (on port `5000`).
* **`dotenv`**: Environment variables manager. Loads configurations from a `.env` file into Node's `process.env` dynamically, protecting keys.
* **`nodemon` (Dev only)**: Automatically monitors source files and restarts the server process on code saves.

### Frontend Dependencies (`frontend/package.json`)
* **`react-router-dom`**: Full client-side routing manager. Simulates multi-page loading by dynamically loading page components without triggering heavy browser page refreshes.
* **`axios`**: Promisified HTTP request client. Allows establishing an API connection instance, registering request/response interceptors, and executing standard HTTP calls.
* **`lucide-react`**: Vector icons set. Standard library providing visually striking, light, and customizable SVG icons (e.g. `MapPin`, `Bed`, `Home`, etc.) matching premium design guidelines.
