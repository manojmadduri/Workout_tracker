import { useState } from "react";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkoutExercise } from "@/hooks/use-workout";

const formSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.array(
    z.object({
      reps: z.coerce.number().min(1, "Reps must be at least 1"),
      weight: z.coerce.number().min(0, "Weight cannot be negative"),
    })
  ).min(1, "At least one set is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ExerciseFormProps {
  onSubmit: (data: FormValues) => void;
  exercise?: WorkoutExercise;
  isSubmitting: boolean;
}

export default function ExerciseForm({ onSubmit, exercise, isSubmitting }: ExerciseFormProps) {
  // Pre-populate form with exercise data if editing, otherwise start with one empty set
  const defaultValues: FormValues = exercise
    ? {
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
        })),
      }
    : {
        name: "",
        sets: [{ reps: 0, weight: 0 }],
      };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Use useFieldArray instead of accessing form.control._fields directly
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sets",
  });
  
  // Add a new set
  const addSet = () => {
    append({ reps: 0, weight: 0 });
  };
  
  // Remove a set
  const removeSet = (index: number) => {
    // Don't remove if it's the only set
    if (fields.length <= 1) return;
    remove(index);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {exercise ? "Edit Exercise" : "Add Exercise"}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            {/* Exercise Name - Make it larger and more prominent */}
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2">Exercise Name*</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bench Press, Squats, Deadlift"
                        className="text-lg py-6 px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 font-medium" />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel className="block mb-2">Sets</FormLabel>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex mb-3 gap-3">
                  <div className="w-1/4">
                    <FormLabel className="block text-xs text-gray-500">
                      Set #{index + 1}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name={`sets.${index}.reps`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Reps"
                              min={1}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseInt(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="w-1/4">
                    <FormLabel className="block text-xs text-gray-500">
                      Weight (lbs)
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name={`sets.${index}.weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Weight"
                              min={0}
                              step={2.5}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseFloat(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => removeSet(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="mt-1"
                onClick={addSet}
              >
                <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Add Set
              </Button>
            </div>
            
            {/* Instruction text */}
            <div className="text-sm text-gray-500 mb-4">
              {isSubmitting ? 
                "Saving exercise..." : 
                "Fill in the form and click 'Save Exercise' to track your workout"}
            </div>
            
            {/* Large Save Button - Full Width */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {exercise ? "Updating..." : "Saving..."}
                </>
              ) : (
                exercise ? "UPDATE EXERCISE" : "SAVE EXERCISE"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
