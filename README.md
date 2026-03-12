# 🎓 Online Examination System

A secure, full-stack online examination web application similar to NPTEL with Firebase Authentication, React frontend, and Node.js/Express backend.

## ✨ Features

### 🔐 Authentication & Security
- Firebase Authentication (Email + Password)
- Strong password validation (min 10 chars, 1 uppercase, 1 number, 1 special symbol)
- Duplicate email prevention
- One-attempt enforcement per user
- Session-based access control

### 📝 Exam Features
- 40 multiple-choice questions across 4 sections:
  - Aptitude (10 questions)
  - Programming (10 questions)
  - Problem Solving (10 questions)
  - Logical Reasoning (10 questions)
- 30-minute timer with auto-submit
- Question navigation (Next/Previous)
- Visual tracking of attempted questions
- Section-wise question display

### 🛡️ Security Measures
- Protected routes requiring authentication
- Browser back button disabled during exam
- Page refresh detection with auto-submit
- Page exit detection with auto-submit
- Backend validation of all submissions
- Secure score calculation on server

### 📊 Results
- Total score out of 40
- Section-wise performance breakdown
- Time taken display
- No reattempt allowed

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Email/Password authentication in Authentication > Sign-in method

2. **Get Firebase Configuration**
   - In Project Settings > General, scroll to "Your apps"
   - Click the web icon (</>) to add a web app
   - Copy the Firebase configuration object

3. **Download Service Account Key**
   - In Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-service-account.json` in the `backend` directory

4. **Create Firestore Database**
   - Go to Firestore Database in Firebase Console
   - Click "Create database"
   - Start in production mode
   - Choose a location

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd online-exam-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Add your Firebase service account JSON file
   # Place firebase-service-account.json in the backend directory
   
   # Update .env file if needed (already created with defaults)
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Update Firebase configuration
   # Edit src/config/firebase.js with your Firebase config
   ```

4. **Update Firebase Configuration**
   
   **Frontend** (`frontend/src/config/firebase.js`):
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

3. **Access the Application**
   - Open your browser and go to `http://localhost:5173`
   - Register a new account
   - Login and take the exam

## 📁 Project Structure

```
online-exam-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase-admin.js      # Firebase Admin SDK setup
│   │   ├── middleware/
│   │   │   └── auth.js                # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js                # Auth routes
│   │   │   ├── exam.js                # Exam routes
│   │   │   └── result.js              # Result routes
│   │   ├── data/
│   │   │   └── questions.js           # Question bank (40 MCQs)
│   │   └── server.js                  # Express server
│   ├── .env                           # Environment variables
│   ├── firebase-service-account.json  # Firebase Admin credentials
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Register.jsx       # Registration page
│   │   │   │   ├── Login.jsx          # Login page
│   │   │   │   └── Auth.css
│   │   │   ├── Exam/
│   │   │   │   ├── ExamPage.jsx       # Main exam interface
│   │   │   │   ├── Timer.jsx          # Countdown timer
│   │   │   │   ├── QuestionCard.jsx   # Question display
│   │   │   │   └── *.css
│   │   │   ├── Instructions.jsx       # Pre-exam instructions
│   │   │   └── Result.jsx             # Results page
│   │   ├── config/
│   │   │   └── firebase.js            # Firebase client config
│   │   ├── utils/
│   │   │   └── ProtectedRoute.jsx     # Route protection
│   │   ├── App.jsx                    # Main app component
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/check-attempt` - Check if user has attempted exam

### Exam
- `GET /api/exam/questions` - Get all questions (protected)
- `POST /api/exam/submit` - Submit exam answers (protected)

### Results
- `GET /api/result/:userId` - Get user's exam result (protected)

## 🗄️ Database Schema

### Firestore Collections

**users**
```javascript
{
  uid: string,
  fullName: string,
  email: string,
  createdAt: timestamp,
  hasAttempted: boolean
}
```

**results**
```javascript
{
  userId: string,
  totalScore: number,
  sectionScores: {
    aptitude: number,
    programming: number,
    problemSolving: number,
    logicalReasoning: number
  },
  timeTaken: number,
  answers: array,
  submittedAt: timestamp
}
```

## 🎨 UI Features

- Modern gradient design
- Responsive layout (mobile-friendly)
- Professional exam interface
- Real-time timer with warning state
- Visual question navigator
- Section-wise score visualization
- Clean and intuitive user experience

## 🔒 Security Features

1. **Authentication**: Firebase Authentication with secure token verification
2. **Route Protection**: All exam routes require valid authentication
3. **One-Attempt Enforcement**: Backend and frontend validation
4. **Browser Controls**: Back button disabled, refresh detection
5. **Auto-Submit**: Triggered on time expiry or page exit
6. **Secure Scoring**: All calculations performed on backend
7. **CORS Protection**: Configured for frontend origin only

## 📝 Question Bank

The system includes 40 carefully crafted multiple-choice questions:
- **Aptitude**: Percentages, ratios, averages, time & work, profit & loss
- **Programming**: C, Java, OOP, loops, output-based questions
- **Problem Solving**: Algorithms, data structures, complexity analysis
- **Logical Reasoning**: Number series, directions, blood relations, patterns

## 🚨 Important Notes

1. **Firebase Credentials**: Never commit `firebase-service-account.json` to version control
2. **Environment Variables**: Update `.env` with your actual values
3. **One Attempt**: Users can only take the exam once - this is strictly enforced
4. **Timer**: The 30-minute timer starts immediately when the exam begins
5. **Auto-Submit**: Leaving the exam page will automatically submit the exam

## 🛠️ Troubleshooting

### Backend won't start
- Ensure `firebase-service-account.json` is in the backend directory
- Check that all dependencies are installed: `npm install`
- Verify port 5000 is not in use

### Frontend can't connect to backend
- Ensure backend server is running on port 5000
- Check CORS configuration in `backend/src/server.js`
- Verify Firebase configuration in `frontend/src/config/firebase.js`

### Authentication errors
- Verify Firebase project has Email/Password authentication enabled
- Check that Firebase configuration is correct in both frontend and backend
- Ensure Firestore database is created and accessible

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Support

For issues or questions, please check:
1. Firebase configuration is correct
2. All dependencies are installed
3. Both frontend and backend servers are running
4. Firestore database is properly set up

---

**Built with ❤️ using React, Node.js, Express, and Firebase**
