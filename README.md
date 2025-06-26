# 🔗 URL Shortener

A modern, full-stack URL shortening service that transforms long, unwieldy links into short, manageable URLs with comprehensive analytics. Built with security and user experience in mind.

![URL Shortener Preview](https://via.placeholder.com/1200x600/1a202c/ffffff?text=URL+Shortener+Dashboard)

## ✨ Features

- **User Authentication**
  - Secure JWT-based authentication
  - Email verification with OTP
  - Protected routes

- **URL Management**
  - Shorten long URLs
  - Track click analytics
  - View detailed statistics
  - Copy shortened URLs with one click

- **Dashboard**
  - Clean, responsive interface
  - View all your shortened URLs
  - Monitor link performance
  - Sort and filter links

## 🚀 Tech Stack

- **Frontend**
  - React.js
  - Vite
  - Tailwind CSS
  - React Router
  - React Hot Toast

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication
  - OTP Verification

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MongoDB Atlas or local MongoDB instance

### Backend Setup

1. Navigate to the `api` directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `api` directory and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📝 Usage

1. Register a new account or log in if you already have one
2. Enter a long URL in the dashboard
3. Click "Shorten" to generate a short URL
4. Copy and share your shortened URL
5. Track clicks and analytics in your dashboard

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register | Register a new user |
| POST   | /auth/login | User login |
| POST   | /urls | Create a short URL |
| GET    | /urls | Get user's URLs |
| GET    | /:shortUrl | Redirect to original URL |
| GET    | /urls/:urlId/analytics | Get URL analytics |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- [Your Name](https://github.com/yourusername)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
