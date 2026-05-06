# 🚀 MEC Deployment Guide (Cloud Migration)

To make your website live on the internet, follow these 3 steps.

## Step 1: Create a Cloud Database (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a **Free** account.
2.  Create a **Cluster** (Choose the free "M0" tier).
3.  Go to **Network Access** and click "Add IP Address". Add only your backend host egress IPs where possible. Use `0.0.0.0/0` only as a temporary setup fallback, then tighten it before production use.
4.  Go to **Database Access** and create a user (Note down the username and password).
5.  Go to **Deployment > Databases**, click **"Connect"**, and choose **"Compass"** or **"Drivers"**.
6.  Copy the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/uafms`).
    > [!IMPORTANT]
    > Replace `<password>` with your actual password.

## Step 2: Push your code to GitHub (Final Sync)
Run these commands to ensure everything is saved:
```bash
git add .
git commit -m "Final cloud-ready polish"
git push
```

## Step 3: Connect to Hosting
### A. Backend (Render.com) - RECOMMENDED
1.  Sign up at [Render.com](https://render.com/).
2.  Click **"New +"** > **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Add `MONGO_URI` (the one you copied from Step 1).
    *   Add `JWT_SECRET` (make it a long random string).
    *   Add `ALLOWED_ORIGINS` (your frontend Vercel/Netlify URL, comma-separated if you have multiple allowed frontends).

### B. Frontend (Vercel.com)
1.  Sign up at [Vercel.com](https://vercel.com/).
2.  Import your GitHub repository.
3.  **Settings**:
    *   **Root Directory**: `uafms`
    *   **Framework Preset**: Next.js
4.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_API_URL` (your new Render Backend URL + `/api`).
    *   Add `NEXT_PUBLIC_SOCKET_URL` (your new Render Backend URL).

---

## 🏗️ How to Seed your Cloud Database
Once your backend is connected to Atlas, you need to populate it with data (Universities, Scholarships, etc.).

1.  **Open your Terminal** in the project root.
2.  **Temporarily update your `backend/.env`** with the Atlas URI (ensure the `<password>` is filled).
3.  **Run the following commands** one by one:
    ```bash
    # Push ALL initial data (Recommended)
    cd backend
    node seed.js

    # Or push specific data
    node seed_all_unis.js
    node seed_scholarships.js
    ```
4.  **Confirm**: Refresh your Atlas Dashboard to see the new collections!

---

## 📺 How to use your GUI with the Cloud
1.  Open **MongoDB Compass** on your computer.
2.  Paste the Cloud Connection string (from Step 1) into the "New Connection" field.
3.  Click Connect.
4.  You can now see all your production data just like your local data!
