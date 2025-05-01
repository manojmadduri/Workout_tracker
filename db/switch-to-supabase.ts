import { supabase } from './supabase';
import { supabaseStorage } from '../server/supabase-storage';

async function switchToSupabase() {
  console.log('Switching to Supabase and clearing seed data...');

  try {
    // First check if tables exist, if not create them
    await createTables();
    
    // Then clear all existing data
    await supabaseStorage.clearAllData();
    
    console.log('Switch to Supabase completed successfully');
  } catch (error) {
    console.error('Error switching to Supabase:', error);
  }
}

async function createTables() {
  console.log('Creating tables if they don\'t exist...');
  
  try {
    // Create workouts table
    const { error: workoutsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workouts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          date TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    });
    
    if (workoutsError) {
      console.error('Error creating workouts table:', workoutsError);
      throw workoutsError;
    }
    
    // Create exercises table
    const { error: exercisesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS exercises (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    });
    
    if (exercisesError) {
      console.error('Error creating exercises table:', exercisesError);
      throw exercisesError;
    }
    
    // Create sets table
    const { error: setsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
          set_number INTEGER NOT NULL,
          reps INTEGER NOT NULL,
          weight NUMERIC NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    });
    
    if (setsError) {
      console.error('Error creating sets table:', setsError);
      throw setsError;
    }
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Run the function directly if this file is executed
if (require.main === module) {
  switchToSupabase()
    .then(() => {
      console.log('Switching to Supabase completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to switch to Supabase:', error);
      process.exit(1);
    });
}

export { switchToSupabase, createTables };