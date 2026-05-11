# Mechanics Hub

A comprehensive vehicle service platform that connects vehicle owners with qualified mechanics for roadside assistance and garage services.

## 🏗️ Project Structure

This project is organized into separate frontend and backend applications:

```
mechanics-hub/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React context providers
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   ├── public/         # Static assets
│   └── package.json
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── models/     # Database models
│   │   ├── middleware/ # Express middleware
│   │   ├── config/     # Configuration files
│   │   └── controllers/ # Route controllers
│   └── package.json
└── README.md
```

## 🚀 Features

### Frontend Features
- **User Authentication**: Secure login system for both vehicle owners and mechanics
- **Role-Based Access**: Separate dashboards for clients and mechanics
- **Service Booking**: Easy booking system for vehicle maintenance and repairs
- **Emergency Services**: Quick access to roadside assistance and emergency help
- **Mechanic Profiles**: Detailed profiles with ratings, services, and availability
- **Location Services**: GPS-based mechanic discovery and service areas
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Backend Features
- **RESTful API**: Well-structured API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Client and mechanic role management
- **Database Integration**: MongoDB with Mongoose ODM
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling middleware
- **Emergency Dispatch**: Real-time emergency service coordination

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Context** - State management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd mechanics-hub
```

### 2. Set up the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Applications
- Frontend: `http://localhost:1573`
- Backend API: `http://localhost:1573`
- API Health Check: `http://localhost:1573/api/health`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users & Mechanics
- `GET /api/users/profile` - Get user profile
- `GET /api/mechanics` - Get mechanics with filters
- `PUT /api/mechanics/profile` - Update mechanic profile

### Services & Bookings
- `GET /api/services` - Get available services
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings

### Support & Emergency
- `POST /api/inquiries` - Submit inquiry
- `POST /api/emergency` - Emergency request
- `GET /api/emergency/services` - Available emergency services

## 🎯 Key Features

### Authentication System
- User registration with email/phone
- Secure JWT-based authentication
- Role-based access control (client/mechanic)
- Profile management

### Service Booking
- Browse mechanics by location and services
- Real-time availability checking
- Booking management and tracking
- Service history and reviews

### Emergency Services
- 24/7 emergency assistance requests
- Quick service provider dispatch
- Real-time status tracking
- Emergency service directory

## 🔧 Development Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm run seed     # Seed database (if available)
```

## 🌍 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mechanics-hub
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:1573
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact:
- Email: support@mechanicshub.com
- Phone: +256 700 000000
- Website: www.mechanicshub.com
