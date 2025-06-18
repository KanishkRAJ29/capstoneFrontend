# PayBand: Digital Wallet Platform with ESP32 Watch Integration

PayBand is a full MERN-stack web application with a companion ESP32 watch firmware that enables seamless digital payments using QR codes and fingerprint authentication.

## Features

### Web Application
1. **Registration & Login**
   - User registration with email/password
   - Unique merchant ID (UUID) generation
   - QR code generation for receiving payments
   - JWT-based authentication

2. **Profile Management**
   - View username, email, merchant ID, QR code
   - Check current balance and PIN setup status

3. **PIN Setup & Protection**
   - 4-digit PIN creation for transaction security
   - PIN verification for sensitive operations

4. **Wallet & Transactions**
   - Wallet balance in INR
   - Transaction history (deposits, withdrawals, payments)
   - Real-time updates via Socket.IO

5. **Request Money**
   - Generate QR codes with payment details
   - Share payment links

6. **Admin Panel**
   - User management
   - Manual fund addition
   - Transaction monitoring

### ESP32 Watch Firmware
1. **Hardware Integration**
   - Wi-Fi connectivity
   - Camera module for QR scanning
   - Fingerprint sensor for authentication
   - DFPlayer Mini for text-to-speech
   - Vibration motor for haptic feedback
   - OLED display for user interface

2. **Payment Flow**
   - Scan merchant QR code
   - Verify payment details via TTS
   - Authenticate with fingerprint
   - Process payment and receive confirmation
   - Real-time updates via Socket.IO

## Project Structure

\`\`\`
/backend
├─ server.js              # Express server with Socket.IO
├─ .env                   # Environment variables
├─ package.json           # Dependencies
├─ /models                # Mongoose schemas
│  ├─ User.js             # User model with wallet
│  ├─ Transaction.js      # Transaction records
│  └─ PaymentRequest.js   # Payment request data
├─ /routes                # API routes
│  ├─ auth.js             # Authentication endpoints
│  ├─ wallet.js           # Wallet operations
│  ├─ payments.js         # Payment processing
│  ├─ admin.js            # Admin operations
│  └─ users.js            # User management
├─ /controllers           # Business logic
└─ /middleware            # Auth and role middleware

/frontend
├─ package.json           # Dependencies
├─ tailwind.config.js     # Tailwind CSS config
├─ postcss.config.js      # PostCSS config
├─ /public                # Static assets
│  └─ index.html          # HTML entry point
└─ /src                   # React application
   ├─ index.js            # Application entry
   ├─ App.jsx             # Main component
   ├─ /api                # API client
   │  └─ axios.js         # Axios configuration
   ├─ /contexts           # React contexts
   │  ├─ AuthContext.jsx  # Authentication state
   │  └─ SocketContext.jsx # Socket.IO connection
   ├─ /components         # Reusable components
   └─ /pages              # Application pages

/firmware
├─ watch.ino              # ESP32 firmware
└─ library-dependencies.txt # Required libraries
\`\`\`

## Environment Setup

### Backend (.env)
\`\`\`
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/payband
JWT_SECRET=your_jwt_secret_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
\`\`\`

### Frontend (.env)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

## Installation & Running

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### ESP32 Firmware
1. Install the required libraries listed in `firmware/library-dependencies.txt`
2. Open `watch.ino` in Arduino IDE
3. Configure Wi-Fi credentials and server URL
4. Upload to your ESP32 device

### Docker Setup
\`\`\`bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Management
- `GET /api/users/me` - Get current user profile
- `POST /api/users/setup-pin` - Set up 4-digit PIN
- `POST /api/users/verify-pin` - Verify PIN
- `POST /api/users/change-password` - Change password

### Wallet Operations
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet
- `POST /api/wallet/withdraw` - Withdraw funds from wallet

### Payments
- `POST /api/payments/request` - Create payment request (QR)
- `GET /api/payments/request/:requestId` - Get payment request details
- `POST /api/payments/send` - Send payment (from watch)
- `GET /api/payments/status/:transactionId` - Check payment status

### Transactions
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction details

### Admin Operations
- `GET /api/admin/users` - Get all users
- `POST /api/admin/add-funds` - Add funds to user wallet
- `GET /api/admin/transactions` - Get all transactions
- `POST /api/admin/create-first-admin` - Create first admin user

## Security Features

1. **JWT Authentication**
   - Secure API endpoints
   - Token expiration and refresh

2. **PIN Protection**
   - Hashed PIN storage
   - Required for sensitive operations

3. **Fingerprint Authentication**
   - Biometric verification for payments

4. **HTTPS Support**
   - Secure communication (configure in production)

## License

MIT

## Contributors

- Your Name
\`\`\`

This completes the PayBand digital wallet platform with ESP32 watch integration. The application includes all the requested features:

1. User registration and login with JWT authentication
2. QR code generation for payment requests
3. 4-digit PIN setup and verification
4. Wallet functionality with transaction history
5. Send money via ESP32 watch with fingerprint authentication
6. Request money via web app
7. Admin functionality for managing users and funds
8. Real-time updates with Socket.IO

The project is structured according to the specifications and includes Docker configuration for easy deployment.
