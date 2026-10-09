
"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { brazilianHolidays } from "@/lib/holidays"
import { isSaturday, isSunday } from 'date-fns';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleConfirm = () => {
    setDate(selectedDate);
    setPopoverOpen(false);
  };
    
  const disabledDays = [
    (day: Date) => isSaturday(day) || isSunday(day),
    ...brazilianHolidays.map(h => h.date)
  ];
    
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
          locale={ptBR}
          disabled={disabledDays}
        />
        <div className="p-2 border-t border-border">
            <Button className="w-full" onClick={handleConfirm}>OK</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DatePickerWithIcon({ date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size="icon"
          className={cn(!date && "text-muted-foreground")}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="sr-only">Selecione uma data</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ptBR}
          disabled={[
            (day: Date) => isSaturday(day) || isSunday(day),
            ...brazilianHolidays.map(h => h.date)
          ]}
        />
      </PopoverContent>
    </Popover>
  )
}

