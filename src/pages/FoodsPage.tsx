import { useState } from 'react';
import { Plus, X, Drumstick, Wheat, Salad } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getDefaultCycleData } from '@/lib/cycleUtils';
import type { CycleData, FoodList } from '@/lib/types';

const categories: { key: keyof FoodList; label: string; icon: typeof Drumstick; color: string }[] = [
  { key: 'proteins', label: 'Proteins', icon: Drumstick, color: 'text-red-400' },
  { key: 'carbohydrates', label: 'Carbohydrates', icon: Wheat, color: 'text-warning' },
  { key: 'vegetables', label: 'Vegetables', icon: Salad, color: 'text-primary' },
];

export default function FoodsPage() {
  const [data, setData] = useLocalStorage<CycleData>('fitnessData', getDefaultCycleData());
  const [inputs, setInputs] = useState<Record<string, string>>({ proteins: '', carbohydrates: '', vegetables: '' });

  const addFood = (cat: keyof FoodList) => {
    const val = inputs[cat]?.trim();
    if (!val) return;
    setData(prev => ({
      ...prev,
      foodList: {
        ...prev.foodList,
        [cat]: [...prev.foodList[cat], val],
      },
    }));
    setInputs(prev => ({ ...prev, [cat]: '' }));
  };

  const removeFood = (cat: keyof FoodList, idx: number) => {
    setData(prev => ({
      ...prev,
      foodList: {
        ...prev.foodList,
        [cat]: prev.foodList[cat].filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Allowed Foods</h1>
        <p className="text-xs text-muted-foreground mt-1">Your go-to foods for this cycle</p>
      </div>
      <div className="px-4 space-y-4">
        {categories.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} /> {label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.foodList[key].map((food, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs"
                >
                  {food}
                  <button onClick={() => removeFood(key, idx)}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </span>
              ))}
              {data.foodList[key].length === 0 && (
                <span className="text-xs text-muted-foreground">No items yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                placeholder={`Add ${label.toLowerCase()}...`}
                value={inputs[key]}
                onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addFood(key)}
              />
              <button
                onClick={() => addFood(key)}
                className="bg-primary text-primary-foreground rounded-lg px-3 py-2"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
