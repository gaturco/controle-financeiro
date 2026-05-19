import { useRef } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, required, className }: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null);
  const displayValue = value ? value.split("-").reverse().join("/") : "";

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        readOnly
        value={displayValue}
        placeholder="dd/mm/aaaa"
        className="flex-1 cursor-pointer"
        onClick={() => nativeRef.current?.click()}
      />
      <Button
        type="button"
        size="icon"
        className="shrink-0 bg-primary hover:bg-primary/80 text-primary-foreground"
        onClick={() => nativeRef.current?.click()}
      >
        <Calendar className="h-4 w-4" />
      </Button>
      <input
        ref={nativeRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
}
