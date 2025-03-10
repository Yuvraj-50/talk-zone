# TalkZone - Real-Time Chat Application

🚀 **TalkZone** is a feature-rich chat application that enables seamless real-time communication. It supports **one-to-one chat, group chat, typing indicators, online/offline status**, and comes with **custom themes** for a personalized experience.

## ✨ Features

- 🔹 **One-to-One Chat** – Secure private messaging between users.
- 🔹 **Group Chat** – Create and manage group conversations.
- 🔹 **Custom Themes** – Choose from **4 different themes**.
- 🔹 **Authentication System** – Login via **Gmail and Google OAuth**.
- 🔹 **Real-Time Typing Indicators** – See when someone is typing.
- 🔹 **Online/Offline Presence Indicators** – Know who’s available.
- 🔹 **Scalability with Pub-Sub** – Ensures real-time sync across multiple servers.

## 🛠️ Tech Stack

### **Frontend:**

- ⚛️ **React** – Modern UI library for fast rendering.
- 🎨 **Tailwind CSS** – Utility-first styling for quick customization.
- 🏗 **ShadCN UI** – Beautiful pre-built components.
- 🗂 **Zustand** – State management for smooth interactions.
- 🚀 **TypeScript** – Strict typing for better development experience.

### **Backend:**

The backend is split into two services:

#### **1️⃣ Auth Service**

- 🟢 **Node.js** – Backend runtime.
- 🛢 **PostgreSQL + Prisma** – Database & ORM.
- ☁️ **Cloudinary** – Image uploads.
- 🔐 **JWT Authentication** – Secure user sessions.
- 🏗 **Express.js + TypeScript** – Fast and maintainable API.

#### **2️⃣ Chat Service**

- 🔌 **WebSockets (********`ws`********\*\*\*\*)** – Real-time messaging.
- 🔄 **Redis Pub-Sub** – Ensures scalability across servers.
- 🛢 **PostgreSQL + Prisma** – Chat history persistence.

## 📂 Folder Structure

```
📦 talkzone
├── 📂 frontend  # React frontend with Tailwind & Zustand
├── 📂 backend   # Backend services
│   ├── 📂 auth-service  # Handles authentication & user management
│   ├── 📂 chat-service  # Manages WebSocket connections & chat storage
├── 📄 README.md  # Project documentation
```

## 🖥️ Real-Time Features Breakdown

### **1. WebSockets for Instant Messaging**

- `ws` is used to establish real-time bidirectional communication.
- Clients open a persistent WebSocket connection with the chat service.
- When a user sends a message, it is **broadcasted to the recipient/group** instantly.

### **2. Redis Pub-Sub for Scalability**

- Each chat server instance subscribes to Redis channels.
- When a message is sent, it is **published** to Redis.
- Other instances **receive and broadcast** the message, ensuring real-time sync across multiple servers.

## 🌍 Deployment

- 🚀 **Frontend:** Deployed on **netlify**.
- 🚀 **Backend:** Services hosted on **AWS EC2**.
- 🌐 **Live App:** [chat.yuvaraj.tech](https://chat.yuvaraj.tech)


## dashboard

![image](https://res.cloudinary.com/duyjktpqs/image/upload/f_auto,q_auto/v1/github-readme/bltiv0nsbsycona043u3)


## 🔮 Future Plans

- 📞 **Voice & Video Calls** – WebRTC-based calling feature.
- 📎 **File Sharing** – Share media files seamlessly.
- 🏆 **Message Reactions** – Add emoji reactions to messages.


### ⭐ If you like this project, consider giving it a star! ⭐