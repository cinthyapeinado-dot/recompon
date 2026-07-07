import { Card } from "../components/Card";
import { BellIcon, ResetIcon, SparkIcon } from "../components/Icons";
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
  default: "Aún no has dado permiso. Puedes activarlo para avisos de descanso y recordatorios.",
  denied: "El permiso fue rechazado. Puedes cambiarlo más tarde desde los ajustes del navegador.",
  granted: "Las notificaciones locales están listas para avisarte desde la app.",
  unsupported: "Este dispositivo o navegador no expone la API de notificaciones locales."
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
      title="Personaliza tu bloque"
      description="Controla la semana actual, las notificaciones locales y el reinicio de progreso desde una sola vista."
      side={<span className="top-pill">Semana {currentWeek}</span>}
    />

    <Card className="p-0">
      <div className="px-5 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
          Semana actual
        </p>
        <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-ink-200">
          Ajusta tu punto del programa
        </h2>
      </div>

      <div className="flex items-center gap-3 px-5 pt-5">
        <button
          type="button"
          onClick={() => onChangeWeek(currentWeek - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/78 text-xl font-semibold text-ink-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:-translate-y-0.5"
        >
          -
        </button>

        <label className="min-w-0 flex-1">
          <span className="sr-only">Cambiar semana actual</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={TOTAL_PROGRAM_WEEKS}
            value={currentWeek}
            onChange={(event) => onChangeWeek(Number(event.target.value))}
            className="w-full rounded-[24px] border border-white/70 bg-white/72 px-4 py-3 text-center text-[1.9rem] font-semibold tracking-[-0.04em] text-ink-200 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition focus:border-blush-300"
          />
        </label>

        <button
          type="button"
          onClick={() => onChangeWeek(currentWeek + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/78 text-xl font-semibold text-ink-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition hover:-translate-y-0.5"
        >
          +
        </button>
      </div>

      <div className="px-5 pb-5 pt-5">
        <input
          type="range"
          min={1}
          max={TOTAL_PROGRAM_WEEKS}
          value={currentWeek}
          onChange={(event) => onChangeWeek(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/74 accent-[#b9788f]"
        />
        <p className="mt-3 text-sm leading-6 text-ink-50">
          Déjala entre 1 y {TOTAL_PROGRAM_WEEKS}, según el bloque real en el que vas.
        </p>
      </div>
    </Card>

    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50">
            Notificaciones locales
          </p>
          <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-ink-200">
            Avisos de descanso y recordatorios
          </h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-100 text-blush-500">
          <BellIcon className="h-5 w-5" />
        </span>
      </div>

      <p className="text-sm leading-6 text-ink-50">{notificationCopy[notificationPermission]}</p>

      <div className="grid gap-3">
        <div className="rounded-[24px] bg-white/74 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-200">Aviso al terminar descanso</p>
              <p className="mt-1 text-sm leading-6 text-ink-50">
                Notifica cuando el cronómetro llegue a cero.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotificationSetting("restTimer")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                notificationSettings.restTimer ? "bg-ink-200 text-white" : "bg-sand-50 text-ink-50"
              }`}
            >
              {notificationSettings.restTimer ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/74 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-200">Recordatorio del día</p>
              <p className="mt-1 text-sm leading-6 text-ink-50">
                Muestra un aviso cuando abras la app y todavía no hayas entrenado hoy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleNotificationSetting("trainingReminder")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                notificationSettings.trainingReminder ? "bg-ink-200 text-white" : "bg-sand-50 text-ink-50"
              }`}
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

    <Card tone="dark" className="px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Reiniciar progreso
          </p>
          <p className="mt-3 text-base leading-7 text-white/92">
            Borra historial, checklists, pesos registrados y vuelve la semana actual al inicio.
          </p>
        </div>
        <span className="rounded-full bg-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <ResetIcon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-[24px] bg-white/8 px-4 py-3 text-sm text-white/72">
        <SparkIcon className="h-4 w-4" />
        Las preferencias de notificación pueden conservarse aunque limpies el avance.
      </div>

      <button type="button" onClick={onRequestReset} className="secondary-button mt-5 w-full">
        Reiniciar progreso
      </button>
    </Card>
  </div>
);
