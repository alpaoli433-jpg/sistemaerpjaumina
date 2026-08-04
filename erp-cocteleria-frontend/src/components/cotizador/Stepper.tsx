"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: StepperProps) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(Math.min(max, value + step));

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ivory">{label}</p>
        <p className="text-xs text-smoke">{unit}</p>
      </div>
      <div className="flex items-center gap-3">
        <StepperButton
          onClick={decrease}
          disabled={value <= min}
          label={`Disminuir ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" strokeWidth={2} />
        </StepperButton>
        <span
          className="w-10 text-center font-display text-xl font-semibold tabular-nums text-champagne-gold"
          aria-live="polite"
        >
          {value}
        </span>
        <StepperButton
          onClick={increase}
          disabled={value >= max}
          label={`Aumentar ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </StepperButton>
      </div>
    </div>
  );
}

function StepperButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-glass-border text-ivory transition-colors",
        "hover:border-champagne-gold hover:text-champagne-gold",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}
