# Super Tribble — API Reference

**Base URL:** `http://localhost:5001/api`  
**Auth:** All protected routes require `Authorization: Bearer <token>` header.

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Posts](#3-posts)
4. [Votes](#4-votes)
5. [Comments](#5-comments)
6. [Communities](#6-communities)
7. [Chats](#7-chats)
8. [Messages](#8-messages)
9. [Tasks](#9-tasks)
10. [Habits](#10-habits)
11. [Study Rooms](#11-study-rooms)
12. [Socket.IO Events](#12-socketio-events)

---

## 1. Authentication

### `POST /auth/register`
Register a new user account.

**Auth:** None

**Request Body:**
```json
{
  "username": "janmesh23",
  "email": "janmesh@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "janmesh23",
    "email": "janmesh@example.com"
  }
}
```

---

### `POST /auth/login`
Log in with email and password.

**Auth:** None

**Request Body:**
```json
{
  "email": "janmesh@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "janmesh23",
    "email": "janmesh@example.com",
    "karma": 0,
    "profilePicture": ""
  }
}
```

**Error `401`:**
```json
{ "message": "Invalid email or password" }
```

---

## 2. Users

### `GET /users/:username`
Get a user's public profile.

**Auth:** None

**Response `200`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "username": "janmesh23",
  "karma": 42,
  "profilePicture": "https://...",
  "bio": "Full-stack dev",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### `GET /users/:username/posts`
Get all posts made by a user.

**Auth:** None

**Response `200`:** Array of Post objects.

---

### `PUT /users/:username`
Update own profile (bio, profilePicture).

**Auth:** Required (must be the same user)

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "profilePicture": "https://example.com/avatar.png"
}
```

**Response `200`:** Updated User object.

---

### `GET /users/:username/voted-posts`
Get posts the user has voted on.

**Auth:** Required

**Response `200`:** Array of Post objects.

---

### `GET /users/:username/comments`
Get all comments made by a user.

**Auth:** Required

**Response `200`:** Array of Comment objects.

---

## 3. Posts

### `POST /posts`
Create a new post inside a community.

**Auth:** Required

**Request Body:**
```json
{
  "title": "My first post",
  "content": "Post body here...",
  "communityId": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

**Response `200`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
  "title": "My first post",
  "content": "Post body here...",
  "author": { "_id": "...", "username": "janmesh23" },
  "community": "64f1a2b3c4d5e6f7a8b9c0d2",
  "karma": 0,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### `GET /posts`
Get all posts (sorted by newest).

**Auth:** None

**Query Params:** `?community=<id>` (optional filter)

**Response `200`:** Array of Post objects with populated `author` and `community`.

---

### `GET /posts/:id`
Get a single post by ID.

**Auth:** None

**Response `200`:** Single Post object.

---

### `DELETE /posts/:id`
Delete own post.

**Auth:** Required (must be post author)

**Response `200`:**
```json
{ "message": "Post deleted successfully" }
```

---

## 4. Votes

### `POST /posts/:id/vote`
Upvote or downvote a post. Sending the same vote again toggles it off.

**Auth:** Required

**Request Body:**
```json
{ "value": 1 }
```
> `value`: `1` (upvote) or `-1` (downvote)

**Response `200`:**
```json
{ "karma": 5 }
```

---

### `GET /posts/:id/vote`
Get the current user's vote on a post.

**Auth:** Required

**Response `200`:**
```json
{ "value": 1 }
```
> Returns `null` if user has not voted.

---

## 5. Comments

### `POST /comments`
Create a comment on a post. Supports nested replies.

**Auth:** Required

**Request Body:**
```json
{
  "postId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "content": "Great post!",
  "parentId": null
}
```
> Set `parentId` to a parent comment `_id` for a reply thread.

**Response `200`:** Created Comment object.

---

### `GET /comments/:postId`
Get all comments for a post (threaded tree).

**Auth:** None

**Response `200`:** Array of top-level Comment objects, each with nested `replies`.

---

### `PUT /comments/:id`
Edit own comment.

**Auth:** Required (must be comment author)

**Request Body:**
```json
{ "content": "Updated comment text" }
```

**Response `200`:** Updated Comment object.

---

### `DELETE /comments/:id`
Delete own comment.

**Auth:** Required (must be comment author)

**Response `200`:**
```json
{ "message": "Comment deleted" }
```

---

### `POST /comments/:id/vote`
Vote on a comment.

**Auth:** Required

**Request Body:**
```json
{ "value": 1 }
```

**Response `200`:**
```json
{ "karma": 3 }
```

---

### `GET /comments/:id/vote`
Get current user's vote on a comment.

**Auth:** Required

**Response `200`:**
```json
{ "value": -1 }
```

---

## 6. Communities

### `POST /communities`
Create a new community.

**Auth:** Required

**Request Body:**
```json
{
  "name": "programming",
  "description": "A place for coders",
  "isPrivate": false
}
```

**Response `200`:** Created Community object.

---

### `GET /communities`
List all public communities.

**Auth:** None

**Response `200`:** Array of Community objects with member count.

---

### `GET /communities/:id`
Get a single community by ID.

**Auth:** None

**Response `200`:** Community object with populated `members` and `createdBy`.

---

### `GET /communities/:id/posts`
Get all posts in a community.

**Auth:** None

**Response `200`:** Array of Post objects.

---

### `POST /communities/:id/join`
Join or leave a community (toggle).

**Auth:** Required

**Response `200`:**
```json
{ "joined": true, "memberCount": 24 }
```

---

## 7. Chats

### `POST /chats/dm`
Start or retrieve a 1-on-1 DM chat with another user.

**Auth:** Required

**Request Body:**
```json
{ "userId": "64f1a2b3c4d5e6f7a8b9c0d4" }
```

**Response `200`:** Chat object with populated `participants`.

---

### `POST /chats/group`
Create a group chat.

**Auth:** Required

**Request Body:**
```json
{
  "name": "Study Squad",
  "participantIds": ["64f1a2b3c4d5e6f7a8b9c0d4", "64f1a2b3c4d5e6f7a8b9c0d5"],
  "isPublic": false
}
```

**Response `200`:** Created Chat object with populated `participants`.

---

### `GET /chats`
Get all chats the current user belongs to.

**Auth:** Required

**Response `200`:** Array of Chat objects sorted by `lastMessageAt` descending.

---

### `GET /chats/public/list`
List all public group chats.

**Auth:** None

**Response `200`:** Array of Chat objects `{ _id, name, isPublic, createdAt, participants, createdBy }`.

---

### `POST /chats/public/:chatId/join`
Join a public group chat.

**Auth:** Required

**Response `200`:** Updated Chat object.

---

### `PUT /chats/:chatId/public`
Toggle a chat's public visibility. Only participants may call this.

**Auth:** Required

**Request Body:**
```json
{ "isPublic": true }
```

**Response `200`:** Updated Chat object.

---

### `DELETE /chats/:chatId`
Delete a chat and all its messages. Creator only.

**Auth:** Required

**Response `200`:**
```json
{ "success": true }
```

---

### `GET /chats/:chatId/messages`
Fetch message history for a chat (oldest first).

**Auth:** Required

**Response `200`:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "chatId": "64f1a2b3c4d5e6f7a8b9c0d7",
    "senderId": { "_id": "...", "username": "janmesh23" },
    "content": "Hello!",
    "senderName": "janmesh23",
    "readBy": [],
    "edited": false,
    "deleted": false,
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
]
```

---

## 8. Messages

### `POST /messages`
Send a message via REST (alternative to Socket.IO).

**Auth:** Required

**Request Body:**
```json
{
  "chatId": "64f1a2b3c4d5e6f7a8b9c0d7",
  "content": "Hello from REST!",
  "receiverId": "64f1a2b3c4d5e6f7a8b9c0d4"
}
```

**Response `200`:** Created Message object.

---

### `PUT /messages/read/:chatId`
Mark all unread messages in a chat as read by the current user.

**Auth:** Required

**Response `200`:**
```json
{ "updated": 5 }
```

---

### `PUT /messages/:messageId`
Edit own message content.

**Auth:** Required (must be message sender)

**Request Body:**
```json
{ "content": "Corrected message text" }
```

**Response `200`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
  "content": "Corrected message text",
  "edited": true
}
```

**Error `403`:**
```json
{ "message": "Not authorized to edit this message" }
```

---

### `DELETE /messages/:messageId`
Soft-delete own message (shows "Message deleted" placeholder).

**Auth:** Required (must be message sender)

**Response `200`:**
```json
{ "success": true }
```

**Error `403`:**
```json
{ "message": "Not authorized to delete this message" }
```

---

## 9. Tasks

### `POST /tasks`
Create a personal task.

**Auth:** Required

**Request Body:**
```json
{
  "title": "Finish API docs",
  "description": "Write all endpoints",
  "status": "pending",
  "dueDate": "2025-12-31T00:00:00.000Z"
}
```
> `status`: `"pending"` | `"in-progress"` | `"done"`

**Response `200`:** Created Task object.

---

### `GET /tasks`
List all tasks for the current user.

**Auth:** Required

**Query Params:** `?status=pending` (optional filter)

**Response `200`:** Array of Task objects.

---

### `PUT /tasks/:id`
Update a task.

**Auth:** Required (must own the task)

**Request Body:**
```json
{ "status": "done" }
```

**Response `200`:** Updated Task object.

---

### `DELETE /tasks/:id`
Delete a task.

**Auth:** Required (must own the task)

**Response `200`:**
```json
{ "message": "Task deleted" }
```

---

## 10. Habits

### `POST /habits`
Create a new habit to track.

**Auth:** Required

**Request Body:**
```json
{
  "name": "Read 20 pages",
  "frequency": "daily"
}
```

**Response `200`:** Created Habit object.

---

### `GET /habits`
List all habits for the current user.

**Auth:** Required

**Response `200`:** Array of Habit objects with `streak` and `checkIns`.

---

### `PUT /habits/:id`
Update a habit's name or frequency.

**Auth:** Required (must own the habit)

**Request Body:**
```json
{ "name": "Read 30 pages" }
```

**Response `200`:** Updated Habit object.

---

### `DELETE /habits/:id`
Delete a habit.

**Auth:** Required (must own the habit)

**Response `200`:**
```json
{ "message": "Habit deleted" }
```

---

### `POST /habits/:id/checkin`
Record today's check-in. Updates streak automatically.

**Auth:** Required

**Response `200`:**
```json
{ "streak": 7, "checkedInToday": true }
```

---

## 11. Study Rooms

### `POST /studyrooms`
Create a new study room.

**Auth:** Required

**Request Body:**
```json
{ "name": "Exam Prep Room" }
```

**Response `200`:** Created StudyRoom object.

---

### `GET /studyrooms`
List all study rooms.

**Auth:** Required

**Response `200`:** Array of StudyRoom objects.

---

### `POST /studyrooms/:roomId/join`
Join a study room session (starts timer).

**Auth:** Required

**Response `200`:** StudySession object with `joinedAt`.

---

### `POST /studyrooms/:roomId/leave`
Leave a study room session (stops timer, records duration).

**Auth:** Required

**Response `200`:** Updated StudySession object with `duration`.

---

### `GET /studyrooms/:roomId/active-times`
Get total active times for all users in a room.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "janmesh23",
    "totalMinutes": 120,
    "joinedAt": "2025-01-01T08:00:00.000Z"
  }
]
```

---

## 12. Socket.IO Events

Connect to the WebSocket server using your JWT token:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: { token: localStorage.getItem('token') }
});
```

### Events Emitted by Client

| Event | Payload | Description |
|---|---|---|
| `chat:join` | `chatId: string` | Join a chat room to receive messages |
| `chat:message` | `{ chatId, content, receiverId? }` | Send a message |
| `chat:read` | `{ chatId }` | Mark all messages in chat as read |
| `chat:message:edit` | `{ messageId, content }` | Edit own message |
| `chat:message:delete` | `{ messageId }` | Delete own message |
| `room:join` | `roomId: string` | Join a study room |
| `room:leave` | `roomId: string` | Leave a study room |

### Events Emitted by Server

| Event | Payload | Description |
|---|---|---|
| `chat:message` | Message object with `senderName` | New message broadcast to room |
| `chat:read` | `{ chatId, userId, readBy }` | Messages marked as read |
| `chat:message:edit` | `{ messageId, content, edited: true }` | Message was edited |
| `chat:message:delete` | `{ messageId }` | Message was deleted |
| `presence:update` | `string[]` (online user IDs) | Online user list changed |
| `room:presence` | `{ userId, action: "join" \| "leave" }` | Study room user joined/left |

---

## Error Responses

All errors follow this shape:

```json
{ "message": "Human-readable error description" }
```

| Status | Meaning |
|---|---|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — no token or invalid token |
| `403` | Forbidden — authenticated but not allowed |
| `404` | Not found |
| `500` | Internal server error |
