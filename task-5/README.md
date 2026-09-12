# Task 5 — End-to-End App Deployment

## Overview

This task demonstrates the complete deployment of a full-stack web application to the live internet.

The Markdown Blog application developed in Task 4 was deployed using:

- Vercel — Frontend
- Render — Backend
- Supabase PostgreSQL — Database
- Hugging Face — AI service

## Deployment Architecture

React Frontend → Vercel

Node.js / Express Backend → Render

PostgreSQL Database → Supabase

AI Auto-Tagging → Hugging Face

## Live Application

Frontend:
https://growfinix-task-4-blog.vercel.app

Backend API:
https://growfinix-task-4-api.onrender.com/api/posts

## Technologies Used

- React
- Vite
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- Supabase
- Render
- Vercel
- Hugging Face

## Deployment Process

1. Created a Supabase PostgreSQL project.
2. Created the posts table.
3. Connected the Render backend to Supabase.
4. Configured environment variables.
5. Changed the database connection from Supabase Direct Connection to Session Pooler after an IPv6 connectivity error.
6. Redeployed the backend on Render.
7. Verified the backend API successfully connected to Supabase.
8. Tested the live frontend on Vercel.
9. Created and published a blog post.
10. Verified that the post was stored and retrieved successfully.

## Troubleshooting

### IPv6 Connection Error

The initial Direct Connection produced an ENETUNREACH error.

The database connection was changed to the Supabase Session Pooler, which resolved the connectivity problem.

### Environment Variables

Sensitive database passwords and API tokens are stored as environment variables and are not included in the GitHub repository.

## Result

The application was successfully deployed end-to-end:

React Frontend → Vercel → Render API → Supabase PostgreSQL

The live application was tested successfully.

## Growfinix Technology Internship

### Author

Gade Srinam


