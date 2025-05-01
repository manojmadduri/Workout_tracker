# FitTrack Frontend

This is the frontend for the FitTrack application, a workout tracking app that allows you to log exercises, sets, and weights with historical data viewing.

## Deploying to Vercel

1. Push this code to a GitHub repository
2. Connect your Vercel account to your GitHub repo
3. Configure the deployment with these settings:

   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

4. Add the following environment variables:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., https://your-app.replit.app)

5. Deploy!

## Development

To run the app locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following:

```
VITE_API_URL=http://localhost:3000  # For local development
```

For production, set the API URL to your deployed backend URL:

```
VITE_API_URL=https://your-backend.replit.app  # Replace with your Replit app URL
```