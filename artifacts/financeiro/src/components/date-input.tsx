import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, required, className }: DateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className={cn("date-input", className)}
    />
  );
}
