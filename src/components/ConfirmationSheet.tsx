type ConfirmationSheetProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmationSheet = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: ConfirmationSheetProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/48 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6 backdrop-blur-md">
      <button
        type="button"
        aria-label="Cerrar confirmación"
        className="absolute inset-0"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-surface animate-[sheet-up_260ms_cubic-bezier(0.22,1,0.36,1)_both] w-full max-w-[430px] p-5"
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/10" />
        <p className="eyebrow">Confirmación</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-fog-100">{title}</h2>
        <p className="mt-3 text-[0.95rem] leading-7 text-fog-300">{description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="secondary-button">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="primary-button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
