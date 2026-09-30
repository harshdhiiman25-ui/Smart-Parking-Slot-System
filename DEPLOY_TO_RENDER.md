# Deploying Smart Parking System to Render

This project is 100% production-ready for deployment on **Render.com**. You can deploy it using either of the two methods below.

---

## Method 1: Deploy as a Static Site (Recommended — 100% Free & Fast)

1. Push your code to your **GitHub** / **GitLab** account.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Static Site**.
3. Connect your repository.
4. Fill in the following settings:
   - **Name:** `smart-parking-system` (or your choice)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. **Important for SPA Routing:**
   - In your Render static site dashboard, go to **Redirects/Rewrites**.
   - Click **Add Rule**:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Action:** `Rewrite`
6. Click **Create Static Site**. Your site will build and be live with a free HTTPS URL!

---

## Method 2: Deploy as a Web Service (Node.js Server)

The repository includes a ready-to-run Express production server (`server.js`) configured for Render.

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the service:
   - **Name:** `smart-parking-system`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Health check endpoint (optional): `/healthz`
5. Click **Create Web Service**. Render will automatically assign a `PORT`, run the build, and start the app.

---

## Method 3: 1-Click Render Blueprint

Because the project includes `render.yaml`, you can also:
1. In Render, click **New +** > **Blueprint**.
2. Connect this repository.
3. Render will automatically read `render.yaml` and configure the build and start commands.
