import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateInput({ value, onChange, required }: DateInputProps) {
  const displayValue = value ? value.split("-").reverse().join("/") : "";

  return (
    <div className="relative flex gap-2">
      <Input
        readOnly
        value={displayValue}
        placeholder="dd/mm/aaaa"
        className="flex-1 cursor-pointer"
      />
      <Button type="button" size="icon" className="shrink-0 pointer-events-none" tabIndex={-1}>
        <Calendar className="h-4 w-4" />
      </Button>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
  );
}
