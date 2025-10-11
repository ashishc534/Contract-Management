# Contract Management Service

A modern, full-stack contract management application built with Spring Boot backend and React TypeScript frontend. This application provides AI-powered contract extraction, analytics, and comprehensive contract management capabilities.

## 🚀 Features

### Core Functionality
- **Contract Upload & Management**: Upload multiple DOCX files with drag-and-drop support
- **AI-Powered Extraction**: Automatically extract key contract information including:
  - Contract types (Service Agreement, Employment Contract, Lease Agreement, NDA, etc.)
  - Party names and organizations
  - Financial amounts and terms
  - Important dates (contract date, expiration date)
  - Signatures and other relevant fields

### User Interface
- **Modern Dashboard**: Clean, responsive interface with real-time statistics
- **Interactive Analytics**: Visual contract type distribution and processing status
- **Smart Search**: Autocomplete search with suggestions from filenames, contract types, and party names
- **Advanced Filtering**: Filter contracts by status, type, and extraction method

### Contract Management
- **Edit Contracts**: Comprehensive editing interface for all contract fields
- **Reprocess Contracts**: Re-run AI extraction on existing contracts
- **Download Originals**: Download original DOCX files
- **Delete Contracts**: Remove contracts with confirmation dialogs

### User Experience
- **Loading States**: Visual feedback for all operations with spinners
- **Toast Notifications**: Beautiful success/error notifications
- **Confirmation Dialogs**: Custom React modals instead of browser alerts
- **Clickable Stats Cards**: Click dashboard cards to filter and scroll to contracts
- **Contract Details Modal**: View all parties and contract information in organized sections

### Technical Features
- **User-Specific Data**: All contracts are filtered by user ID
- **File Management**: Secure file storage with unique naming
- **Real-time Updates**: Analytics and contract lists update after operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🏗️ Architecture

- **Backend**: Java Spring Boot 3.2.0 with MongoDB
- **Frontend**: React 19.2.0 with TypeScript and Tailwind CSS
- **Database**: MongoDB with user-specific data filtering
- **File Processing**: Apache POI for DOCX document processing
- **UI Components**: Custom React components with Lucide icons

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java 17 or higher**
- **Maven 3.6+**
- **Node.js 16+ and npm**
- **MongoDB** (running on default port 27017)

## 🛠️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ContractManagementService
```

### 2. Setup MongoDB
Ensure MongoDB is running on your local machine:
```bash
# Start MongoDB (varies by installation method)
mongod
# or
brew services start mongodb/brew/mongodb-community
# or
sudo systemctl start mongod
```

### 3. Backend Setup (Spring Boot)

Navigate to the backend directory:
```bash
cd backend-java
```

Install dependencies and run:
```bash
mvn clean install
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

**Backend API Endpoints:**
- `GET /api/contracts` - Get user contracts with filtering
- `POST /api/contracts/upload` - Upload multiple contracts
- `PUT /api/contracts/{id}` - Update contract details
- `POST /api/contracts/{id}/reprocess` - Reprocess contract with AI
- `DELETE /api/contracts/{id}` - Delete contract
- `GET /api/contracts/{id}/download` - Download original file
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/contract-types` - Get contract type distribution

### 4. Frontend Setup (React)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend-react
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Click "Login" to access the dashboard (demo login)
3. Start uploading DOCX contracts to see the AI extraction in action

## 📁 Project Structure

```
ContractManagementService/
├── backend-java/
│   ├── src/main/java/com/docutrack/
│   │   ├── controller/     # REST API controllers
│   │   ├── model/          # Data models
│   │   ├── repository/     # MongoDB repositories
│   │   └── service/        # Business logic
│   └── pom.xml            # Maven dependencies
├── frontend-react/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API service layer
│   │   └── types.ts        # TypeScript type definitions
│   └── package.json       # npm dependencies
└── README.md
```

## 🔧 Configuration

### Backend Configuration
The application uses default configurations:
- **MongoDB**: `localhost:27017/docutrack`
- **File Upload**: `uploads/` directory (created automatically)
- **CORS**: Enabled for `http://localhost:3000`

### Frontend Configuration
- **API Base URL**: `http://localhost:8080/api`
- **Supported File Types**: `.docx` files only
- **Max File Size**: 100MB per file

## 🚀 Usage Guide

1. **Upload Contracts**: Drag and drop or select multiple DOCX files
2. **View Dashboard**: See real-time statistics and contract overview
3. **Search & Filter**: Use the search bar with autocomplete or filter by status/type
4. **Edit Contracts**: Click the edit button to modify extracted information
5. **Reprocess**: Click reprocess to re-run AI extraction
6. **Analytics**: Switch to Analytics tab for detailed insights
7. **Download**: Download original files anytime

## 🛡️ Security Features

- User-specific data isolation
- File validation (DOCX only)
- Secure file storage with unique naming
- Input sanitization and validation

## 🔮 Future Enhancements

- Advanced AI models for better extraction accuracy
- Support for additional file formats (PDF, DOC)
- Contract templates and generation
- Advanced analytics and reporting
- User authentication and authorization
- Contract workflow management
- Integration with external legal databases

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.
