import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWorkout, ExerciseHistory } from "@/hooks/use-workout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function WorkoutHistory() {
  const { exerciseNames, isExerciseNamesLoading, getExerciseHistory } = useWorkout();
  
  const [selectedExercise, setSelectedExercise] = useState("");
  const [dateRange, setDateRange] = useState("last-month");
  
  // Get history data based on selected exercise and date range
  const { 
    data: historyData = [], 
    isLoading: isHistoryLoading,
    isError: isHistoryError 
  } = getExerciseHistory(selectedExercise, dateRange);
  
  // Format data for table display by grouping by date
  const formatHistoryData = (data: ExerciseHistory[]) => {
    // Group by date
    const groupedByDate = data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, ExerciseHistory[]>);
    
    // Create rows with rowSpan
    const result: (ExerciseHistory & { isFirstInGroup?: boolean; rowSpan?: number })[] = [];
    
    Object.entries(groupedByDate).forEach(([date, items]) => {
      items.forEach((item, index) => {
        const newItem = { ...item };
        if (index === 0) {
          newItem.isFirstInGroup = true;
          newItem.rowSpan = items.length;
        }
        result.push(newItem);
      });
    });
    
    return result;
  };
  
  // Define columns for data table
  const columns: ColumnDef<ExerciseHistory & { isFirstInGroup?: boolean; rowSpan?: number }>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const isFirstInGroup = row.original.isFirstInGroup;
        const rowSpan = row.original.rowSpan;
        
        if (isFirstInGroup) {
          return (
            <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {row.original.date}
            </td>
          );
        }
        return null;
      },
    },
    {
      accessorKey: "setNumber",
      header: "Set",
    },
    {
      accessorKey: "reps",
      header: "Reps",
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => `${row.original.weight} lbs`,
    },
  ];
  
  const formattedHistoryData = formatHistoryData(historyData);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Workout History</h1>
        
        {/* Exercise History Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Find Exercise History</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="exercise-filter" className="mb-1">Exercise Name</Label>
                <Select
                  value={selectedExercise}
                  onValueChange={setSelectedExercise}
                  disabled={isExerciseNamesLoading}
                >
                  <SelectTrigger id="exercise-filter">
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="date-range" className="mb-1">Date Range</Label>
                <Select
                  value={dateRange}
                  onValueChange={setDateRange}
                  disabled={!selectedExercise}
                >
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Exercise History Results */}
        <Card className="overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-medium">
              {selectedExercise ? `${selectedExercise} History` : "Exercise History"}
            </CardTitle>
          </CardHeader>
          
          <div className="overflow-x-auto">
            {!selectedExercise ? (
              <div className="p-6 text-center">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Select an exercise from the dropdown above to view its history.
                  </AlertDescription>
                </Alert>
              </div>
            ) : isHistoryLoading ? (
              <div className="p-6">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : isHistoryError ? (
              <div className="p-6 text-center">
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading history data. Please try again.
                  </AlertDescription>
                </Alert>
              </div>
            ) : formattedHistoryData.length === 0 ? (
              <div className="p-6 text-center">
                <Alert>
                  <AlertDescription>
                    No history found for the selected exercise and date range.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <DataTable columns={columns} data={formattedHistoryData} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
