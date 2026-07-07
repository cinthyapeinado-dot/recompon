import type { AppScreen } from "../types";
import { cn } from "../utils/cn";
import { CalendarIcon, ChartIcon, HomeIcon, SettingsIcon } from "./Icons";

type BottomNavProps = {
  activeScreen: AppScreen;
  onChange: (screen: Exclude<AppScreen, "workout">) => void;
};

const navItems = [
  { id: "home", label: "Inicio", icon: HomeIcon },
  { id: "agenda", label: "Agenda", icon: CalendarIcon },
  { id: "progression", label: "Progreso", icon: ChartIcon },
  { id: "settings", label: "Ajustes", icon: SettingsIcon }
] as const;

export const BottomNav = ({ activeScreen, onChange }: BottomNavProps) => {
  const resolvedScreen = activeScreen === "workout" ? "agenda" : activeScreen;

  return (
    <nav
      aria-label="Navegación principal"
      className="frost-nav fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[398px] -translate-x-1/2 px-2 py-2"
    >
      <ul className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = resolvedScreen === item.id;
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Ir a ${item.label}`}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-[22px] px-3 py-2.5 text-[10px] font-semibold tracking-[0.02em] transition duration-300",
                  isActive ? "nav-active text-ink-200" : "text-ink-50 hover:text-ink-200"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
