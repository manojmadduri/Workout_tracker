import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { 
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutExercise } from "@/hooks/use-workout";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onEdit: (exercise: WorkoutExercise) => void;
  onDelete: (id: string) => void;
}

export default function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">{exercise.name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onEdit(exercise)}
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(exercise.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span className="w-16 text-center">Set</span>
          <span className="w-24 text-center">Reps</span>
          <span className="w-24 text-center">Weight</span>
        </div>
        
        {exercise.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set) => (
            <div 
              key={set.id} 
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <span className="w-16 text-center text-gray-700">{set.setNumber}</span>
              <span className="w-24 text-center text-gray-700">{set.reps}</span>
              <span className="w-24 text-center text-gray-700">{set.weight} lbs</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
