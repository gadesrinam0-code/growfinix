# Tour Enquiry Management Platform

A full-stack web application for managing customer tour enquiries.

Built as **Task 2 for Growfinix Technology** using React, Tailwind CSS, Node.js, Express.js, and PostgreSQL.

## Live Demo

Frontend:
https://growfinix-six.vercel.app

Backend API:
https://growfinix-task-2-api.onrender.com

## Features

- Create new tour enquiries
- View all enquiries
- Edit existing enquiries
- Delete enquiries
- Manage enquiry status
- Search enquiries
- Filter enquiries by status
- Responsive desktop table
- Responsive mobile cards
- Form validation
- Success and error messages
- PostgreSQL database integration
- REST API

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- CORS
- REST API

### Database
- PostgreSQL
- Neon PostgreSQL

### Deployment
- Vercel — Frontend
- Render — Backend
- Neon — Database

## Project Structure

```text
growfinix-task-2/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── ...
│
├── server/
│   ├── routes/
│   │   └── enquiryRoutes.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
