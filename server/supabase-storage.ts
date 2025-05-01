import { format, subMonths } from 'date-fns';
import { supabase } from '../db/supabase';
import { ExerciseWithSets } from '@shared/schema';

// Types for the storage module
export type WorkoutWithExercisesType = {
  id: string;
  date: string;
  createdAt: string | Date;
  exercises: ExerciseWithSetsType[];
};

export type ExerciseWithSetsType = {
  id: string;
  workoutId: string;
  name: string;
  createdAt: string | Date;
  sets: {
    id: string;
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: number;
    createdAt?: string | Date;
  }[];
};

// Types for the exercise history
export type ExerciseHistoryItem = {
  date: string;
  setNumber: number;
  reps: number;
  weight: number | string;
};

// Types for progress data
export type ExerciseProgressData = {
  date: string;
  value: number;
};

// Type for personal records
export type PersonalRecord = {
  exerciseName: string;
  weight: number;
  date: string;
};

export const supabaseStorage = {
  // Create new workout for a specific date
  async createWorkout(date?: string): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();
    const formattedDate = format(targetDate, 'yyyy-MM-dd');
    
    // Check if workout for the date already exists
    const { data: existingWorkout, error: findError } = await supabase
      .from('workouts')
      .select('*')
      .eq('date', formattedDate)
      .maybeSingle();
    
    if (findError) {
      console.error('Error finding workout:', findError);
      throw findError;
    }
    
    if (existingWorkout) {
      return existingWorkout;
    }
    
    // Create new workout for the specified date
    const { data: newWorkout, error: insertError } = await supabase
      .from('workouts')
      .insert({ date: formattedDate })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating workout:', insertError);
      throw insertError;
    }
    
    return newWorkout;
  },
  
  // Get today's workout with exercises and sets
  async getTodayWorkout(): Promise<WorkoutWithExercisesType | null> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.getWorkoutByDate(today);
  },
  
  // Get workout for a specific date
  async getWorkoutByDate(date: string): Promise<WorkoutWithExercisesType | null> {
    // First get the workout for the date
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('date', date)
      .maybeSingle();
    
    if (workoutError) {
      console.error('Error getting workout by date:', workoutError);
      throw workoutError;
    }
    
    if (!workout) {
      return { exercises: [] } as any;
    }
    
    // Then get all exercises for the workout
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workout.id)
      .order('created_at', { ascending: true });
    
    if (exercisesError) {
      console.error('Error getting exercises:', exercisesError);
      throw exercisesError;
    }
    
    const exercises = exercisesData || [];
    
    // For each exercise, get its sets
    const exercisesWithSets: ExerciseWithSetsType[] = [];
    
    for (const exercise of exercises) {
      const { data: setsData, error: setsError } = await supabase
        .from('sets')
        .select('*')
        .eq('exercise_id', exercise.id)
        .order('set_number', { ascending: true });
      
      if (setsError) {
        console.error('Error getting sets:', setsError);
        throw setsError;
      }
      
      // Transform the data to match the expected structure
      exercisesWithSets.push({
        id: exercise.id,
        workoutId: exercise.workout_id,
        name: exercise.name,
        createdAt: exercise.created_at,
        sets: (setsData || []).map(set => ({
          id: set.id,
          exerciseId: set.exercise_id,
          setNumber: set.set_number,
          reps: set.reps,
          weight: parseFloat(set.weight),
          createdAt: set.created_at
        }))
      });
    }
    
    return {
      id: workout.id,
      date: workout.date,
      createdAt: workout.created_at,
      exercises: exercisesWithSets
    };
  },
  
  // Add exercise with sets to today's workout
  async addExerciseWithSets(exerciseData: ExerciseWithSets): Promise<ExerciseWithSetsType> {
    // Get or create today's workout
    const workout = await this.createWorkout();
    
    // Insert exercise
    const { data: newExercise, error: exerciseError } = await supabase
      .from('exercises')
      .insert({
        workout_id: workout.id,
        name: exerciseData.name
      })
      .select()
      .single();
    
    if (exerciseError) {
      console.error('Error adding exercise:', exerciseError);
      throw exerciseError;
    }
    
    // Insert sets for the exercise
    const setsToInsert = exerciseData.sets.map((set, index) => ({
      exercise_id: newExercise.id,
      set_number: index + 1,
      reps: set.reps,
      weight: set.weight
    }));
    
    const { data: insertedSets, error: setsError } = await supabase
      .from('sets')
      .insert(setsToInsert)
      .select();
    
    if (setsError) {
      console.error('Error adding sets:', setsError);
      throw setsError;
    }
    
    // Transform the data to match the expected structure
    return {
      id: newExercise.id,
      workoutId: newExercise.workout_id,
      name: newExercise.name,
      createdAt: newExercise.created_at,
      sets: (insertedSets || []).map(set => ({
        id: set.id,
        exerciseId: set.exercise_id,
        setNumber: set.set_number,
        reps: set.reps,
        weight: parseFloat(set.weight),
        createdAt: set.created_at
      }))
    };
  },
  
  // Update an exercise and its sets
  async updateExercise(exerciseId: string, exerciseData: ExerciseWithSets): Promise<ExerciseWithSetsType> {
    // Update exercise name
    const { data: updatedExercise, error: exerciseError } = await supabase
      .from('exercises')
      .update({ name: exerciseData.name })
      .eq('id', exerciseId)
      .select()
      .single();
    
    if (exerciseError) {
      console.error('Error updating exercise:', exerciseError);
      throw exerciseError;
    }
    
    // Delete existing sets
    const { error: deleteError } = await supabase
      .from('sets')
      .delete()
      .eq('exercise_id', exerciseId);
    
    if (deleteError) {
      console.error('Error deleting sets:', deleteError);
      throw deleteError;
    }
    
    // Insert new sets
    const setsToInsert = exerciseData.sets.map((set, index) => ({
      exercise_id: exerciseId,
      set_number: index + 1,
      reps: set.reps,
      weight: set.weight
    }));
    
    const { data: insertedSets, error: insertError } = await supabase
      .from('sets')
      .insert(setsToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting new sets:', insertError);
      throw insertError;
    }
    
    // Transform the data to match the expected structure
    return {
      id: updatedExercise.id,
      workoutId: updatedExercise.workout_id,
      name: updatedExercise.name,
      createdAt: updatedExercise.created_at,
      sets: (insertedSets || []).map(set => ({
        id: set.id,
        exerciseId: set.exercise_id,
        setNumber: set.set_number,
        reps: set.reps,
        weight: parseFloat(set.weight),
        createdAt: set.created_at
      }))
    };
  },
  
  // Delete an exercise and its sets
  async deleteExercise(exerciseId: string): Promise<void> {
    // Delete the exercise (sets will be cascade deleted)
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);
    
    if (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },
  
  // Get all unique exercise names
  async getUniqueExerciseNames(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Error getting exercise names:', error);
      throw error;
    }
    
    // Get unique names only
    const namesArray = data?.map(item => item.name) || [];
    const uniqueNames = Array.from(new Set(namesArray));
    return uniqueNames;
  },
  
  // Get exercise history by name and date range
  async getExerciseHistory(exerciseName: string, dateRange: string): Promise<ExerciseHistoryItem[]> {
    const today = new Date();
    let startDate = today;
    
    // Determine start date based on range
    switch (dateRange) {
      case 'last-month':
        startDate = subMonths(today, 1);
        break;
      case 'last-3-months':
        startDate = subMonths(today, 3);
        break;
      case 'last-6-months':
        startDate = subMonths(today, 6);
        break;
      case 'last-year':
        startDate = subMonths(today, 12);
        break;
      case 'all-time':
        // No filter needed for all time
        break;
    }
    
    // Format start date for filtering
    const formattedStartDate = dateRange !== 'all-time' 
      ? format(startDate, 'yyyy-MM-dd')
      : undefined;
    
    // Get all workouts with this exercise
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, date')
      .order('date', { ascending: false });
    
    if (workoutsError) {
      console.error('Error getting workouts for history:', workoutsError);
      throw workoutsError;
    }
    
    // Filter workouts by date range if needed
    const filteredWorkouts = dateRange !== 'all-time'
      ? workoutsData?.filter(w => w.date >= formattedStartDate!) || []
      : workoutsData || [];
    
    // Get exercises for these workouts that match the name
    const result: ExerciseHistoryItem[] = [];
    
    for (const workout of filteredWorkouts) {
      // Get exercises matching the name for this workout
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('workout_id', workout.id)
        .eq('name', exerciseName);
      
      if (exercisesError) {
        console.error('Error getting exercises for history:', exercisesError);
        throw exercisesError;
      }
      
      // For each exercise, get all sets
      for (const exercise of exercises || []) {
        const { data: sets, error: setsError } = await supabase
          .from('sets')
          .select('*')
          .eq('exercise_id', exercise.id)
          .order('set_number', { ascending: true });
        
        if (setsError) {
          console.error('Error getting sets for history:', setsError);
          throw setsError;
        }
        
        // Add sets to result
        const formattedDate = format(new Date(workout.date), 'MMMM d, yyyy');
        for (const set of sets || []) {
          result.push({
            date: formattedDate,
            setNumber: set.set_number,
            reps: set.reps,
            weight: parseFloat(set.weight)
          });
        }
      }
    }
    
    return result;
  },
  
  // Get progress data for charts
  async getProgressData(exerciseName: string, metric: string): Promise<ExerciseProgressData[]> {
    // Get all workouts
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, date')
      .order('date', { ascending: true });
    
    if (workoutsError) {
      console.error('Error getting workouts for progress data:', workoutsError);
      throw workoutsError;
    }
    
    const result: ExerciseProgressData[] = [];
    
    for (const workout of workoutsData || []) {
      // Get all exercises with this name for this workout
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id')
        .eq('workout_id', workout.id)
        .eq('name', exerciseName);
      
      if (exercisesError) {
        console.error('Error getting exercises for progress data:', exercisesError);
        throw exercisesError;
      }
      
      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map(e => e.id);
        
        // Get all sets for these exercises
        const { data: sets, error: setsError } = await supabase
          .from('sets')
          .select('*')
          .in('exercise_id', exerciseIds);
        
        if (setsError) {
          console.error('Error getting sets for progress data:', setsError);
          throw setsError;
        }
        
        const date = format(new Date(workout.date), 'MMM d');
        let value = 0;
        
        if (metric === 'max-weight') {
          // Find max weight across all sets
          value = Math.max(...(sets || []).map(set => parseFloat(set.weight)), 0);
        } 
        else if (metric === 'volume') {
          // Calculate total volume (weight * reps)
          value = (sets || []).reduce((total, set) => {
            return total + (parseFloat(set.weight) * set.reps);
          }, 0);
        }
        else if (metric === 'one-rep-max') {
          // Calculate estimated 1RM using Brzycki formula for each set and find the max
          value = Math.max(...(sets || [])
            .filter(set => set.reps <= 30) // Prevent division by zero or negative
            .map(set => parseFloat(set.weight) * (36 / (37 - set.reps))), 0);
        }
        
        if (value > 0) {
          result.push({ date, value });
        }
      }
    }
    
    return result;
  },
  
  // Get personal records for all exercises
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    // First get all unique exercise names
    const { data: exerciseNames, error: namesError } = await supabase
      .from('exercises')
      .select('name')
      .order('name');
    
    if (namesError) {
      console.error('Error getting exercise names for PRs:', namesError);
      throw namesError;
    }
    
    // Get unique names
    const namesArray = exerciseNames?.map(item => item.name) || [];
    const uniqueNames = Array.from(new Set(namesArray));
    
    // For each exercise name, find the personal record
    const personalRecords: PersonalRecord[] = [];
    
    for (const name of uniqueNames) {
      // Get all exercises with this name
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, workout_id')
        .eq('name', name);
      
      if (exercisesError) {
        console.error('Error getting exercises for PRs:', exercisesError);
        throw exercisesError;
      }
      
      let maxWeight = 0;
      let recordDate = '';
      
      // For each exercise, find the max weight
      for (const exercise of exercises || []) {
        // Get all sets for this exercise
        const { data: sets, error: setsError } = await supabase
          .from('sets')
          .select('weight')
          .eq('exercise_id', exercise.id);
        
        if (setsError) {
          console.error('Error getting sets for PRs:', setsError);
          throw setsError;
        }
        
        // Find the max weight in these sets
        for (const set of sets || []) {
          const weight = parseFloat(set.weight);
          if (weight > maxWeight) {
            maxWeight = weight;
            
            // Get the date for this workout
            const { data: workout, error: workoutError } = await supabase
              .from('workouts')
              .select('date')
              .eq('id', exercise.workout_id)
              .single();
            
            if (workoutError) {
              console.error('Error getting workout date for PR:', workoutError);
              throw workoutError;
            }
            
            recordDate = workout.date;
          }
        }
      }
      
      // Add this exercise's PR to the results
      if (maxWeight > 0) {
        personalRecords.push({
          exerciseName: name,
          weight: maxWeight,
          date: format(new Date(recordDate), 'MMMM d, yyyy')
        });
      }
    }
    
    // Sort by weight, highest first
    return personalRecords.sort((a, b) => b.weight - a.weight);
  },
  
  // Clear all data (for resetting the application)
  async clearAllData(): Promise<void> {
    // Delete all data from sets table
    const { error: setsError } = await supabase
      .from('sets')
      .delete()
      .not('id', 'is', null);
    
    if (setsError) {
      console.error('Error clearing sets data:', setsError);
      throw setsError;
    }
    
    // Delete all data from exercises table
    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .not('id', 'is', null);
    
    if (exercisesError) {
      console.error('Error clearing exercises data:', exercisesError);
      throw exercisesError;
    }
    
    // Delete all data from workouts table
    const { error: workoutsError } = await supabase
      .from('workouts')
      .delete()
      .not('id', 'is', null);
    
    if (workoutsError) {
      console.error('Error clearing workouts data:', workoutsError);
      throw workoutsError;
    }
    
    console.log('All data cleared successfully');
  }
};