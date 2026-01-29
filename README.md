# Title
TrashBeta

## Description
TrashBeta is a community-driven reporting platform that enables individuals to report trash, dirt, and environmental pollution within their surroundings. The system is designed to help communities, organizations and relevant authorities identify, track and address waste-related issues efficiently.

This project focuses on building a scalable and secure backend architecture that supports user reporting, media uploads, role-based access and real-time updates. TrashBeta serves both as a civic-tech solution and a production-ready backend engineering project.

## Key Features
- JWT-based Authentication & Authorization
- Email OTP verification flow
- Password reset via email token
- Role-Based Access Control (RBAC)
  - Resident
  - Staff
  - Admin
- Secure password hashing (bcrypt)
- Location-based trash reporting
- Image uploads for reported trash
- Report status tracking (Pending, In Progress, Resolved)
- HTTP security headers (Helmet)
- Rate limiting & input sanitization
- XSS and NoSQL injection protection


## Core Modules
# Reports
- Create trash/dirt reports
- Attach images and descriptions
- Location metadata (area/community)
- Status updates and resolution tracking
- Admin access to all reports

# Users
- User registration and authentication
- Profile management
- Role-based permissions

# Media Handling
- Image uploads via Cloudinary
- Secure file validation and storage

# Real-Time Features
- Admin notifications for new reports
- Status update alerts


## API Architecture
- RESTful API design
- Swagger API documentation
- Postman collection for testing
- Modular and maintainable structure

## Productivity Modules
# Notes
- Create, update, delete notes
- File attachments (images/documents)
- Tag-based filtering
- Admin access to all notes


## Deployment Ready
- Environment-based configuration
- Cloud-ready deployment (Render-compatible)
- Optional Redis integration for caching and rate limiting


## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT (Authentication)**
- **Bcrypt.js** (Password Hashing)
- **Socket.io** (Real-time communication)
- **Cloudinary** (File uploads)
- **GraphQL & express-graphql** 
- **dotenv** (Environment variables)
- **Helmet, Express-rate-limit, Mongo-sanitize, XSS-clean** (Security)



## Project Structure

vephla-productivity-suite/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
│
│
├── .env.example
├── .gitignore
├── server.js
├── README.md
└── package.json


## Installation & Setup
# Clone the repository
git clone https://github.com/Don-pizu/trashbeta.git

# Navigate into the project folder
cd trashbeta

# Install dependencies
npm install

# Start the server
node server.js


## Environment Configuration
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=

RESEND_API_KEY=
FROM_EMAIL=

REDIS_HOST=
REDIS_PORT=
REDIS_PASS=
REDIS_URL=

## API Documentation
# Swagger UI
  http://localhost:5000/api-docs


## API Endpoints

## GraphQL API
  POST /graphql


## Author name

-Asiru Adedolapo

## Stage, Commit, and Push**

```bash

git add .
git commit -m "feat: initial project setup with folder structure and README"
git branch -M main
git remote add origin https://github.com/Don-pizu/trashBeta.git
git push -u origin main

