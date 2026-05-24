# Real Estate Property Management System - Walkthrough

We have successfully designed, built, and compiled a premium, full-stack **Real Estate Property Management System** called **NovaReal** using **ReactJS, Node.js, Express.js, MySQL, and Vanilla CSS**.

Additionally, to assist you in learning, we created a dedicated side folder: [guide/](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/) containing five comprehensive documentation modules walking you through structural blueprints, security, database logic, React variables, and CSS mechanics.

---

## What We Accomplished

### 1. Unified Setup & Database Bootstrapping
- **Schema & Seeding**: Created [schema.sql](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/schema.sql) mapping `users`, `properties`, `property_images`, and `bookings` tables.
- **Autopilot Database Connection**: Developed [db.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/config/db.js) which connects to MySQL on startup, auto-creates the database and tables if missing, hashes default credentials, and inserts three high-end residential/commercial spaces with interior/exterior galleries on the fly!

### 2. Secure Backend Rest API Services
- **User Authentication**: Integrated `bcryptjs` password hashing and signed JSON Web Tokens (JWT) inside [authController.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/controllers/authController.js).
- **Property Listings & Visit Schedule Management**: Developed complete CRUD endpoints with advanced active database filters in [propController.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/controllers/propController.js) and visit tour scheduling pipelines in [bookController.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/controllers/bookController.js).
- **Admin Control Panel**: Implemented stats aggregate counts in [adminController.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/controllers/adminController.js) along with account editing/deletions.

### 3. State-of-the-Art ReactJS Frontend
- **Design Token Style Sheet**: Formulated [index.css](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/frontend/src/index.css) utilizing an obsidian dark glassmorphism theme, glowing indicators, responsive auto-fitting grids, and page slides micro-animations.
- **SessionContext & API Interceptors**: Programmed global session parameters in [AuthContext.jsx](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/frontend/src/context/AuthContext.jsx) and automatic JWT request interceptors in [api.js](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/frontend/src/services/api.js).
- **Interactive Loan EMI Calculator**: Built sliders for amount, interest rates, and loan durations inside [LoanCalculator.jsx](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/frontend/src/components/LoanCalculator.jsx) with graphical splits.
- **Role-Based Dynamic Views**: Developed tailor-made layouts for:
  - **Buyers**: Book tours, evaluate finance parameters, and monitor scheduling statuses.
  - **Sellers/Agents**: Publish properties, upload galleries, and review appointment requests.
  - **Admins**: Access overall user accounts registry to edit roles or prune listings.

---

## Learning Guides Library (`guide/` Folder)

You can read the modules directly from your workspace:
1. [1_architecture.md](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/1_architecture.md) — System Architecture, diagrams, and descriptions of npm packages.
2. [2_database.md](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/2_database.md) — ER database diagrams, table column structures, and foreign key relations.
3. [3_backend.md](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/3_backend.md) — REST API routing mechanisms, Bcrypt password hashing, and custom authorization middleware.
4. [4_frontend.md](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/4_frontend.md) — Global React Context sessions, Axios request interceptors, and dynamic filtering.
5. [5_styling.md](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/guide/5_styling.md) — HSL CSS design tokens, Glassmorphism, CSS Grids, and transitions.

---

## Instructions to Run the Project Locally

Follow these three simple steps to start the application:

### Step 1: Start your local MySQL Server
- Open XAMPP, WAMP, or your native MySQL administrator.
- Ensure the MySQL service is started and running on port **3306**.
- (If your MySQL `root` user has a custom password, adjust the `DB_PASSWORD=` variable inside [backend/.env](file:///c:/Users/shris/OneDrive/Desktop/Sem%204/sem%204%20projects/real_estate%20system/backend/.env) to match).

### Step 2: Start the Express Backend
Open your terminal in the `backend/` directory and run:
```bash
cd backend
npm run dev
```
*(The backend will auto-initialize the database `real_estate_db`, verify tables, seed accounts/listings, and run at `http://localhost:5000`)*.

### Step 3: Start the Vite React Frontend
Open another terminal in the `frontend/` directory and run:
```bash
cd frontend
npm run dev
```
*(Open your browser at `http://localhost:5173` to explore your real estate management portal!)*.

---

## Seeded Logins (Tested & Approved)

Since database tables are auto-seeded on first start, you can sign in instantly using:
- **System Admin**: `admin@realestate.com` / `admin123`
- **Real Estate Agent**: `agent@realestate.com` / `agent123`
- **Property Seller**: `seller@realestate.com` / `seller123`
- **Property Buyer**: `buyer@realestate.com` / `buyer123`
