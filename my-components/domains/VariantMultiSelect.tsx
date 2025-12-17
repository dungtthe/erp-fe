"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

export type Variant = {
    id: string; // SKU or distinct ID
    name: string;
};

export default function VariantMultiSelect({
    selected,
    onChange,
    variants,
    disabledVariants = []
}: {
    selected: string[];
    onChange: (val: string[]) => void;
    variants: Variant[];
    disabledVariants?: string[];
}) {
    const [open, setOpen] = useState(false);

    const isAll = selected.includes("all");

    // Helper to get variant name
    const getVariantName = (id: string) => {
        return variants.find(v => v.id === id)?.name || id;
    };

    const toggleVariant = (id: string, disabled: boolean) => {
        if (disabled) return;

        let newSelected = [...selected];

        if (id === "all") {
            if (isAll) {
                newSelected = [];
            } else {
                newSelected = variants.filter(v => !disabledVariants.includes(v.id)).map(v => v.id);
                if (disabledVariants.length === 0) {
                    newSelected = ["all"];
                }
            }
        } else {
            if (isAll) {
                const allIds = variants.map(v => v.id);
                newSelected = allIds;

                if (newSelected.includes(id)) {
                    newSelected = newSelected.filter(x => x !== id);
                } else {
                    newSelected.push(id);
                }
            } else {
                if (newSelected.includes(id)) {
                    newSelected = newSelected.filter(x => x !== id);
                } else {
                    newSelected.push(id);
                }
            }
        }

        if (id !== "all" && newSelected.includes("all")) {
            newSelected = newSelected.filter(x => x !== "all");
        }

        const allSpecificIds = variants.map(v => v.id);
        const selectedSpecifics = newSelected.filter(x => x !== "all");

        if (disabledVariants.length === 0 && selectedSpecifics.length === allSpecificIds.length && allSpecificIds.length > 0) {
            newSelected = ["all"];
        }

        onChange(newSelected);
    };

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toggleVariant(id, false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full h-auto min-h-[2.25rem] py-1 px-3 text-xs font-normal bg-white"
                >
                    <div className="flex flex-wrap gap-1 items-center w-full">
                        {isAll ? (
                            <Badge variant="secondary" className="rounded-full px-2 font-normal">
                                Tất cả biến thể
                                <div
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-slate-200"
                                    onClick={(e) => handleRemove(e, "all")}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </div>
                            </Badge>
                        ) : selected.length > 0 ? (
                            selected.map((id) => (
                                <Badge key={id} variant="secondary" className="rounded-full px-2 font-normal">
                                    {getVariantName(id)}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-slate-200"
                                        onClick={(e) => handleRemove(e, id)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">Chọn biến thể</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-30" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm biến thể..." />
                    <CommandList>
                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                        <CommandGroup>
                            {variants.map((variant) => {
                                const isSelected = selected.includes(variant.id) || isAll;
                                const isDisabled = disabledVariants.includes(variant.id);
                                return (
                                    <CommandItem
                                        key={variant.id}
                                        value={variant.name}
                                        onSelect={() => toggleVariant(variant.id, isDisabled)}
                                        disabled={isDisabled}
                                        className={isDisabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className={isDisabled ? "line-through" : ""}>{variant.name}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
