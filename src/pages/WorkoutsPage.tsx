import { useState } from 'react';
import { Plus, X, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getDefaultCycleData, getCycleDay } from '@/lib/cycleUtils';
import CycleHeader from '@/components/CycleHeader';
import type { CycleData, WorkoutGroup } from '@/lib/types';

const MAX_WORKOUTS = 5;

export default function WorkoutsPage() {
  const [data, setData] = useLocalStorage<CycleData>('fitnessData', getDefaultCycleData());
  const currentDay = getCycleDay(data.cycleStartDate);
  const rawWorkout = data.workouts.find(w => w.day === currentDay);
  const dayWorkout = rawWorkout && 'groups' in rawWorkout
    ? rawWorkout
    : { day: currentDay, groups: [] as WorkoutGroup[] };
  const [expandedGroup, setExpandedGroup] = useState<string | null>(dayWorkout.groups?.[0]?.id || null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const updateGroups = (groups: WorkoutGroup[]) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.map(w =>
        w.day === currentDay ? { ...w, groups } : w
      ),
    }));
  };

  const addGroup = () => {
    if (!newGroupName.trim() || dayWorkout.groups.length >= MAX_WORKOUTS) return;
    const group: WorkoutGroup = {
      id: crypto.randomUUID(),
      name: newGroupName.trim(),
      exercises: [],
    };
    updateGroups([...dayWorkout.groups, group]);
    setExpandedGroup(group.id);
    setNewGroupName('');
  };

  const removeGroup = (id: string) => {
    updateGroups(dayWorkout.groups.filter(g => g.id !== id));
  };

  const addExercise = (groupId: string) => {
    if (!newExerciseName.trim()) return;
    updateGroups(
      dayWorkout.groups.map(g =>
        g.id === groupId
          ? { ...g, exercises: [...g.exercises, { id: crypto.randomUUID(), name: newExerciseName.trim(), weight: null, sets: null, reps: null, notes: '' }] }
          : g
      )
    );
    setNewExerciseName('');
  };

  const updateExerciseField = (groupId: string, exId: string, field: 'weight' | 'sets' | 'reps', value: string) => {
    const val = value === '' ? null : parseFloat(value);
    updateGroups(
      dayWorkout.groups.map(g =>
        g.id === groupId
          ? { ...g, exercises: g.exercises.map(e => (e.id === exId ? { ...e, [field]: val } : e)) }
          : g
      )
    );
  };

  const updateExerciseNotes = (groupId: string, exId: string, notes: string) => {
    updateGroups(
      dayWorkout.groups.map(g =>
        g.id === groupId
          ? { ...g, exercises: g.exercises.map(e => (e.id === exId ? { ...e, notes } : e)) }
          : g
      )
    );
  };

  const removeExercise = (groupId: string, exId: string) => {
    updateGroups(
      dayWorkout.groups.map(g =>
        g.id === groupId
          ? { ...g, exercises: g.exercises.filter(e => e.id !== exId) }
          : g
      )
    );
  };

  return (
    <div className="pb-24">
      <CycleHeader startDate={data.cycleStartDate} title="Workout Plan" />
      <div className="px-4 space-y-3">
        {dayWorkout.groups.map((group, idx) => {
          const isExpanded = expandedGroup === group.id;
          return (
            <div key={group.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="font-semibold text-foreground">
                  Workout {idx + 1}: {group.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{group.exercises.length} exercises</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {group.exercises.map(ex => (
                    <div key={ex.id} className="bg-secondary rounded-lg px-3 py-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                        <span className="flex-1 text-sm text-secondary-foreground truncate">{ex.name}</span>
                        <button onClick={() => removeExercise(group.id, ex.id)}>
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <input
                          type="number"
                          className="w-14 bg-background text-foreground rounded-lg px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Sets"
                          value={ex.sets ?? ''}
                          onChange={e => updateExerciseField(group.id, ex.id, 'sets', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">sets</span>
                        <input
                          type="number"
                          className="w-14 bg-background text-foreground rounded-lg px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Reps"
                          value={ex.reps ?? ''}
                          onChange={e => updateExerciseField(group.id, ex.id, 'reps', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">reps</span>
                        <input
                          type="number"
                          className="w-14 bg-background text-foreground rounded-lg px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-primary"
                          placeholder="kg"
                          value={ex.weight ?? ''}
                          onChange={e => updateExerciseField(group.id, ex.id, 'weight', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">kg</span>
                      </div>
                      <textarea
                        className="w-full bg-background text-foreground rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none ml-6"
                        placeholder="Notes (how you feel, pain, etc.)..."
                        rows={1}
                        value={ex.notes ?? ''}
                        onChange={e => updateExerciseNotes(group.id, ex.id, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Exercise name..."
                      value={expandedGroup === group.id ? newExerciseName : ''}
                      onChange={e => setNewExerciseName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addExercise(group.id)}
                    />
                    <button
                      onClick={() => addExercise(group.id)}
                      className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-xs text-destructive mt-1"
                  >
                    Remove workout
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {dayWorkout.groups.length < MAX_WORKOUTS && (
          <div className="flex gap-2">
            <input
              className="flex-1 bg-card border border-border text-foreground rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              placeholder="Workout name (e.g. Lower Body)..."
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGroup()}
            />
            <button
              onClick={addGroup}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-3"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
