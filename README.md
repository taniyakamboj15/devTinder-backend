#  devTinder – Backend

The backend server for the devTinder platform – a social chat app for developers. Handles authentication, profile management, friend requests, and real-time end-to-end encrypted messaging.

> 🌐 Frontend GitHub: [github.com/taniyakamboj15/devTinder](https://github.com/taniyakamboj15/devTinder)
> 🚀 Live App: [https://devtinder.taniyakamboj.info](https://devtinder.taniyakamboj.info)

⚠️ Note: Hosted on a free-tier environment. Initial load may take 10–15 seconds due to server cold start.

---

## 🧩 Features

* 🔐 User authentication with JWT & hashed passwords (bcrypt)
* 📧 Email-based OTP verification (Nodemailer)
* 📄 CRUD APIs for users, profiles, and connections
* 📬 Friend requests (Send, Accept, Reject)
* 💬 Chat with Socket.IO and E2EE (AES)
* 🌐 Cross-origin support (CORS)
* 📦 Modular architecture with Express Routers and Mongoose

---

## ⚙️ Tech Stack

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Express.js | HTTP server framework        |
| MongoDB    | NoSQL database               |
| Mongoose   | MongoDB ORM                  |
| JWT        | Authentication               |
| Bcrypt     | Password hashing             |
| Nodemailer | OTP Email sending            |
| Socket.IO  | Real-time chat communication |
| Crypto     | AES-based message encryption |
| Validator  | Input sanitization           |
| Dotenv     | Environment configuration    |

---

## 📁 Project Structure

```
📦 devTinder-backend
├─ .gitattributes
├─ .gitignore
├─ server.js                  # Entry point
├─ vercel.json                # Deployment config
├─ package.json
├─ config/
│  └─ database.js             # MongoDB connection
├─ middleware/
│  ├─ emailauth.js            # Email OTP middleware
│  └─ userauth.js             # JWT auth check
├─ models/
│  ├─ chatSchema.js           # Chat messages
│  ├─ connectionSchema.js     # Friend requests
│  └─ userSchema.js           # User profile
├─ routes/
│  ├─ authRouter.js           # SignUp/Login/OTP
│  ├─ chatRouter.js           # Chat logic
│  ├─ profileRouter.js        # Edit/view profile
│  ├─ request.js              # Request handling
│  └─ user.js                 # Fetch user info
├─ utils/
│  ├─ socket.js               # Socket.IO setup
│  └─ validateSignUp.js       # Input validation
```

---

## 🔐 API Overview

### 🔑 Auth

* `POST /signup` – Register user with OTP
* `POST /login` – Login with JWT
* `POST /verify-email` – Send OTP to email

### 👤 Profile

* `GET /profile/:id` – Get user profile
* `PUT /profile/edit` – Update user details

### 📬 Requests

* `POST /request/send` – Send connection request
* `POST /request/accept` – Accept request
* `POST /request/reject` – Reject request
* `GET /request/pending` – View pending requests

### 💬 Chat

* `GET /chat/:friendId` – Get chat history
* Real-time messages over Socket.IO

---

## ⚙️ Setup Locally

1. Clone the repository:

```bash
git clone https://github.com/taniyakamboj15/devTinder-backend.git
cd devTinder-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_ID=your_email@example.com
EMAIL_PASS=your_email_password_or_app_key
```

4. Start the development server:

```bash
npm run dev
```

---

## 🚀 Deployment

This backend is configured for deployment on **Vercel** using the `vercel.json` file.

---

## 👩‍💻 Author

Crafted with ❤️ by [Taniya Kamboj](https://github.com/taniyakamboj15)

---

## 📜 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
