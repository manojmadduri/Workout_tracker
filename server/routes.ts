import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseStorage } from "./supabase-storage";
import { exerciseWithSetsSchema, exerciseHistoryQuerySchema, progressStatsQuerySchema } from "@shared/schema";
import { z } from "zod";

// Use Supabase storage instead of the local database
const storage = supabaseStorage;

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Get today's workout
  app.get(`${apiPrefix}/workouts/today`, async (req, res) => {
    try {
      const workout = await storage.getTodayWorkout();
      return res.json(workout || { exercises: [] });
    } catch (error) {
      console.error('Error fetching today\'s workout:', error);
      return res.status(500).json({ error: 'Failed to fetch workout data' });
    }
  });
  
  // Get workout by date
  app.get(`${apiPrefix}/workouts/date/:date`, async (req, res) => {
    try {
      const { date } = req.params;
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      
      const workout = await storage.getWorkoutByDate(date);
      return res.json(workout || { exercises: [] });
    } catch (error) {
      console.error('Error fetching workout by date:', error);
      return res.status(500).json({ error: 'Failed to fetch workout data' });
    }
  });
  
  // Add exercise to today's workout
  app.post(`${apiPrefix}/exercises`, async (req, res) => {
    try {
      const exerciseData = exerciseWithSetsSchema.parse(req.body);
      const result = await storage.addExerciseWithSets(exerciseData);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error adding exercise:', error);
      return res.status(500).json({ error: 'Failed to add exercise' });
    }
  });
  
  // Update existing exercise
  app.put(`${apiPrefix}/exercises/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const exerciseData = exerciseWithSetsSchema.parse(req.body);
      const result = await storage.updateExercise(id, exerciseData);
      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating exercise:', error);
      return res.status(500).json({ error: 'Failed to update exercise' });
    }
  });
  
  // Delete exercise
  app.delete(`${apiPrefix}/exercises/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExercise(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return res.status(500).json({ error: 'Failed to delete exercise' });
    }
  });
  
  // Get unique exercise names for dropdowns
  app.get(`${apiPrefix}/exercises/names`, async (req, res) => {
    try {
      const names = await storage.getUniqueExerciseNames();
      return res.json(names);
    } catch (error) {
      console.error('Error fetching exercise names:', error);
      return res.status(500).json({ error: 'Failed to fetch exercise names' });
    }
  });
  
  // Get exercise history
  app.get(`${apiPrefix}/exercises/history`, async (req, res) => {
    try {
      const { exerciseName, dateRange } = exerciseHistoryQuerySchema.parse({
        exerciseName: req.query.exerciseName,
        dateRange: req.query.dateRange || 'last-month'
      });
      
      const history = await storage.getExerciseHistory(exerciseName, dateRange);
      return res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error fetching exercise history:', error);
      return res.status(500).json({ error: 'Failed to fetch exercise history' });
    }
  });
  
  // Get progress data for charts
  app.get(`${apiPrefix}/exercises/progress`, async (req, res) => {
    try {
      const { exerciseName, metric } = progressStatsQuerySchema.parse({
        exerciseName: req.query.exerciseName,
        metric: req.query.metric || 'max-weight'
      });
      
      const progressData = await storage.getProgressData(exerciseName, metric);
      return res.json(progressData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error fetching progress data:', error);
      return res.status(500).json({ error: 'Failed to fetch progress data' });
    }
  });
  
  // Get personal records
  app.get(`${apiPrefix}/records`, async (req, res) => {
    try {
      const records = await storage.getPersonalRecords();
      return res.json(records);
    } catch (error) {
      console.error('Error fetching personal records:', error);
      return res.status(500).json({ error: 'Failed to fetch personal records' });
    }
  });
  
  // Clear all seed data
  app.post(`${apiPrefix}/clear-data`, async (req, res) => {
    try {
      await storage.clearAllData();
      return res.json({ success: true, message: 'All data cleared successfully' });
    } catch (error) {
      console.error('Error clearing data:', error);
      return res.status(500).json({ error: 'Failed to clear data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
