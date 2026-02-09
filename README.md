# 🚀 Adora AI

**Adora AI** is a full-stack AI-powered web application that allows users to generate, manage, and explore AI-generated content through a modern, scalable, and production-ready architecture.  
The project focuses on clean system design, modular backend architecture, and a responsive frontend experience.

This repository demonstrates real-world engineering practices such as structured APIs, ORM-based database access, authentication, and scalable project organization.

---

## 📌 Table of Contents

- Overview  
- Features  
- Tech Stack  
- System Architecture  
- Project Structure  
- Environment Variables  
- Setup & Installation  
- Available Scripts  
- API Overview  
- Design Decisions  
- Future Improvements  
- Contributing  
- License  
- Author  

---

## 🧠 Overview

Adora AI enables users to:
- Authenticate securely
- Generate AI-powered images
- Organize outputs into projects
- Explore community-generated content

The application is designed with **separation of concerns**, making it easy to extend, maintain, and scale.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure user authentication
- Protected backend routes
- User-scoped resources

### 🎨 AI Image Generation
- AI-powered image generation
- Result storage and retrieval
- Project-based organization

### 📁 Project Management
- Create and manage projects
- Associate generated content with projects
- Structured project ownership

### 🌍 Community Page
- Explore public/shared generations
- Encourages discovery and reuse

### 📦 Backend API
- RESTful API design
- Controller–service–route separation
- Clean error handling

### 🗄️ Database Layer
- PostgreSQL with Prisma ORM
- Type-safe database access
- Scalable schema design

### 🖥️ Frontend UI
- Component-based architecture
- Responsive UI
- Clean and intuitive UX

---

## 🛠️ Tech Stack

### Frontend
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Node.js**
- **Express**
- **TypeScript**
- **Prisma ORM**

### Database
- **PostgreSQL**

### Tooling & Utilities
- **Multer** – File uploads
- **Git & GitHub** – Version control
- **REST APIs**

---

## 🧩 System Architecture

Frontend (React + TS)
|
v
Backend API (Express + TS)
|
v
Database (PostgreSQL + Prisma)


- Frontend communicates with backend via REST APIs
- Backend handles authentication, business logic, and persistence
- Prisma acts as the database abstraction layer

---

## 📂 Project Structure

```bash
Adora-Ai/
├── backend/
│   ├── src/
│   │   ├── config/          # App & service configurations
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth & request middlewares
│   │   └── server.ts        # App entry point
│   ├── prisma/              # Prisma schema & migrations
│   └── package.json
│
├── adora-frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   └── App.tsx
│   └── package.json
│
└── README.md
