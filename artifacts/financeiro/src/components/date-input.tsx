import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, required, className }: DateInputProps) {
  const displayValue = value ? value.split("-").reverse().join("/") : "";

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        readOnly
        value={displayValue}
        placeholder="dd/mm/aaaa"
        className="flex-1 cursor-default select-none"
        tabIndex={-1}
      />

      <div className="relative shrink-0 w-10 h-10">
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary pointer-events-none">
          <Calendar className="h-4 w-4 text-primary-foreground" />
        </div>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [color-scheme:dark]"
        />
      </div>
    </div>
  );
}
