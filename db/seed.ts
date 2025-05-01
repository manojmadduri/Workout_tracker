import { db } from "./index";
import * as schema from "@shared/schema";
import { format, subDays } from "date-fns";

async function seed() {
  try {
    console.log("Seeding database with initial workout data...");
    
    // Create sample workout data for the past week
    const today = new Date();
    
    // Sample exercises with their sets
    const exercises = [
      {
        name: "Bench Press",
        sets: [
          { reps: 8, weight: 135 },
          { reps: 6, weight: 145 },
          { reps: 6, weight: 145 }
        ]
      },
      {
        name: "Squat",
        sets: [
          { reps: 10, weight: 185 },
          { reps: 8, weight: 205 },
          { reps: 8, weight: 225 }
        ]
      },
      {
        name: "Deadlift",
        sets: [
          { reps: 8, weight: 225 },
          { reps: 6, weight: 245 },
          { reps: 5, weight: 265 }
        ]
      },
      {
        name: "Overhead Press",
        sets: [
          { reps: 10, weight: 85 },
          { reps: 8, weight: 95 },
          { reps: 6, weight: 95 }
        ]
      }
    ];
    
    // Create workouts for the past 3 weeks with progressive overload
    for (let i = 21; i >= 0; i -= 3) {
      const workoutDate = subDays(today, i);
      const formattedDate = format(workoutDate, 'yyyy-MM-dd');
      
      // Insert workout
      const [workout] = await db.insert(schema.workouts)
        .values({
          date: formattedDate
        })
        .returning();
      
      // Insert exercises and sets with progressive overload
      for (const exercise of exercises) {
        const [newExercise] = await db.insert(schema.exercises)
          .values({
            workoutId: workout.id,
            name: exercise.name
          })
          .returning();
        
        // Calculate progressive overload - increase weights by ~2.5% each week
        const progressFactor = 1 + (0.025 * Math.floor(i / 7));
        
        // Insert sets
        const setsToInsert = exercise.sets.map((set, index) => ({
          exerciseId: newExercise.id,
          setNumber: index + 1,
          reps: set.reps,
          weight: Math.round(set.weight / progressFactor) // Reduce weight for older workouts
        }));
        
        await db.insert(schema.sets)
          .values(setsToInsert)
          .returning();
      }
    }
    
    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
