import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Ruler, TrendingDown, TrendingUp, Minus, Trash2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHealthData } from '@/contexts/HealthDataContext';
import CycleHeader from '@/components/CycleHeader';
import type { BodyMeasurement } from '@/lib/types';

const fields: { key: keyof Omit<BodyMeasurement, 'date' | 'id'>; label: string; unit: string }[] = [
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hip', label: 'Hip', unit: 'cm' },
  { key: 'neck', label: 'Neck', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
];

export default function BodyPage() {
  const { data, addMeasurement, removeMeasurement } = useHealthData();
  const [form, setForm] = useState<Omit<BodyMeasurement, 'date' | 'id'>>({
    weight: null, waist: null, hip: null, neck: null, chest: null,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleAddMeasurement = async () => {
    await addMeasurement({
      date: format(selectedDate, 'yyyy-MM-dd'),
      ...form,
    });
    setForm({ weight: null, waist: null, hip: null, neck: null, chest: null });
    setSelectedDate(new Date());
  };

  const handleRemoveMeasurement = (id: string) => {
    removeMeasurement(id);
  };

  const getDelta = (current: number | null, previous: number | null) => {
    if (current == null || previous == null) return null;
    return +(current - previous).toFixed(1);
  };

  return (
    <div className="pb-24">
      <CycleHeader startDate={data.cycleStartDate} title="Body Measurements" />
      <div className="px-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" /> New Entry
          </h2>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-secondary border-0 text-sm",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{f.label} ({f.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  placeholder={f.unit}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    [f.key]: e.target.value === '' ? null : parseFloat(e.target.value),
                  }))}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleAddMeasurement}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Entry
          </button>
        </div>

        {data.measurements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">History & Comparison</h3>
            {data.measurements.map((m, idx) => {
              const prev = data.measurements[idx + 1] || null;
              return (
                <div key={m.id ?? idx} className="bg-card rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{m.date}</p>
                    <button onClick={() => m.id && handleRemoveMeasurement(m.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {fields.map(f => {
                      const delta = prev ? getDelta(m[f.key], prev[f.key]) : null;
                      return (
                        <div key={f.key} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{f.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground font-medium">
                              {m[f.key] != null ? `${m[f.key]} ${f.unit}` : '—'}
                            </span>
                            {delta !== null && delta !== 0 && (
                              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${delta < 0 ? 'text-primary' : 'text-red-400'}`}>
                                {delta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                {delta > 0 ? '+' : ''}{delta}
                              </span>
                            )}
                            {delta === 0 && (
                              <Minus className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
