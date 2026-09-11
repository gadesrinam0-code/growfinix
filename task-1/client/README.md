# 🔐 Growfinix Secure Authentication System

A secure full-stack authentication system built as part of my Growfinix internship project.

The application provides user registration, secure password hashing, JWT-based authentication, protected routes, and a responsive React dashboard.

---

## 🚀 Features

- User registration
- Secure password hashing using bcrypt
- User login
- JWT authentication
- Protected API routes
- Authentication middleware
- Secure logout
- MongoDB database integration
- React frontend
- Responsive UI using Tailwind CSS
- Login and registration validation
- Protected user dashboard

---

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs
- CORS
- dotenv

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

---

## 📁 Project Structure

```text
Growfinix-Secure-Authentication/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md