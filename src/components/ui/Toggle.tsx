interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  label?: string;
}

export function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      className="flex items-center gap-2"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      aria-label={label}
    >
      <span className={`toggle ${on ? "on" : ""}`}>
        <span className="toggle-knob" />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}
