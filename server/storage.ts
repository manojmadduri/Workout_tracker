import { db } from "@db";
import { 
  workouts, exercises, sets, 
  Workout, Exercise, Set, 
  WorkoutInsert, ExerciseInsert, SetInsert, 
  ExerciseWithSets
} from "@shared/schema";
import { eq, and, desc, sql, gt, lt, between, gte, lte } from "drizzle-orm";
import { subDays, subMonths, format } from "date-fns";

// Types for query responses
export type ExerciseWithSetsType = Exercise & { sets: Set[] };
export type WorkoutWithExercisesType = Workout & { exercises: ExerciseWithSetsType[] };

export type ExerciseHistoryItem = {
  date: string;
  setNumber: number;
  reps: number;
  weight: number | string;
};

export type ExerciseProgressData = {
  date: string;
  value: number;
};

export type PersonalRecord = {
  exerciseName: string;
  weight: number;
  date: string;
};

export const storage = {
  // Create new workout for a specific date
  async createWorkout(date?: string): Promise<Workout> {
    const targetDate = date ? new Date(date) : new Date();
    const formattedDate = format(targetDate, 'yyyy-MM-dd');
    
    // Check if workout for the date already exists
    const existingWorkout = await db.query.workouts.findFirst({
      where: eq(workouts.date, formattedDate)
    });
    
    if (existingWorkout) {
      return existingWorkout;
    }
    
    // Create new workout for the specified date
    const [newWorkout] = await db.insert(workouts)
      .values({
        date: formattedDate
      })
      .returning();
    
    return newWorkout;
  },
  
  // Get today's workout with exercises and sets
  async getTodayWorkout(): Promise<WorkoutWithExercisesType | null> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.getWorkoutByDate(today);
  },
  
  // Get workout for a specific date
  async getWorkoutByDate(date: string): Promise<WorkoutWithExercisesType | null> {
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.date, date),
      with: {
        exercises: {
          with: {
            sets: true
          },
          orderBy: exercises.createdAt
        }
      }
    });
    
    return workout;
  },
  
  // Add exercise with sets to today's workout
  async addExerciseWithSets(exerciseData: ExerciseWithSets): Promise<ExerciseWithSetsType> {
    // Get or create today's workout
    const workout = await this.createWorkout();
    
    // Insert exercise
    const [newExercise] = await db.insert(exercises)
      .values({
        workoutId: workout.id,
        name: exerciseData.name
      })
      .returning();
    
    // Insert sets for the exercise
    const setsToInsert = exerciseData.sets.map((set, index) => ({
      exerciseId: newExercise.id,
      setNumber: index + 1,
      reps: set.reps,
      weight: set.weight
    }));
    
    const insertedSets = await db.insert(sets)
      .values(setsToInsert)
      .returning();
    
    return {
      ...newExercise,
      sets: insertedSets
    };
  },
  
  // Update an exercise and its sets
  async updateExercise(exerciseId: string, exerciseData: ExerciseWithSets): Promise<ExerciseWithSetsType> {
    // Update exercise name
    const [updatedExercise] = await db.update(exercises)
      .set({ name: exerciseData.name })
      .where(eq(exercises.id, exerciseId))
      .returning();
    
    // Delete existing sets
    await db.delete(sets).where(eq(sets.exerciseId, exerciseId));
    
    // Insert new sets
    const setsToInsert = exerciseData.sets.map((set, index) => ({
      exerciseId: exerciseId,
      setNumber: index + 1,
      reps: set.reps,
      weight: set.weight
    }));
    
    const insertedSets = await db.insert(sets)
      .values(setsToInsert)
      .returning();
    
    return {
      ...updatedExercise,
      sets: insertedSets
    };
  },
  
  // Delete an exercise and its sets
  async deleteExercise(exerciseId: string): Promise<void> {
    await db.delete(exercises).where(eq(exercises.id, exerciseId));
  },
  
  // Get all unique exercise names
  async getUniqueExerciseNames(): Promise<string[]> {
    const result = await db.select({ name: exercises.name })
      .from(exercises)
      .groupBy(exercises.name)
      .orderBy(exercises.name);
    
    return result.map(item => item.name);
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
    
    // Build query condition
    let dateCondition = undefined;
    if (dateRange !== 'all-time') {
      dateCondition = gte(workouts.date, format(startDate, 'yyyy-MM-dd'));
    }
    
    // Query the database
    const result = await db.select({
      date: workouts.date,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight
    })
    .from(workouts)
    .innerJoin(exercises, eq(exercises.workoutId, workouts.id))
    .innerJoin(sets, eq(sets.exerciseId, exercises.id))
    .where(and(
      eq(exercises.name, exerciseName),
      dateCondition
    ))
    .orderBy(desc(workouts.date), sets.setNumber);
    
    // Format the results
    return result.map(item => ({
      date: format(new Date(item.date), 'MMMM d, yyyy'),
      setNumber: item.setNumber,
      reps: item.reps,
      weight: typeof item.weight === 'number' 
        ? item.weight 
        : parseFloat(item.weight.toString())
    }));
  },
  
  // Get progress data for charts
  async getProgressData(exerciseName: string, metric: string): Promise<ExerciseProgressData[]> {
    const result: ExerciseProgressData[] = [];
    
    if (metric === 'max-weight') {
      // Get max weight per day
      const data = await db.select({
        date: workouts.date,
        maxWeight: sql<string>`MAX(${sets.weight})::float`
      })
      .from(workouts)
      .innerJoin(exercises, eq(exercises.workoutId, workouts.id))
      .innerJoin(sets, eq(sets.exerciseId, exercises.id))
      .where(eq(exercises.name, exerciseName))
      .groupBy(workouts.date)
      .orderBy(workouts.date);
      
      result.push(...data.map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        value: parseFloat(item.maxWeight)
      })));
    } 
    else if (metric === 'volume') {
      // Get total volume (weight * reps) per day
      const data = await db.select({
        date: workouts.date,
        volume: sql<string>`SUM(${sets.weight}::float * ${sets.reps})::float`
      })
      .from(workouts)
      .innerJoin(exercises, eq(exercises.workoutId, workouts.id))
      .innerJoin(sets, eq(sets.exerciseId, exercises.id))
      .where(eq(exercises.name, exerciseName))
      .groupBy(workouts.date)
      .orderBy(workouts.date);
      
      result.push(...data.map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        value: parseFloat(item.volume)
      })));
    }
    else if (metric === 'one-rep-max') {
      // Get estimated 1RM using Brzycki formula: weight * (36 / (37 - reps))
      const data = await db.select({
        date: workouts.date,
        oneRepMax: sql<string>`MAX(${sets.weight}::float * (36 / (37 - ${sets.reps})))::float`
      })
      .from(workouts)
      .innerJoin(exercises, eq(exercises.workoutId, workouts.id))
      .innerJoin(sets, eq(sets.exerciseId, exercises.id))
      .where(and(
        eq(exercises.name, exerciseName),
        lte(sets.reps, 30) // Prevent division by zero or negative
      ))
      .groupBy(workouts.date)
      .orderBy(workouts.date);
      
      result.push(...data.map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        value: parseFloat(item.oneRepMax)
      })));
    }
    
    return result;
  },
  
  // Get personal records for all exercises
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    // Get max weight lifted for each exercise
    const data = await db.select({
      exerciseName: exercises.name,
      weight: sql<string>`MAX(${sets.weight})::float`,
      date: workouts.date
    })
    .from(exercises)
    .innerJoin(sets, eq(sets.exerciseId, exercises.id))
    .innerJoin(workouts, eq(workouts.id, exercises.workoutId))
    .groupBy(exercises.name, workouts.date)
    .orderBy(desc(sql<string>`MAX(${sets.weight})::float`));
    
    // Find PRs for each exercise
    const exercisePRs = new Map<string, PersonalRecord>();
    
    for (const record of data) {
      const weight = parseFloat(record.weight);
      const existingPR = exercisePRs.get(record.exerciseName);
      
      if (!existingPR || weight > existingPR.weight) {
        exercisePRs.set(record.exerciseName, {
          exerciseName: record.exerciseName,
          weight,
          date: format(new Date(record.date), 'MMMM d, yyyy')
        });
      }
    }
    
    return Array.from(exercisePRs.values());
  }
};
