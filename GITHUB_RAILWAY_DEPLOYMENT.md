# Deploy Chat App to Railway via GitHub

This guide will help you deploy your chat application to Railway using your GitHub repository.

## Step 1: Prepare Your GitHub Repository

### 1.1 Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click "New repository" (green button)
3. Name your repository (e.g., `chat-app` or `realtime-chat`)
4. Make it Public (required for Railway free tier)
5. Click "Create repository"

### 1.2 Push Your Code to GitHub

Run these commands in your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - chat app ready for Railway deployment"

# Add your GitHub repository as remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy on Railway

### 2.1 Sign Up/Login to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with your GitHub account
3. Grant Railway access to your GitHub repositories

### 2.2 Create New Project

1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your chat app repository from the list
4. Click "Deploy Now"

### 2.3 Automatic Configuration

Railway will automatically:
- Detect your Node.js project
- Use the `railway.yml` configuration file
- Install dependencies with `npm ci`
- Build your app with `npm run build`
- Start the server with `npm run start`

## Step 3: Access Your Deployed App

1. Wait for deployment to complete (usually 2-3 minutes)
2. Railway will provide a URL like: `https://your-app-name.up.railway.app`
3. Click the URL to access your chat application

## Important Notes

### ✅ What's Included
- **Free Deployment**: No database costs (uses memory storage)
- **Message Caching**: Messages persist in users' browsers
- **Real-time Updates**: Polling-based message updates
- **User Management**: Username-based sessions

### ⚠️ Important Limitations
- **Server Restart**: Messages and users reset when app restarts (this is expected)
- **Memory Storage**: Global chat resets, but individual browsers keep message history
- **Free Tier**: App may sleep after 30 minutes of inactivity

### 🔄 Updating Your App

To update your deployed app:

```bash
# Make your changes, then:
git add .
git commit -m "Update: describe your changes"
git push origin main
```

Railway will automatically redeploy when you push changes to GitHub.

## Troubleshooting

### Build Failures
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Ensure your repository is public
- Verify the `railway.yml` file exists

### App Not Loading
- Check the deployment logs in Railway dashboard
- Ensure the app listens on `process.env.PORT || 5000`
- Verify the build completed successfully

### GitHub Connection Issues
- Make sure Railway has access to your GitHub account
- Ensure the repository is public
- Check that you've pushed all files to GitHub

## Configuration Files

Your project includes these Railway configuration files:

- **`railway.yml`**: Main deployment configuration
- **`nixpacks.toml`**: Build settings for Nixpacks
- **`Procfile`**: Process configuration
- **`package.json`**: Build and start scripts

## Support

If you encounter issues:
1. Check Railway's deployment logs
2. Verify your GitHub repository has all files
3. Ensure the repository is public
4. Check that the build and start scripts work locally

Your chat app is now ready for Railway deployment! 🚀