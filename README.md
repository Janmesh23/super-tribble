# Super Tribble

Super Tribble is a productivity-focused, community-driven Reddit-style platform where users can join communities, post, comment, chat, track tasks, build habits, and collaborate in real-time study rooms.

This is the public repository of Super Tribble. Check out [FEATURES.md](FEATURES.md) for a detailed breakdown of all user-facing features.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, MongoDB, Socket.IO  
- **Frontend:** React, TailwindCSS, Axios  
- **Authentication:** JWT  
- **Containerization:** Docker  
- **Deployment:** Render  
- **Package Manager:** npm  

---

## 🚀 Key Features
- **User Authentication:** Signup, login, and JWT-backed persistent sessions.
- **Communities & Posts:** Create, join, and post within public or private/invite-only sub-communities.
- **Threaded Comments & Voting:** Upvote/downvote system with nested, threaded comments.
- **Real-Time Chats:** Direct Messaging (DMs) and public/private group chats powered by Socket.IO.
- **Read Receipts (New!):** Single and double tick indicators (`✓`/`✓✓`) showing when messages are read.
- **Message Editing & Deletion (New!):** Edit message contents inline or soft-delete them in real time.
- **Collaborative Study Rooms:** Join rooms with live session timers showing online duration for active users.
- **Productivity Dashboard:** Task tracking (Kanban filtering) and Habit tracking (streaks and progress calendars).
- **API Documentation:** Interactive developer API reference at [docs/API.md](docs/API.md).

---

## 💻 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Docker)

### 1. Clone the repository
```bash
git clone https://github.com/Janmesh23/super-tribble.git
cd super-tribble
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Environment Variables Setup

Create a `.env` file inside the `backend` directory:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/super-tribble
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGINS=http://localhost:5173
```

Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:5001
```

### 5. Running the Application

Start the Backend Server (from `/backend`):
```bash
npm run dev
```

Start the Frontend Dev Server (from `/frontend`):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure
```
/backend
   /config         # Database connection logic
   /models         # Mongoose schemas (User, Post, Message, etc.)
   /routes         # API routes
   /controllers    # Business logic functions
   server.js       # Main server entry & socket handler
/frontend
   /src
      /components  # Shared layout & UI components
      /pages       # Router pages (Chats, Habits, Profile, etc.)
```
