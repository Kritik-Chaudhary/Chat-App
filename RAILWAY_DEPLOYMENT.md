# Railway Deployment Guide

This guide will help you deploy your chat application to Railway.

## Prerequisites

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI (optional but recommended):
   ```bash
   npm install -g @railway/cli
   ```

## Deployment Steps

### Method 1: Using Railway Dashboard (Recommended)

1. **Connect Your Repository**:
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your GitHub account and select this repository

2. **Deploy Your App**:
   - Railway will automatically detect your project configuration
   - No database setup needed - the app uses memory storage for a completely free deployment
   - All environment variables are automatically configured by Railway

4. **Deploy**:
   - Railway will automatically detect your project settings using the `railway.yml` file
   - The deployment will start automatically
   - Your app will be available at the generated Railway URL

### Method 2: Using Railway CLI

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Initialize Project**:
   ```bash
   railway project init
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

## Project Configuration

The following files have been created for Railway deployment:

- **`railway.yml`**: Railway deployment configuration
- **`nixpacks.toml`**: Build configuration for Nixpacks
- **`Procfile`**: Fallback process configuration

## Important Notes

1. **Storage**: Your app uses in-memory storage for a completely free deployment. Messages and users reset when the app restarts, but users get message caching in their browsers.

2. **Build Process**: Railway will:
   - Install dependencies with `npm ci`
   - Build the frontend and backend with `npm run build`
   - Start the server with `npm run start`

3. **Environment Variables**: 
   - `PORT` is automatically set by Railway
   - `NODE_ENV` is automatically set to `production`
   - No database configuration needed

4. **Local Caching**: Messages are cached in users' browsers, so they persist across page refreshes but not server restarts.

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check that all dependencies are in `dependencies` (not `devDependencies`) if they're needed at runtime.

2. **Memory Storage**: The app uses in-memory storage, so data resets on each deployment. This is expected for the free tier.

3. **Port Issues**: Railway automatically sets the `PORT` environment variable. Make sure your app listens on `process.env.PORT`.

4. **Static File Serving**: In production, your Express server serves the built React app from the `dist/public` directory.

### Logs and Debugging:

- View deployment logs in the Railway dashboard
- Use `railway logs` command if using CLI
- Check the "Deployments" tab for build and runtime logs

## Post-Deployment

After successful deployment:

1. Your chat application will be available at the Railway-provided URL
2. Test user registration and messaging functionality
3. Verify that real-time updates are working
4. Note that data resets when the app restarts (this is expected with memory storage)
5. Messages are cached in each user's browser for better persistence

## Scaling and Monitoring

Railway provides:
- Automatic scaling based on demand
- Built-in monitoring and metrics
- Easy rollback to previous deployments
- Custom domain support (paid plans)

For production use, consider:
- Setting up a custom domain
- Configuring backup strategies for your database
- Setting up monitoring and alerts