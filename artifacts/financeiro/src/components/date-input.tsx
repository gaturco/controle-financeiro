import { useRef } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function DateInput({ value, onChange, required }: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null);

  const displayValue = value
    ? value.split("-").reverse().join("/")
    : "";

  const openPicker = () => {
    nativeRef.current?.showPicker();
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          readOnly
          value={displayValue}
          placeholder="dd/mm/aaaa"
          onClick={openPicker}
          className="cursor-pointer"
        />
        <input
          ref={nativeRef}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="absolute inset-0 opacity-0 w-full pointer-events-none"
          tabIndex={-1}
        />
      </div>
      <Button type="button" size="icon" onClick={openPicker} className="shrink-0">
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
}
