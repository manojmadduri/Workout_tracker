import { useQuery, useMutation } from "@tanstack/react-query";
import { ExerciseWithSets } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for API responses
export type WorkoutSet = {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  createdAt: string;
};

export type WorkoutExercise = {
  id: string;
  workoutId: string;
  name: string;
  createdAt: string;
  sets: WorkoutSet[];
};

export type TodayWorkout = {
  id?: string;
  date?: string;
  createdAt?: string;
  exercises: WorkoutExercise[];
};

export type ExerciseHistory = {
  date: string;
  setNumber: number;
  reps: number;
  weight: number;
};

export type ProgressData = {
  date: string;
  value: number;
};

export type PersonalRecord = {
  exerciseName: string;
  weight: number;
  date: string;
};

export function useWorkout() {
  const { toast } = useToast();
  
  // Get today's workout
  const { 
    data: todayWorkout, 
    isLoading: isTodayWorkoutLoading,
    refetch: refetchTodayWorkout
  } = useQuery<TodayWorkout>({
    queryKey: ['/api/workouts/today'],
    refetchOnWindowFocus: true,
  });
  
  // Get workout by specific date
  const getWorkoutByDate = (date: string) => {
    return useQuery<TodayWorkout>({
      queryKey: ['/api/workouts/date', date],
      queryFn: async () => {
        const res = await fetch(`/api/workouts/date/${date}`);
        if (!res.ok) {
          throw new Error('Failed to fetch workout data');
        }
        return res.json();
      },
      enabled: !!date && /^\d{4}-\d{2}-\d{2}$/.test(date), // Only fetch if date is valid format
    });
  };
  
  // Get exercise names
  const {
    data: exerciseNames = [],
    isLoading: isExerciseNamesLoading
  } = useQuery<string[]>({
    queryKey: ['/api/exercises/names'],
  });
  
  // Add exercise
  const addExerciseMutation = useMutation({
    mutationFn: async (exerciseData: ExerciseWithSets) => {
      const res = await apiRequest('POST', '/api/exercises', exerciseData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/exercises/names'] });
      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add exercise: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update exercise
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ExerciseWithSets }) => {
      const res = await apiRequest('PUT', `/api/exercises/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts/today'] });
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update exercise: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete exercise
  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts/today'] });
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete exercise: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Get exercise history
  const getExerciseHistory = (exerciseName: string, dateRange: string) => {
    return useQuery<ExerciseHistory[]>({
      queryKey: ['/api/exercises/history', exerciseName, dateRange],
      queryFn: async () => {
        const res = await fetch(`/api/exercises/history?exerciseName=${encodeURIComponent(exerciseName)}&dateRange=${dateRange}`);
        if (!res.ok) {
          throw new Error('Failed to fetch exercise history');
        }
        return res.json();
      },
      enabled: !!exerciseName && !!dateRange,
    });
  };
  
  // Get progress data
  const getProgressData = (exerciseName: string, metric: string) => {
    return useQuery<ProgressData[]>({
      queryKey: ['/api/exercises/progress', exerciseName, metric],
      queryFn: async () => {
        const res = await fetch(`/api/exercises/progress?exerciseName=${encodeURIComponent(exerciseName)}&metric=${metric}`);
        if (!res.ok) {
          throw new Error('Failed to fetch progress data');
        }
        return res.json();
      },
      enabled: !!exerciseName && !!metric,
    });
  };
  
  // Get personal records
  const { 
    data: personalRecords = [],
    isLoading: isPersonalRecordsLoading
  } = useQuery<PersonalRecord[]>({
    queryKey: ['/api/records'],
  });
  
  return {
    // Queries
    todayWorkout,
    isTodayWorkoutLoading,
    refetchTodayWorkout,
    getWorkoutByDate,
    exerciseNames,
    isExerciseNamesLoading,
    getExerciseHistory,
    getProgressData,
    personalRecords,
    isPersonalRecordsLoading,
    
    // Mutations
    addExercise: addExerciseMutation.mutate,
    updateExercise: updateExerciseMutation.mutate,
    deleteExercise: deleteExerciseMutation.mutate,
    
    // Loading states
    isAddingExercise: addExerciseMutation.isPending,
    isUpdatingExercise: updateExerciseMutation.isPending,
    isDeletingExercise: deleteExerciseMutation.isPending,
  };
}
