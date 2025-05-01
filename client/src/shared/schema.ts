// Simplified schema just for frontend types
import { z } from 'zod';

// Exercise with sets schema
export const exerciseWithSetsSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(
    z.object({
      setNumber: z.number().optional(),
      reps: z.number().min(1, "Reps must be at least 1"),
      weight: z.number().min(0, "Weight cannot be negative"),
    })
  ).min(1, "At least one set is required"),
});

export type ExerciseWithSets = z.infer<typeof exerciseWithSetsSchema>;

// Exercise history query schema
export const exerciseHistoryQuerySchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
  dateRange: z.enum(['last-month', 'last-3-months', 'last-6-months', 'last-year', 'all-time']),
});

export type ExerciseHistoryQuery = z.infer<typeof exerciseHistoryQuerySchema>;

// Progress stats query schema
export const progressStatsQuerySchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
  metric: z.enum(['max-weight', 'volume', 'one-rep-max']),
});

export type ProgressStatsQuery = z.infer<typeof progressStatsQuerySchema>;