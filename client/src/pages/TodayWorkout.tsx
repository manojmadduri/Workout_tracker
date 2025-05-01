import { useState, useEffect } from "react";
import { format, parseISO, addDays, subDays } from "date-fns";
import ExerciseForm from "@/components/ExerciseForm";
import ExerciseCard from "@/components/ExerciseCard";
import { useWorkout, WorkoutExercise } from "@/hooks/use-workout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExerciseWithSets } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function TodayWorkout() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayDate, setDisplayDate] = useState("");
  const [isToday, setIsToday] = useState(true);
  
  const { 
    todayWorkout, 
    isTodayWorkoutLoading, 
    getWorkoutByDate,
    addExercise, 
    updateExercise, 
    deleteExercise,
    isAddingExercise,
    isUpdatingExercise,
    isDeletingExercise
  } = useWorkout();
  
  // Get workout data for a specific date (only if not today)
  const {
    data: dateWorkoutData,
    isLoading: isDateWorkoutLoading,
  } = getWorkoutByDate(format(selectedDate, 'yyyy-MM-dd'));
  
  useEffect(() => {
    // Update the display date when selected date changes
    setDisplayDate(format(selectedDate, 'MMMM d, yyyy'));
    
    // Check if the selected date is today
    const today = new Date();
    const isSelectedDateToday = 
      today.getFullYear() === selectedDate.getFullYear() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getDate() === selectedDate.getDate();
    
    setIsToday(isSelectedDateToday);
  }, [selectedDate]);

  // Determine which workout data and loading state to use
  const currentWorkout = isToday ? todayWorkout : dateWorkoutData;
  const isLoading = isToday ? isTodayWorkoutLoading : isDateWorkoutLoading;
  
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);

  // Handle date navigation
  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Handle form submit for adding or updating exercise
  const handleExerciseSubmit = (data: ExerciseWithSets) => {
    if (editingExercise) {
      updateExercise({ id: editingExercise.id, data });
      setEditingExercise(null);
    } else {
      addExercise(data);
    }
  };
  
  // Handle delete exercise
  const handleDeleteExercise = (id: string) => {
    if (confirm("Are you sure you want to delete this exercise?")) {
      deleteExercise(id);
    }
  };
  
  // Handle edit exercise
  const handleEditExercise = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get the page title based on the selected date
  const getPageTitle = () => {
    if (isToday) {
      return "Today's Workout";
    } 
    
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const yesterday = subDays(today, 1);
    
    if (
      selectedDate.getFullYear() === tomorrow.getFullYear() &&
      selectedDate.getMonth() === tomorrow.getMonth() &&
      selectedDate.getDate() === tomorrow.getDate()
    ) {
      return "Tomorrow's Workout";
    }
    
    if (
      selectedDate.getFullYear() === yesterday.getFullYear() &&
      selectedDate.getMonth() === yesterday.getMonth() &&
      selectedDate.getDate() === yesterday.getDate()
    ) {
      return "Yesterday's Workout";
    }
    
    return "Workout";
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Date Navigation Header */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
                {!isToday && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToToday}
                    className="text-primary-600"
                  >
                    Go to Today
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
                      fetch('/api/clear-data', { 
                        method: 'POST' 
                      }).then(res => {
                        if (res.ok) {
                          alert("All data cleared successfully!");
                          window.location.reload();
                        } else {
                          alert("Failed to clear data");
                        }
                      });
                    }
                  }}
                >
                  Clear All Data
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToPreviousDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="min-w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {displayDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextDay}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Workout Form - Only show for today and future dates */}
        {(isToday || selectedDate > new Date()) && (
          <div className="mt-6">
            <ExerciseForm 
              onSubmit={handleExerciseSubmit} 
              exercise={editingExercise || undefined}
              isSubmitting={isAddingExercise || isUpdatingExercise}
            />
          </div>
        )}
        
        {/* Exercises List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Exercises for {displayDate}
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : currentWorkout?.exercises && currentWorkout.exercises.length > 0 ? (
            currentWorkout.exercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-6">
                <Alert>
                  <AlertDescription>
                    No exercises logged for this date. 
                    {(isToday || selectedDate > new Date()) 
                      ? " Use the form above to add your first exercise."
                      : ""}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
