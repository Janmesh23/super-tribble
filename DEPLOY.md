# Super Tribble — Render Deployment Guide

Follow these steps to deploy both the **Backend API** and the **Frontend SPA** on Render.

---

## 1. Database Setup (MongoDB Atlas)
Render does not host managed databases natively on the free tier. We recommend using a free cluster on MongoDB Atlas.
1. Sign up/log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared cluster (Free Tier).
3. Under **Database Access**, create a database user with read/write access.
4. Under **Network Access**, add `0.0.0.0/0` to the IP access list (or enable access from anywhere) so Render can connect to it.
5. Go to your cluster, click **Connect** -> **Drivers**, and copy the connection string. Replace `<username>` and `<password>` with your database user credentials.
   * *Example string:* `mongodb+srv://dbUser:securePass123@cluster0.abcde.mongodb.net/super-tribble?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render Web Service)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`super-tribble`).
4. Configure the service details:
   * **Name:** `super-tribble-backend`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js` or `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   * `MONGO_URI`: *Your MongoDB connection string from Step 1*
   * `JWT_SECRET`: *A secure random string*
   * `PORT`: `10000` (or leave blank; Render will auto-assign one)
   * `CORS_ORIGINS`: `https://your-frontend-subdomain.onrender.com` *(You can update this after deploying the frontend)*
6. Click **Create Web Service**. Render will build and deploy the backend. Note down the public URL of your service (e.g. `https://super-tribble-backend.onrender.com`).

---

## 3. Frontend Deployment (Render Static Site)
1. Go back to Render Dashboard.
2. Click **New +** and select **Static Site**.
3. Connect your GitHub repository (`super-tribble`).
4. Configure the site details:
   * **Name:** `super-tribble`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
5. Click **Advanced** and add the following **Environment Variables**:
   * `VITE_API_URL`: *The URL of your deployed backend service (e.g. `https://super-tribble-backend.onrender.com`)*
6. In the **Redirects/Rewrites** tab (under settings after creation or during configuration), add a rewrite rule for single page apps:
   * **Source:** `/*`
   * **Destination:** `/index.html`
   * **Action:** `Rewrite`
7. Click **Create Static Site**. Render will build the React application and deploy it.

---

## 4. Final Handshake Configuration
Once both sites are deployed:
1. Copy the public URL of your deployed **Frontend** Static Site (e.g. `https://super-tribble.onrender.com`).
2. Go to your **Backend Web Service** settings in Render, click **Environment**, and update `CORS_ORIGINS` with this URL.
3. Save the changes. Render will automatically redeploy the backend with the updated environment.

You're done! Your Super Tribble application is now live on Render! 🚀
