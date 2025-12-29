"use client"
import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DatePickerProps {
    value?: Date
    onChange?: (date?: Date) => void
    placeholder?: string
}

export default function DatePicker({ value, onChange, placeholder = "Chọn ngày" }: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const [internalDate, setInternalDate] = useState<Date | undefined>(undefined)

    const isControlled = value !== undefined
    const date = isControlled ? value : internalDate

    const handleSelect = (newDate: Date | undefined) => {
        if (!isControlled) {
            setInternalDate(newDate)
        }
        if (onChange) {
            onChange(newDate)
        }
        setOpen(false)
    }

    return (
        <div className="flex flex-col text-xs gap-x-2 w-full md:w-[140px]">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal text-xs h-8"
                    >
                        {date ? format(date, "dd/MM/yyyy", { locale: vi }) : placeholder}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 text-xs" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={handleSelect}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
