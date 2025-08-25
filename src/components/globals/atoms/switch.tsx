import * as React from "react";

type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
}

function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

const SIZE_MAP: Record<
  SwitchSize,
  { trackH: string; trackW: string; thumb: string; translate: string }
> = {
  sm: {
    trackH: "h-4",
    trackW: "w-7",
    thumb: "h-3 w-3",
    translate: "translate-x-3",
  },
  md: {
    trackH: "h-5",
    trackW: "w-9",
    thumb: "h-4 w-4",
    translate: "translate-x-4",
  },
  lg: {
    trackH: "h-6",
    trackW: "w-11",
    thumb: "h-5 w-5",
    translate: "translate-x-5",
  },
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, onCheckedChange, disabled, size = "md", className, ...props },
    ref,
  ) => {
    const dims = SIZE_MAP[size];

    const toggle = React.useCallback(() => {
      if (disabled) return;
      onCheckedChange(!checked);
    }, [checked, disabled, onCheckedChange]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        onClick={toggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-orange-400/50",
          disabled && "cursor-not-allowed opacity-60",
          // track
          dims.trackH,
          dims.trackW,
          checked
            ? "bg-gradient-to-tr from-orange-500 to-amber-500 shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset]"
            : "bg-white/20 ring-1 ring-white/15",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block transform rounded-full bg-white shadow ring-1 ring-black/10 transition-transform",
            "translate-x-1",
            dims.thumb,
            checked && dims.translate,
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
export default Switch;
