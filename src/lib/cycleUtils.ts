import { CycleData, DayMealPlan, DayWorkout } from './types';

export function getCycleDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diff % 21) + 1;
}

export function getDaysRemaining(startDate: string): number {
  return 21 - getCycleDay(startDate) + 1;
}

export function createEmptyMealPlan(day: number): DayMealPlan {
  return {
    day,
    meals: [
      { id: crypto.randomUUID(), name: 'Meal 1', items: [] },
      { id: crypto.randomUUID(), name: 'Meal 2', items: [] },
      { id: crypto.randomUUID(), name: 'Meal 3', items: [] },
    ],
  };
}

export function createEmptyWorkout(day: number): DayWorkout {
  return { day, groups: [] };
}

export function getDefaultCycleData(): CycleData {
  return {
    cycleStartDate: new Date().toISOString().split('T')[0],
    mealPlans: Array.from({ length: 21 }, (_, i) => createEmptyMealPlan(i + 1)),
    workouts: Array.from({ length: 21 }, (_, i) => createEmptyWorkout(i + 1)),
    measurements: [],
    foodList: { proteins: [], carbohydrates: [], vegetables: [] },
  };
}
