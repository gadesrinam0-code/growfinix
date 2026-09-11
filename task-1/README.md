\# 🔐 Growfinix Secure Authentication System



A secure full-stack authentication system built as part of my Growfinix internship project.



The application provides user registration, secure password hashing, JWT-based authentication, protected routes, and a responsive React dashboard.



\---



\## 🚀 Features



\- User registration

\- Secure password hashing using bcrypt

\- User login

\- JWT authentication

\- Protected API routes

\- Authentication middleware

\- Secure logout

\- MongoDB database integration

\- React frontend

\- Responsive UI using Tailwind CSS

\- Login and registration validation

\- Protected user dashboard



\---



\## 🛠️ Technologies Used



\### Frontend



\- React

\- Vite

\- Tailwind CSS

\- JavaScript



\### Backend



\- Node.js

\- Express.js

\- JWT

\- bcryptjs

\- CORS

\- dotenv



\### Database



\- MongoDB

\- MongoDB Atlas

\- Mongoose



\---



\## 📁 Project Structure



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

│   └── package.json

│

├── .gitignore

└── README.md

```



\---



\## 🔐 Authentication Flow



```text

User

&#x20;│

&#x20;▼

React Login / Register

&#x20;│

&#x20;▼

Express API

&#x20;│

&#x20;├── Register

&#x20;│     │

&#x20;│     └── Password → bcrypt → MongoDB

&#x20;│

&#x20;└── Login

&#x20;      │

&#x20;      └── Verify Password → JWT Token

&#x20;                             │

&#x20;                             ▼

&#x20;                      Protected Routes

&#x20;                             │

&#x20;                             ▼

&#x20;                        Dashboard

```



\---



\## 🔗 API Endpoints



| Method | Endpoint | Description |

|--------|----------|-------------|

| POST | `/api/auth/register` | Register a new user |

| POST | `/api/auth/login` | Login and receive JWT |

| GET | `/api/auth/profile` | Access protected user profile |



\---



\## ⚙️ Environment Variables



Create a `.env` file inside the `server` folder:



```env

PORT=5000

MONGO\_URI=your\_mongodb\_connection\_string

JWT\_SECRET=your\_jwt\_secret

```



\*\*Never commit your `.env` file to GitHub.\*\*



The `.gitignore` file is configured to protect environment variables.



\---



\## ▶️ How to Run



\### 1. Clone the repository



```bash

git clone https://github.com/gadesrinam0-code/Growfinix-Secure-Authentication.git

cd Growfinix-Secure-Authentication

```



\### 2. Install backend dependencies



```bash

cd server

npm install

```



\### 3. Configure environment variables



Create:



```text

server/.env

```



Add your MongoDB connection string and JWT secret.



\### 4. Start the backend



```bash

npm run dev

```



The backend runs on:



```text

http://localhost:5000

```



\### 5. Install frontend dependencies



Open another terminal:



```bash

cd client

npm install

```



\### 6. Start the frontend



```bash

npm run dev

```



The frontend runs on:



```text

http://localhost:5173

```



\---



\## 🧪 Testing



The authentication system was tested for:



\- User registration

\- Duplicate user registration

\- User login

\- Incorrect password handling

\- JWT token generation

\- Protected route access

\- Invalid token handling

\- Logout

\- Session persistence using localStorage



\---



\## 🛡️ Security



The project implements several security practices:



\- Passwords are hashed using bcrypt

\- JWT is used for authentication

\- Protected routes require a valid Bearer token

\- Environment variables are excluded from Git

\- Authentication middleware verifies JWT tokens

\- Passwords are never returned in API responses



\---



\## 📌 Future Improvements



\- Password reset functionality

\- Email verification

\- Refresh tokens

\- Role-based access control

\- Improved form validation

\- HTTPS deployment

\- Production database security

\- Authentication rate limiting



\---



\## 🎓 Growfinix Internship



\*\*Task 1: Secure Authentication System\*\*



This project demonstrates the implementation of a secure full-stack authentication system using React, Node.js, Express, MongoDB, bcrypt, and JWT.



\---



\## 👨‍💻 Developer



\*\*Srinam Gade\*\*



GitHub:  

https://github.com/gadesrinam0-code

