# Super Tribble — Features Showcase

Super Tribble is a productivity-focused, community-driven platform built to blend Reddit's community engagement with advanced personal and collaborative productivity tools. Below is a detailed showcase of all features implemented in the application.

---

## 🚀 Core Features

### 1. User Authentication & Profile Customization
* **Secure Auth:** JWT-based user authentication (signup, login, persistent sessions).
* **Profile Management:** Edit bio and update profile picture.
* **Karma & Reputation:** Displays a user's combined karma earned from posts and comments across the platform.

### 2. Communities (Tribbles)
* **Creation & Moderation:** Users can create custom public or private/invite-only communities.
* **Subscription:** Users can join or leave communities, showing total member counts and custom taglines.
* **Posts & Feeds:** Users can write title-and-text posts within specific communities.

### 3. Posts & Threaded Comments
* **Reddit-Style Voting:** Upvote/downvote posts and comments to dynamically adjust their karma score.
* **Threaded Replies:** Comment system supporting multi-level nested replies, allowing structured conversations.
* **Real-time Karma Updates:** Instant visual feedback upon voting.

---

## 💬 Real-Time Collaboration & Messaging

### 4. Interactive Chat Rooms (Direct Messages & Groups)
* **Direct Messages (DMs):** Start private, real-time 1-on-1 conversations with any user by their ID.
* **Group Chats:** Create group chats, name them, add multiple participants, and toggle public visibility.
* **Browse Public Rooms:** Discover and join public group chat rooms created by the community.

### 5. Advanced Messaging Options (New!)
* **Read Receipts:** Visual indicator ticks (`✓` for sent, `✓✓` for read by other participants) that update in real-time via Socket.IO.
* **Message Editing:** Edit the content of your own messages inline. Shows an `(edited)` label to other users.
* **Message Deletion:** Soft-delete your own messages, displaying a clean *“Message deleted”* placeholder to keep the conversation layout consistent.

### 6. Study Rooms
* **Collaborative Working:** Join study rooms to work alongside other users.
* **Presence Indicators:** See who is currently active in the room.
* **Active Timers:** Track how long each user has been online during their study session.
* **Session Logs:** Retrieve history of session durations and active study times.

---

## 📈 Productivity Suites

### 7. Task Tracker
* **Personal TODOs:** Create tasks with titles, descriptions, status, and optional due dates.
* **Status Kanban:** Filter tasks by `pending`, `in-progress`, or `done`.
* **Seamless Updates:** Modify status or delete tasks directly from the dashboard.

### 8. Habit Tracker
* **Habit Streaks:** Log daily habits (e.g., "Read 20 pages") and track consecutive day streaks.
* **Interactive Calendar:** Visual progression grid showing active check-in days.
* **Streak Protection:** Keeps track of completion rules and updates stats on check-in.

---

## 🛠️ Developers & Integrations

### 9. Interactive API Reference
* Comprehensive documentation of all backend REST endpoints and Socket.IO events is available at [docs/API.md](file:///Users/janmesh23/Downloads/ProdditPublic-main/docs/API.md).
