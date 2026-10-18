# Practical 7: Authentication and Middleware Pipeline

**Course**: Advanced Web Development Frameworks (ITUE301)  
**Department**: CSE - CSPIT, CHARUSAT  

---

## 📌 Overview

This repository folder (`prac7`) contains the implementation for **Practical 7**, focusing on securing a Node.js/Express Task Management application using **JWT (JSON Web Token) Authentication**, **Password Hashing with bcryptjs**, and **Middleware Validation Pipelines**.

---

## 🚀 Features Implemented

1. **User Registration (`POST /api/auth/register`)**:
   - Securely hashes passwords using `bcryptjs` (salt factor 10) before saving to MongoDB.
   - Prevents duplicate registration for existing emails.
2. **User Login (`POST /api/auth/login`)**:
   - Verifies hashed passwords using `bcrypt.compare()`.
   - Generates and returns a signed JWT token with a 1-hour expiration time.
3. **Authentication Middleware (`middleware/auth.js`)**:
   - Intercepts requests to protected routes (`/api/tasks`, `/api/auth/me`).
   - Extracts and verifies JWT from `Authorization: Bearer <token>` header.
   - Wraps verification in `try/catch` to return `401 Unauthorized` for invalid/expired tokens.
4. **Input Validation Middleware (`middleware/validateTask.js`, `middleware/validateAuth.js`)**:
   - Validates input fields on the server before hitting database controllers.
   - Rejects malformed requests (e.g., missing title or invalid email) with `400 Bad Request`.
5. **Supplementary Features**:
   - **`/api/auth/me` Endpoint**: Returns current user details derived from decoded token.
   - **Frontend 401 Auto-Redirect & Logout**: Client automatically clears local token and prompts login upon receiving 401 response.
   - **Client-side Token Persistence**: Stores JWT in `localStorage` for session retention.

---

## 🧠 Key Questions / Viva Analysis

### Q1: Why must passwords be hashed before storage instead of saved as plain text, even in a lab/demo project?
> **Answer**: Plaintext passwords pose a severe security vulnerability. If a database is leaked or compromised, plaintext passwords expose user accounts across all services where users reuse passwords. Using `bcryptjs` provides:
> 1. **One-Way Hashing**: Hashing is irreversible.
> 2. **Salting**: Automatically adds a random cryptographic salt to prevent Rainbow Table dictionary attacks.
> 3. **Key Stretching (Work Factor)**: `bcrypt` is intentionally computationally expensive, making brute-force attacks infeasible.

### Q2: What does the authentication middleware actually verify, and what happens if the token is missing or expired?
> **Answer**: The middleware checks:
> 1. **Presence**: Ensures `Authorization: Bearer <token>` exists.
> 2. **Integrity & Signature**: Verifies token payload wasn't tampered with using `jwt.verify(token, JWT_SECRET)`.
> 3. **Expiration**: Verifies current time `< exp` timestamp embedded in payload.
> 
> If missing, invalid, or expired, `jwt.verify()` throws an exception caught in a `try/catch` block, returning HTTP status `401 Unauthorized`. Wrapping in `try/catch` prevents server crashes.

### Q3: Why should input validation happen on the server even if the frontend already validates the same fields?
> **Answer**: Frontend validation is purely for User Experience (UX). Attackers can bypass frontend rules using Postman, cURL, browser DevTools, or custom scripts. Server-side validation acts as the ultimate security boundary ensuring bad, malformed, or malicious data never reaches business logic or the database.

---

## 🛠️ Step-by-Step Postman Testing Guide

1. **Register User**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/register`
   - Body (`raw JSON`):
     ```json
     {
       "email": "student@charusat.ac.in",
       "password": "password123"
     }
     ```
   - Response: `201 Created`

2. **Login & Get Token**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`
   - Body (`raw JSON`):
     ```json
     {
       "email": "student@charusat.ac.in",
       "password": "password123"
     }
     ```
   - Response: Copy the returned `"token"` string.

3. **Access `/me` Profile (Protected)**:
   - Method: `GET`
   - URL: `http://localhost:5000/api/auth/me`
   - Headers: `Authorization`: `Bearer <token>`

4. **Create Task (Protected & Validated)**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/tasks`
   - Headers: `Authorization`: `Bearer <token>`
   - Body (`raw JSON`):
     ```json
     {
       "title": "Complete AWDF Practical 7"
     }
     ```

5. **Test Invalid Token**:
   - Set Header `Authorization`: `Bearer invalidtoken123`
   - Expected Response: `401 Unauthorized`

---

## 📁 Directory Structure

```
prac7/
├── .env
├── .gitignore
├── app.js
├── package.json
├── README.md
├── middleware/
│   ├── auth.js
│   ├── validateAuth.js
│   └── validateTask.js
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
└── public/
    ├── app.js
    ├── index.html
    └── style.css
```

---

## 🚀 Steps to Run

Follow these commands in your terminal to set up, run, and test Practical 7:

### 1. Ensure MongoDB Daemon is Running
```bash
mongod
```
* MongoDB connection string is configured in `.env` or defaults to `mongodb://127.0.0.1:27017/taskdb`

### 2. Navigate to Practical Directory
```bash
cd prac7
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application Server
```bash
npm start
```
* Server starts on: `http://localhost:5000`
* Console confirms:
  ```text
  MongoDB connected successfully
  Server running at http://localhost:5000
  ```

### 5. Access the Web Interface
* Open `http://localhost:5000` in your web browser to test the interactive authentication UI (Register, Login, JWT storage, Protected Tasks).

---

## 📸 Screenshots to Include in Lab File / Report

Capture and paste the following screenshots into your practical document:

1. **Screenshot 1 - Server Startup in Terminal**:
   - *Capture*: Terminal window showing `npm start`, `MongoDB connected successfully`, and `Server running at http://localhost:5000`.
2. **Screenshot 2 - POST /api/auth/register (User Registration)**:
   - *Capture*: Postman executing `POST http://localhost:5000/api/auth/register` with email and password, showing HTTP `201 Created` and success message.
3. **Screenshot 3 - MongoDB Compass Hashed Password (bcryptjs Evidence)**:
   - *Capture*: MongoDB Compass viewing the `users` collection showing the registered user with a 60-character bcrypt hash (starting with `$2a$` or `$2b$`), proving plain passwords are never stored.
4. **Screenshot 4 - POST /api/auth/login (JWT Token Generation)**:
   - *Capture*: Postman executing `POST http://localhost:5000/api/auth/login` showing HTTP `200 OK` and returning the signed JWT `token` string.
5. **Screenshot 5 - GET /api/auth/me (Protected Route with Bearer Token)**:
   - *Capture*: Postman executing `GET http://localhost:5000/api/auth/me` with header `Authorization: Bearer <jwt_token>`, showing HTTP `200 OK` and user identity claims.
6. **Screenshot 6 - 401 Unauthorized on Missing / Tampered Token**:
   - *Capture*: Postman attempting `GET /api/auth/me` without token or with header `Authorization: Bearer invalidtoken123`, showing HTTP `401 Unauthorized` with `{ "error": "Access denied. Invalid or expired token." }`.
7. **Screenshot 7 - Frontend Auth UI (Login & Task Management)**:
   - *Capture*: Browser window at `http://localhost:5000` showing the authenticated dashboard, active user email badge, and protected task creation interface.
8. **Screenshot 8 - DevTools LocalStorage JWT Persistence**:
   - *Capture*: Browser DevTools &rarr; **Application** tab &rarr; **Local Storage** showing the stored `token` key-value pair.

