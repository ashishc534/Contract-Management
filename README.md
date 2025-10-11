# Contract Management Service

A modern contract management application built with Spring Boot backend and React TypeScript frontend.

## Architecture

- **Backend**: Java Spring Boot with MongoDB
- **Frontend**: React TypeScript with modern component architecture
- **Database**: MongoDB with user-specific data filtering

## Features

- User authentication and authorization
- Contract upload and management
- AI-powered contract extraction
- Analytics and reporting
- User-specific contract filtering
- DOCX document processing

## Getting Started

### Backend (Spring Boot)
```bash
cd backend-java
mvn spring-boot:run
```
Server runs on http://localhost:8080

### Frontend (React)
```bash
cd frontend-react
npm install
npm start
```
Frontend runs on http://localhost:3000

## API Endpoints

- `GET /api/contracts` - Get user contracts
- `POST /api/contracts/upload` - Upload contract
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/types` - Get contract type distribution
