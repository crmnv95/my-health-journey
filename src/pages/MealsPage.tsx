import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getDefaultCycleData, getCycleDay } from '@/lib/cycleUtils';
import CycleHeader from '@/components/CycleHeader';
import type { CycleData, Meal } from '@/lib/types';

export default function MealsPage() {
  const [data, setData] = useLocalStorage<CycleData>('fitnessData', getDefaultCycleData());
  const currentDay = getCycleDay(data.cycleStartDate);
  const dayPlan = data.mealPlans.find(p => p.day === currentDay) || { day: currentDay, meals: [] };
  const [expandedMeal, setExpandedMeal] = useState<string | null>(dayPlan.meals[0]?.id || null);
  const [newItem, setNewItem] = useState('');

  const updateMeals = (meals: Meal[]) => {
    setData(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.map(p =>
        p.day === currentDay ? { ...p, meals } : p
      ),
    }));
  };

  const addMeal = () => {
    const num = dayPlan.meals.length + 1;
    const meal: Meal = { id: crypto.randomUUID(), name: `Meal ${num}`, items: [] };
    updateMeals([...dayPlan.meals, meal]);
    setExpandedMeal(meal.id);
  };

  const removeMeal = (id: string) => {
    updateMeals(dayPlan.meals.filter(m => m.id !== id));
  };

  const addItem = (mealId: string) => {
    if (!newItem.trim()) return;
    updateMeals(
      dayPlan.meals.map(m =>
        m.id === mealId ? { ...m, items: [...m.items, newItem.trim()] } : m
      )
    );
    setNewItem('');
  };

  const removeItem = (mealId: string, idx: number) => {
    updateMeals(
      dayPlan.meals.map(m =>
        m.id === mealId ? { ...m, items: m.items.filter((_, i) => i !== idx) } : m
      )
    );
  };

  return (
    <div className="pb-24">
      <CycleHeader startDate={data.cycleStartDate} title="Meal Plan" />
      <div className="px-4 space-y-3">
        {dayPlan.meals.map(meal => {
          const isExpanded = expandedMeal === meal.id;
          return (
            <div key={meal.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="font-semibold text-foreground">{meal.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{meal.items.length} items</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {meal.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                      <span className="text-sm text-secondary-foreground">{item}</span>
                      <button onClick={() => removeItem(meal.id, idx)}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Add food item..."
                      value={expandedMeal === meal.id ? newItem : ''}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addItem(meal.id)}
                    />
                    <button
                      onClick={() => addItem(meal.id)}
                      className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="text-xs text-destructive mt-1"
                  >
                    Remove meal
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <button
          onClick={addMeal}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>
    </div>
  );
}
