import { supabase } from './supabase';

async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');

  try {
    // Create workouts table
    const { error: workoutsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'workouts',
      columns_and_types: `
        id uuid primary key default uuid_generate_v4(),
        date text not null,
        created_at timestamptz not null default now()
      `
    });

    if (workoutsError) {
      console.error('Error creating workouts table:', workoutsError);
      return;
    } else {
      console.log('Workouts table created successfully');
    }

    // Create exercises table
    const { error: exercisesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'exercises',
      columns_and_types: `
        id uuid primary key default uuid_generate_v4(),
        workout_id uuid not null references workouts(id) on delete cascade,
        name text not null,
        created_at timestamptz not null default now()
      `
    });

    if (exercisesError) {
      console.error('Error creating exercises table:', exercisesError);
      return;
    } else {
      console.log('Exercises table created successfully');
    }

    // Create sets table
    const { error: setsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'sets',
      columns_and_types: `
        id uuid primary key default uuid_generate_v4(),
        exercise_id uuid not null references exercises(id) on delete cascade,
        set_number integer not null,
        reps integer not null,
        weight numeric not null,
        created_at timestamptz not null default now()
      `
    });

    if (setsError) {
      console.error('Error creating sets table:', setsError);
      return;
    } else {
      console.log('Sets table created successfully');
    }

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error setting up tables:', error);
  }
}

// Run the function directly if this file is executed
if (require.main === module) {
  setupSupabaseTables()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupSupabaseTables };