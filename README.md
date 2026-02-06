# 🛒 Full-Stack E-Commerce Web App

<p align="center">
  <img src="./ThumbNail1.png" alt="Project Thumbnail" width="900"/>
</p>

# 🌐 Live Preview

🔗 Deployed App:
https://store-frontend-orcin.vercel.app/

⚠️ Notes:

Backend is hosted on Render free tier, so initial load may be slow

Payment page is disabled in preview mode
## 🔧 Local Setup Guide

Follow the steps below to run the project locally.

---

## 📁 Environment Variables Setup

Create a `.env` file in **both frontend and backend** directories.

---

## 🔧 Backend `.env`

```env
DB_CONNECT_STRING=xxx
GMAIL_USER=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

Where to get them:

MongoDB Atlas → https://www.mongodb.com/products/platform/atlas-database

RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET→ https://razorpay.com/

GMAIL_USER → Admin email for management (your email as admin)

## 🔧 Frontend `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=xxx
VITE_RAZORPAY_KEY_ID=xxx
VITE_ADMIN_EMAIL=xxx
VITE_API_URL=http://localhost:3000
```
Where to get them:

Clerk → https://clerk.com/

Razorpay → https://razorpay.com/

VITE_ADMIN_EMAIL → Admin email for management (your email as admin)

# 📦 Install Dependencies

Run this command inside both frontend and backend folders:
```
npm install
```

# ▶️ Run the Project

Start both servers simultaneously using command:
```
npm run dev
```
