export interface Meal {
  id: string;
  name: string;
  items: string[];
}

export interface DayMealPlan {
  day: number;
  meals: Meal[];
}

export interface Exercise {
  id: string;
  name: string;
  weight: number | null;
  sets: number | null;
  reps: number | null;
  notes: string;
}

export interface WorkoutGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface DayWorkout {
  day: number;
  groups: WorkoutGroup[];
}

export interface BodyMeasurement {
  id?: string;
  date: string;
  weight: number | null;
  waist: number | null;
  hip: number | null;
  neck: number | null;
  chest: number | null;
}

export interface FoodList {
  proteins: string[];
  carbohydrates: string[];
  vegetables: string[];
}

export interface CycleData {
  cycleStartDate: string;
  mealPlans: DayMealPlan[];
  workouts: DayWorkout[];
  measurements: BodyMeasurement[];
  foodList: FoodList;
}
