# FitTrack - Workout Tracker Application

FitTrack is a complete workout tracking solution that allows users to log exercises, sets, reps, and weights, and visualize progress over time. Built with React, TypeScript, Express, and Supabase (PostgreSQL).

## Features

- 📅 Log daily workouts with exercises, sets, reps, and weights
- 📊 View detailed exercise history and track progress
- 📈 Visualize performance with interactive charts
- 🏆 Track personal records for each exercise
- 📱 Responsive design (works on desktop and mobile devices)
- 🗓️ Calendar view to access past and future workouts

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui components
- **State Management**: React Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Routing**: Wouter

## Running Locally

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/fittrack.git
   cd fittrack
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Supabase
   - Create a new project on [Supabase](https://supabase.com/)
   - Get your Supabase URL and API keys from the project dashboard
   - Under SQL Editor, run the SQL queries from the `database_schema.sql` file to create your tables

4. Set up environment variables  
   Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   DATABASE_URL=postgresql://postgres:postgres@db.your-project-id.supabase.co:5432/postgres
   ```

5. Initialize the database (if not using the SQL Editor directly)
   ```bash
   npm run db:push   # Apply database schema
   npm run db:seed   # (Optional) Seed with sample data
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5000`

## Deployment on Railway

[Railway](https://railway.app/) is a platform that provides infrastructure for deploying applications. Here's how to deploy this project on Railway:

### Step 1: Set Up Railway Account

1. Sign up for a Railway account at [railway.app](https://railway.app/)
2. Install the Railway CLI (optional but recommended)
   ```bash
   npm i -g @railway/cli
   ```

### Step 2: Create a New Project on Railway

1. From the Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account and select your repository

### Step 3: Add Environment Variables

1. In your project settings, navigate to the "Variables" tab
2. Add the Supabase environment variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   DATABASE_URL=postgresql://postgres:postgres@db.your-project-id.supabase.co:5432/postgres
   ```

### Step 4: Configure Build Settings

1. In your project settings, navigate to the "Settings" tab
2. Ensure the build command is set to:
   ```
   npm install && npm run build
   ```
3. Ensure the start command is set to:
   ```
   npm start
   ```

### Step 5: Deploy

1. Railway will automatically deploy your application when you push changes to your GitHub repository
2. You can also deploy manually through the Railway dashboard or CLI
   ```bash
   railway up
   ```

### Step 6: Access Your Deployed Application

1. Once deployment is complete, Railway will provide a URL to access your application
2. You can also set up a custom domain in the project settings

## Using Supabase as a Storage Solution

This application uses Supabase (built on PostgreSQL) for database storage. Benefits include:

- **Authentication**: Easy-to-implement user authentication
- **Real-time subscriptions**: For collaborative features
- **Security rules**: Row-level security for data protection
- **Free tier**: Generous free tier for personal projects
- **SQL Editor**: Built-in SQL editor for direct database management
- **Database UI**: Visual interface for managing database content

To connect your application to Supabase:

1. Create a Supabase project
2. Set up your environment variables with your Supabase credentials
3. The application will automatically connect to your Supabase PostgreSQL database

## Database Schema

The database consists of three main tables:

- **workouts**: Stores information about each workout session
  - id (UUID, primary key)
  - date (Date)
  - created_at (Timestamp)

- **exercises**: Records exercises performed during workouts
  - id (UUID, primary key)
  - workout_id (foreign key to workouts)
  - name (Text)
  - created_at (Timestamp)

- **sets**: Contains the specific sets, reps, and weights for each exercise
  - id (UUID, primary key)
  - exercise_id (foreign key to exercises)
  - set_number (Integer)
  - reps (Integer)
  - weight (Numeric)
  - created_at (Timestamp)

## License

MIT

## Acknowledgements

- [Supabase](https://supabase.com/) for database and authentication services
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [Recharts](https://recharts.org/) for data visualization
- [date-fns](https://date-fns.org/) for date manipulation