"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

export type MasterAttributeValue = {
    id: string;
    value: string;
};

export type MasterAttribute = {
    id: string;
    attributeName: string;
    values: MasterAttributeValue[];
};

interface AttributeSelectorProps {
    id: string; // The ID of the attribute row in VariantTab
    attributeName: string; // The currently selected name (e.g. "Màu sắc")
    selectedValues: string[]; // The currently selected values
    // availableAttributes: MasterAttribute[]; // Removed as we fetch internally now
    onAttributeNameChange: (id: string, newName: string) => void;
    onValueAdd: (id: string, value: string) => void;
    onValueRemove: (id: string, value: string) => void;
    onRemoveAttribute: (id: string) => void;
}

export function AttributeSelector({
    id,
    attributeName,
    selectedValues,
    onAttributeNameChange,
    onValueAdd,
    onValueRemove,
    onRemoveAttribute,
}: AttributeSelectorProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [availableAttributes, setAvailableAttributes] = useState<MasterAttribute[]>([]);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                // Determine if we should fetch or use cache/props if passed?
                // Request says call API in this file. 
                // To avoid spamming API on every row, we can check if we already have data in a global cache or just let it fly.
                // For simplicity as requested: fetch here.
                const response = await api.get<MasterAttribute[]>("/attributes");
                if (response.success && response.data) {
                    setAvailableAttributes(response.data);
                }
            } catch (error) {
                console.error("Error fetching attributes in selector:", error);
                // Toast might be annoying if every row errors, but acceptable for now.
            }
        };
        fetchAttributes();
    }, []);

    // Find the master attribute definition that matches the CURRENTLY selected name
    const currentMasterAttr = availableAttributes.find(
        (a) => a.attributeName === attributeName
    );

    // Filter available values to exclude ones already selected
    const availableValues = currentMasterAttr?.values.filter(
        (v) => !selectedValues.includes(v.value)
    ) || [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputValue.trim()) {
                onValueAdd(id, inputValue.trim());
                setInputValue("");
            }
        }
    };

    return (
        <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50 relative group">
            <div className="w-1/4">
                <Label className="mb-2 block text-sm font-medium">Thuộc tính</Label>
                <Select
                    value={attributeName}
                    onValueChange={(val) => onAttributeNameChange(id, val)}
                >
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Chọn thuộc tính" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableAttributes.map((attr) => (
                            <SelectItem key={attr.id} value={attr.attributeName}>
                                {attr.attributeName}
                            </SelectItem>
                        ))}
                        {/* Option for custom if needed, but for now we bind strictly to the list + maybe allow custom typing if not found? 
                             The requirement "bind theo nó" suggests strictness, but usually "Custom" is kept for flexibility.
                             I'll add "Custom" to be safe if the user wants it, or if it isn't in the list.
                         */}
                        {!availableAttributes.find(a => a.attributeName === "Custom") && (
                            <SelectItem value="Custom">Khác...</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1">
                <Label className="mb-2 block text-sm font-medium">Giá trị</Label>
                <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 bg-white border rounded-md">
                    {selectedValues.map((val) => (
                        <Badge
                            key={val}
                            variant="secondary"
                            className="px-2 py-1 text-sm bg-slate-100 border-slate-200"
                        >
                            {val}
                            <button
                                onClick={() => onValueRemove(id, val)}
                                className="ml-1 hover:text-red-500"
                            >
                                <X size={12} />
                            </button>
                        </Badge>
                    ))}

                    {/* Popover for selecting values */}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    selectedValues.length === 0 ? "Chọn hoặc nhập..." : "+ Thêm"
                                }
                                className="bg-transparent border-none focus:outline-none text-sm px-2 py-1 min-w-[100px] flex-1 cursor-text"
                                onClick={() => setOpen(true)}
                            />
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <Command>
                                <CommandInput placeholder={`Tìm giá trị...`} />
                                <CommandList>
                                    <CommandEmpty>Nhập để thêm mới...</CommandEmpty>
                                    <CommandGroup>
                                        {availableValues.map((val) => (
                                            <CommandItem
                                                key={val.id}
                                                value={val.value}
                                                onSelect={(currentValue) => {
                                                    // Start with the raw value from the item
                                                    // CommandItem often lowercases value, so be careful. 
                                                    // Use the original val.value
                                                    onValueAdd(id, val.value);
                                                    setInputValue("");
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedValues.includes(val.value)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {val.value}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveAttribute(id)}
            >
                <Trash2 size={16} />
            </Button>
        </div>
    );
}


