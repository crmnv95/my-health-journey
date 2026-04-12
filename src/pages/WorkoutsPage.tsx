import { useState } from 'react';
import { Plus, X, Dumbbell } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getDefaultCycleData, getCycleDay } from '@/lib/cycleUtils';
import CycleHeader from '@/components/CycleHeader';
import type { CycleData, Exercise } from '@/lib/types';

export default function WorkoutsPage() {
  const [data, setData] = useLocalStorage<CycleData>('fitnessData', getDefaultCycleData());
  const currentDay = getCycleDay(data.cycleStartDate);
  const dayWorkout = data.workouts.find(w => w.day === currentDay) || { day: currentDay, exercises: [] };
  const [newName, setNewName] = useState('');

  const updateExercises = (exercises: Exercise[]) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.map(w =>
        w.day === currentDay ? { ...w, exercises } : w
      ),
    }));
  };

  const addExercise = () => {
    if (!newName.trim()) return;
    updateExercises([
      ...dayWorkout.exercises,
      { id: crypto.randomUUID(), name: newName.trim(), weight: null },
    ]);
    setNewName('');
  };

  const updateWeight = (id: string, weight: string) => {
    const val = weight === '' ? null : parseFloat(weight);
    updateExercises(
      dayWorkout.exercises.map(e => (e.id === id ? { ...e, weight: val } : e))
    );
  };

  const removeExercise = (id: string) => {
    updateExercises(dayWorkout.exercises.filter(e => e.id !== id));
  };

  return (
    <div className="pb-24">
      <CycleHeader startDate={data.cycleStartDate} title="Workout Plan" />
      <div className="px-4 space-y-3">
        {dayWorkout.exercises.map(ex => (
          <div key={ex.id} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{ex.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-16 bg-secondary text-secondary-foreground rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                placeholder="kg"
                value={ex.weight ?? ''}
                onChange={e => updateWeight(ex.id, e.target.value)}
              />
              <span className="text-xs text-muted-foreground">kg</span>
              <button onClick={() => removeExercise(ex.id)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            className="flex-1 bg-card border border-border text-foreground rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Exercise name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExercise()}
          />
          <button
            onClick={addExercise}
            className="bg-primary text-primary-foreground rounded-xl px-4 py-3"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
