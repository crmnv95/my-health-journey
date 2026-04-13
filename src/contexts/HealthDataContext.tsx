import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getDefaultCycleData } from '@/lib/cycleUtils';
import type { CycleData, BodyMeasurement } from '@/lib/types';

interface HealthDataContextType {
  data: CycleData;
  loading: boolean;
  setData: (updater: CycleData | ((prev: CycleData) => CycleData)) => void;
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => Promise<void>;
  removeMeasurement: (id: string) => Promise<void>;
}

const HealthDataContext = createContext<HealthDataContextType | null>(null);

export function HealthDataProvider({ children }: { children: ReactNode }) {
  const [data, setLocalData] = useState<CycleData>(getDefaultCycleData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const seedDefaults = async (defaults: CycleData) => {
    await Promise.all([
      supabase.from('cycle_config').upsert({ id: 1, cycle_start_date: defaults.cycleStartDate }),
      ...defaults.mealPlans.map(p =>
        supabase.from('meal_plans').upsert({ day: p.day, meals: p.meals })
      ),
      ...defaults.workouts.map(w =>
        supabase.from('workouts').upsert({ day: w.day, groups: w.groups })
      ),
      supabase.from('food_list').upsert({
        id: 1,
        proteins: defaults.foodList.proteins,
        carbohydrates: defaults.foodList.carbohydrates,
        vegetables: defaults.foodList.vegetables,
      }),
    ]);
  };

  const loadData = async () => {
    try {
      const [configResult, mealResult, workoutResult, measurementResult, foodResult] =
        await Promise.all([
          supabase.from('cycle_config').select('cycle_start_date').single(),
          supabase.from('meal_plans').select('day, meals').order('day'),
          supabase.from('workouts').select('day, groups').order('day'),
          supabase.from('body_measurements').select('*').order('date', { ascending: false }),
          supabase.from('food_list').select('*').single(),
        ]);

      const defaults = getDefaultCycleData();

      // No data yet — seed defaults into Supabase
      if (configResult.error || !configResult.data) {
        await seedDefaults(defaults);
        setLocalData(defaults);
        return;
      }

      const mealPlans = defaults.mealPlans.map(defaultPlan => {
        const row = mealResult.data?.find(r => r.day === defaultPlan.day);
        return row ? { day: row.day, meals: row.meals } : defaultPlan;
      });

      const workouts = defaults.workouts.map(defaultWorkout => {
        const row = workoutResult.data?.find(r => r.day === defaultWorkout.day);
        return row ? { day: row.day, groups: row.groups } : defaultWorkout;
      });

      const measurements: BodyMeasurement[] = (measurementResult.data ?? []).map(row => ({
        id: row.id,
        date: row.date,
        weight: row.weight,
        waist: row.waist,
        hip: row.hip,
        neck: row.neck,
        chest: row.chest,
      }));

      const foodList = foodResult.data
        ? {
            proteins: foodResult.data.proteins ?? [],
            carbohydrates: foodResult.data.carbohydrates ?? [],
            vegetables: foodResult.data.vegetables ?? [],
          }
        : defaults.foodList;

      setLocalData({
        cycleStartDate: configResult.data.cycle_start_date,
        mealPlans,
        workouts,
        measurements,
        foodList,
      });
    } finally {
      setLoading(false);
    }
  };

  const syncToSupabase = useCallback(async (prev: CycleData, next: CycleData) => {
    const ops: Promise<unknown>[] = [];

    if (prev.cycleStartDate !== next.cycleStartDate) {
      ops.push(
        supabase.from('cycle_config').upsert({ id: 1, cycle_start_date: next.cycleStartDate })
      );
    }

    next.mealPlans.forEach((plan, i) => {
      if (plan !== prev.mealPlans[i]) {
        ops.push(supabase.from('meal_plans').upsert({ day: plan.day, meals: plan.meals }));
      }
    });

    next.workouts.forEach((workout, i) => {
      if (workout !== prev.workouts[i]) {
        ops.push(supabase.from('workouts').upsert({ day: workout.day, groups: workout.groups }));
      }
    });

    if (prev.foodList !== next.foodList) {
      ops.push(
        supabase.from('food_list').upsert({
          id: 1,
          proteins: next.foodList.proteins,
          carbohydrates: next.foodList.carbohydrates,
          vegetables: next.foodList.vegetables,
        })
      );
    }

    await Promise.all(ops);
  }, []);

  const setData = useCallback(
    (updater: CycleData | ((prev: CycleData) => CycleData)) => {
      setLocalData(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        syncToSupabase(prev, next);
        return next;
      });
    },
    [syncToSupabase]
  );

  const addMeasurement = useCallback(async (measurement: Omit<BodyMeasurement, 'id'>) => {
    const { data: row, error } = await supabase
      .from('body_measurements')
      .insert({
        date: measurement.date,
        weight: measurement.weight,
        waist: measurement.waist,
        hip: measurement.hip,
        neck: measurement.neck,
        chest: measurement.chest,
      })
      .select()
      .single();

    if (!error && row) {
      const newMeasurement: BodyMeasurement = { id: row.id, ...measurement };
      setLocalData(prev => ({
        ...prev,
        measurements: [newMeasurement, ...prev.measurements].sort((a, b) =>
          b.date.localeCompare(a.date)
        ),
      }));
    }
  }, []);

  const removeMeasurement = useCallback(async (id: string) => {
    await supabase.from('body_measurements').delete().eq('id', id);
    setLocalData(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== id),
    }));
  }, []);

  return (
    <HealthDataContext.Provider value={{ data, loading, setData, addMeasurement, removeMeasurement }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : (
        children
      )}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const ctx = useContext(HealthDataContext);
  if (!ctx) throw new Error('useHealthData must be used within HealthDataProvider');
  return ctx;
}
