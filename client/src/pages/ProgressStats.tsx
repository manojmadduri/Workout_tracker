import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWorkout } from "@/hooks/use-workout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function ProgressStats() {
  const { 
    exerciseNames, 
    isExerciseNamesLoading, 
    getProgressData,
    personalRecords,
    isPersonalRecordsLoading
  } = useWorkout();
  
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("max-weight");
  
  // Get progress data based on selected exercise and metric
  const { 
    data: progressData = [], 
    isLoading: isProgressDataLoading,
    isError: isProgressDataError 
  } = getProgressData(selectedExercise, selectedMetric);
  
  // Get metric display name
  const getMetricDisplayName = () => {
    switch (selectedMetric) {
      case "max-weight":
        return "Max Weight";
      case "volume":
        return "Total Volume";
      case "one-rep-max":
        return "Estimated 1RM";
      default:
        return "";
    }
  };
  
  // Define gradient colors for personal record cards
  const gradientColors = [
    "from-primary-500 to-primary-600",
    "from-[#10b981] to-[#059669]", // success-500 to success-600
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-amber-500 to-amber-600",
    "from-pink-500 to-pink-600",
  ];
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Progress Stats</h1>
        
        {/* Exercise Progress Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">View Progress</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="progress-exercise" className="mb-1">Exercise</Label>
                <Select
                  value={selectedExercise}
                  onValueChange={setSelectedExercise}
                  disabled={isExerciseNamesLoading}
                >
                  <SelectTrigger id="progress-exercise">
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
                <Label htmlFor="progress-metric" className="mb-1">Metric</Label>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                  disabled={!selectedExercise}
                >
                  <SelectTrigger id="progress-metric">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max-weight">Max Weight</SelectItem>
                    <SelectItem value="volume">Total Volume</SelectItem>
                    <SelectItem value="one-rep-max">Estimated 1RM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress Chart */}
        <Card className="mb-6">
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-medium">
              {selectedExercise 
                ? `${selectedExercise} Progress - ${getMetricDisplayName()}` 
                : "Exercise Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!selectedExercise ? (
              <div className="h-64 flex items-center justify-center">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Select an exercise and metric to view progress data.
                  </AlertDescription>
                </Alert>
              </div>
            ) : isProgressDataLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : isProgressDataError ? (
              <div className="h-64 flex items-center justify-center">
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading progress data. Please try again.
                  </AlertDescription>
                </Alert>
              </div>
            ) : progressData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <Alert>
                  <AlertDescription>
                    No progress data available for the selected exercise and metric.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ${selectedMetric === 'max-weight' ? 'lbs' : ''}`]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={getMetricDisplayName()}
                      stroke="#4f46e5"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Personal Records */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-medium">Personal Records</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isPersonalRecordsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : personalRecords.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No personal records found. Start logging your workouts to see your records here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalRecords.map((record, index) => (
                  <div 
                    key={record.exerciseName}
                    className={`bg-gradient-to-r ${gradientColors[index % gradientColors.length]} rounded-lg p-4 text-white`}
                  >
                    <h3 className="text-sm font-medium opacity-80 mb-1">{record.exerciseName}</h3>
                    <p className="text-2xl font-bold">{record.weight} lbs</p>
                    <p className="text-xs opacity-80 mt-1">Achieved on {record.date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
