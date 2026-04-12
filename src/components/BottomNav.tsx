import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Dumbbell, Ruler, Apple } from 'lucide-react';

const tabs = [
  { to: '/', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/body', icon: Ruler, label: 'Body' },
  { to: '/foods', icon: Apple, label: 'Foods' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
