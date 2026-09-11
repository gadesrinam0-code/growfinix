# Task 3 — Dynamic Real Estate Property Listing

A full-stack real estate property listing application developed as part of the Growfinix Technology internship.

The application allows administrators to add, edit, and delete property listings with images, while users can browse and search dynamically stored properties.

---

## Features

- Add new property listings
- Upload property images
- Store images using Cloudinary
- Store property details in PostgreSQL
- View dynamic property listings
- Edit existing properties
- Delete properties
- Search properties
- Filter property listings
- Responsive property cards
- REST API integration

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Neon

### Image Storage

- Cloudinary

### Deployment

- Vercel
- Render

---

## Application Flow

```text
Admin
  ↓
Enter Property Details
  ↓
Select Property Image
  ↓
React Frontend
  ↓
Node.js + Express API
  ↓
Image Upload to Cloudinary
  ↓
Property Details Stored in PostgreSQL
  ↓
Properties Retrieved through REST API
  ↓
Property Listings Displayed
