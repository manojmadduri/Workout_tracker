// API client for connecting to the backend
import { WorkoutExercise } from '@/hooks/use-workout';
import type { ExerciseWithSets } from '@/shared/schema';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchTodayWorkout() {
  const response = await fetch(`${API_URL}/api/workouts/today`);
  if (!response.ok) throw new Error('Failed to fetch today\'s workout');
  return response.json();
}

export async function fetchWorkoutByDate(date: string) {
  const response = await fetch(`${API_URL}/api/workouts/date/${date}`);
  if (!response.ok) throw new Error(`Failed to fetch workout for ${date}`);
  return response.json();
}

export async function fetchExerciseNames() {
  const response = await fetch(`${API_URL}/api/exercises/names`);
  if (!response.ok) throw new Error('Failed to fetch exercise names');
  return response.json();
}

export async function fetchPersonalRecords() {
  const response = await fetch(`${API_URL}/api/records`);
  if (!response.ok) throw new Error('Failed to fetch personal records');
  return response.json();
}

export async function addExercise(exercise: ExerciseWithSets) {
  const response = await fetch(`${API_URL}/api/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exercise),
  });
  
  if (!response.ok) throw new Error('Failed to add exercise');
  return response.json();
}

export async function updateExercise(id: string, exercise: ExerciseWithSets) {
  const response = await fetch(`${API_URL}/api/exercises/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exercise),
  });
  
  if (!response.ok) throw new Error('Failed to update exercise');
  return response.json();
}

export async function deleteExercise(id: string) {
  const response = await fetch(`${API_URL}/api/exercises/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete exercise');
  return true;
}

export async function fetchExerciseHistory(exerciseName: string, dateRange: string) {
  const response = await fetch(`${API_URL}/api/exercises/history?exerciseName=${encodeURIComponent(exerciseName)}&dateRange=${dateRange}`);
  if (!response.ok) throw new Error('Failed to fetch exercise history');
  return response.json();
}

export async function fetchProgressData(exerciseName: string, metric: string) {
  const response = await fetch(`${API_URL}/api/exercises/progress?exerciseName=${encodeURIComponent(exerciseName)}&metric=${metric}`);
  if (!response.ok) throw new Error('Failed to fetch progress data');
  return response.json();
}

export async function clearAllData() {
  const response = await fetch(`${API_URL}/api/clear-data`, {
    method: 'POST',
  });
  
  if (!response.ok) throw new Error('Failed to clear data');
  return response.json();
}