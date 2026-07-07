import { athleteProfile } from "../data/athleteProfile";
import { Card } from "../components/Card";
import { BellIcon, ResetIcon } from "../components/Icons";
import { SectionIntro } from "../components/SectionIntro";
import { TOTAL_PROGRAM_WEEKS } from "../data/workouts";
import type { NotificationSettings } from "../types";

type NotificationPermissionState = NotificationPermission | "unsupported";

type SettingsScreenProps = {
  currentWeek: number;
  notificationPermission: NotificationPermissionState;
  notificationSettings: NotificationSettings;
  onChangeWeek: (week: number) => void;
  onRequestNotificationPermission: () => void;
  onRequestReset: () => void;
  onSendTestNotification: () => void;
  onToggleNotificationSetting: (setting: "restTimer" | "trainingReminder") => void;
};

const notificationCopy: Record<NotificationPermissionState, string> = {
  default: "Aún no hay permiso. Puedes activarlo para avisos de descanso y recordatorios.",
  denied: "El permiso fue rechazado. Puedes cambiarlo después desde los ajustes del navegador.",
  granted: "Las notificaciones locales ya pueden acompañar el entrenamiento.",
  unsupported: "Este dispositivo o navegador no expone notificaciones locales completas."
};

export const SettingsScreen = ({
  currentWeek,
  notificationPermission,
  notificationSettings,
  onChangeWeek,
  onRequestNotificationPermission,
  onRequestReset,
  onSendTestNotification,
  onToggleNotificationSetting
}: SettingsScreenProps) => (
  <div className="space-y-5">
    <SectionIntro
      eyebrow="Ajustes"
      title="Contexto y control"
      description="Aquí mantienes semana, avisos y el contexto base de la usuaria sin tocar la arquitectura del producto."
      side={<span className="badge-soft">Semana {currentWeek}</span>}
    />

    <Card className="space-y-5">
      <div>
        <p className="eyebrow">Semana actual</p>
        <h2 className="mt-2 text-[1.65rem] font-semibold text-fog-100">Punto del programa</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChangeWeek(currentWeek - 1)}
          className="secondary-button h-12 w-12 shrink-0 rounded-full p-0"
        >
          -
        </button>

        <label className="field-shell min-w-0 flex-1">
          <span className="sr-only">Cambiar semana actual</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={TOTAL_PROGRAM_WEEKS}
            value={currentWeek}
            onChange={(event) => onChangeWeek(Number(event.target.value))}
            className="w-full bg-transparent text-center text-[1.9rem] font-semibold tracking-[-0.04em] text-fog-100 outline-none"
          />
        </label>

        <button
          type="button"
          onClick={() => onChangeWeek(currentWeek + 1)}
          className="secondary-button h-12 w-12 shrink-0 rounded-full p-0"
        >
          +
        </button>
      </div>

      <input
        type="range"
        min={1}
        max={TOTAL_PROGRAM_WEEKS}
        value={currentWeek}
        onChange={(event) => onChangeWeek(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-accent-400"
      />
    </Card>

    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Perfil base</p>
          <h2 className="mt-2 text-[1.45rem] font-semibold text-fog-100">
            Restricciones que siempre se respetan
          </h2>
        </div>
        <span className="badge-soft">{athleteProfile.level}</span>
      </div>

      <div className="space-y-3">
        {athleteProfile.trainingPreferences
          .concat(athleteProfile.sensitivities)
          .concat(athleteProfile.historyNotes)
          .map((item) => (
            <div key={item} className="card-subtle text-sm leading-6 text-fog-300">
              {item}
            </div>
          ))}
      </div>
    </Card>

    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Notificaciones</p>
          <h2 className="mt-2 text-[1.45rem] font-semibold text-fog-100">
            Avisos de descanso y recordatorios
          </h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500/12 text-accent-300">
          <BellIcon className="h-5 w-5" />
        </span>
      </div>

      <p className="text-sm leading-6 text-fog-300">{notificationCopy[notificationPermission]}</p>

      <div className="space-y-3">
        <div className="card-subtle">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-fog-100">Aviso al terminar descanso</p>
              <p className="mt-1 text-sm leading-6 text-fog-300">
                Dispara un aviso cuando el cronómetro llegue a cero.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotificationSetting("restTimer")}
              className={notificationSettings.restTimer ? "badge-strong" : "badge-soft"}
            >
              {notificationSettings.restTimer ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="card-subtle">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-fog-100">Recordatorio del día</p>
              <p className="mt-1 text-sm leading-6 text-fog-300">
                Si hoy no has entrenado, la app te lo recordará cuando entres.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotificationSetting("trainingReminder")}
              className={notificationSettings.trainingReminder ? "badge-strong" : "badge-soft"}
            >
              {notificationSettings.trainingReminder ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRequestNotificationPermission}
          className="secondary-button"
          disabled={notificationPermission === "unsupported"}
        >
          Dar permiso
        </button>
        <button
          type="button"
          onClick={onSendTestNotification}
          className="primary-button"
          disabled={notificationPermission !== "granted"}
        >
          Probar aviso
        </button>
      </div>
    </Card>

    <Card tone="dark" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-white/60">Reiniciar progreso</p>
          <p className="mt-3 text-sm leading-7 text-white/78">
            Borra historial, series, pesos y check-ins guardados. Conservamos únicamente las preferencias de avisos.
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-white/80">
          <ResetIcon className="h-5 w-5" />
        </span>
      </div>

      <button type="button" onClick={onRequestReset} className="secondary-button w-full">
        Reiniciar progreso
      </button>
    </Card>
  </div>
);
