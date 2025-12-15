"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Định nghĩa kiểu dữ liệu cho mỗi item trong mảng
export interface ComboboxItem {
  id: string | number;
  value: string;
}

// Props cho component
export interface MyComboboxProps {
  items: ComboboxItem[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export default function MyCombobox({ items, value, onChange, placeholder = "Chọn một mục...", searchPlaceholder = "Tìm kiếm...", emptyText = "Không tìm thấy kết quả.", className, width = "w-[200px]", disabled = false, allowClear = true }: MyComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => item.id === value);

  const handleSelect = (selectedValue: string) => {
    if (onChange) {
      const item = items.find((item) => item.value.toLowerCase() === selectedValue.toLowerCase());
      if (item) {
        if (allowClear && item.id === value) {
          onChange("");
        } else {
          onChange(item.id);
        }
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn(width, "justify-between", className)} disabled={disabled}>
          {selectedItem ? selectedItem.value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(width, "p-0")}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem key={item.id} value={item.value} onSelect={handleSelect}>
                  {item.value}
                  <Check className={cn("ml-auto h-4 w-4", value === item.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
