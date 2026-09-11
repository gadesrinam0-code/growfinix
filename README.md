# Task 4 — Markdown Blog with AI Auto-Tagging

A full-stack Markdown Blog CMS developed as part of the Growfinix Technology internship.

The application allows users to create Markdown-based blog posts. When a post is published, the backend sends the article content to an AI service to generate relevant tags automatically. The post and generated tags are then stored in PostgreSQL and displayed in the blog dashboard.

---

## Features

- Create Markdown blog posts
- Live Markdown preview
- AI-powered automatic tag generation
- PostgreSQL database integration
- View published articles
- Search articles
- Delete articles
- Responsive admin dashboard
- REST API integration
- Persistent data storage

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript
- React Markdown

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Neon

### AI

- Hugging Face

### Deployment

- Vercel
- Render

---

## How It Works

```text
Admin writes a blog post
        ↓
React Frontend
        ↓
Node.js + Express Backend
        ↓
AI analyzes the post content
        ↓
Relevant tags are generated
        ↓
Post + AI tags stored in PostgreSQL
        ↓
Articles displayed in the dashboard
