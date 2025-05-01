import { pgTable, text, serial, integer, date, uuid, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Workouts table - stores workout sessions by date
export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercises table - stores exercises performed in a workout
export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workout_id").references(() => workouts.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sets table - stores sets performed for each exercise
export const sets = pgTable("sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "cascade" }).notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [exercises.workoutId], references: [workouts.id] }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, { fields: [sets.exerciseId], references: [exercises.id] }),
}));

// Create zod schemas for validation
export const workoutInsertSchema = createInsertSchema(workouts);
export type WorkoutInsert = z.infer<typeof workoutInsertSchema>;
export type Workout = typeof workouts.$inferSelect;

export const exerciseInsertSchema = createInsertSchema(exercises);
export type ExerciseInsert = z.infer<typeof exerciseInsertSchema>;
export type Exercise = typeof exercises.$inferSelect;

export const setInsertSchema = createInsertSchema(sets);
export type SetInsert = z.infer<typeof setInsertSchema>;
export type Set = typeof sets.$inferSelect;

// Custom schema for creating a complete exercise with sets
export const exerciseWithSetsSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(
    z.object({
      reps: z.coerce.number().min(1, "Reps must be at least 1"),
      weight: z.coerce.number().min(0, "Weight cannot be negative"),
    })
  ).min(1, "At least one set is required"),
});

export type ExerciseWithSets = z.infer<typeof exerciseWithSetsSchema>;

// Schema for exercise history queries
export const exerciseHistoryQuerySchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
  dateRange: z.enum(["last-month", "last-3-months", "last-6-months", "last-year", "all-time"]),
});

export type ExerciseHistoryQuery = z.infer<typeof exerciseHistoryQuerySchema>;

// Schema for progress stats queries
export const progressStatsQuerySchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
  metric: z.enum(["max-weight", "volume", "one-rep-max"]),
});

export type ProgressStatsQuery = z.infer<typeof progressStatsQuerySchema>;
