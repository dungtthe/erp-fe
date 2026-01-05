"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

export type Variant = {
    id: string;
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
                    className="w-full justify-between h-auto min-h-[36px] py-1 px-3"
                >
                    <div className="flex flex-wrap gap-1 items-center w-full text-foreground pr-6">
                        {isAll ? (
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                Tất cả biến thể
                                <div
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                    onClick={(e) => handleRemove(e, "all")}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </div>
                            </Badge>
                        ) : selected.length > 0 ? (
                            selected.map((id) => (
                                <Badge
                                    key={id}
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {getVariantName(id)}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onClick={(e) => handleRemove(e, id)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground font-normal">Chọn biến thể áp dụng...</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-30" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm biến thể..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all_variants_select_option"
                                onSelect={() => toggleVariant("all", false)}
                            >
                                Tất cả biến thể
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        isAll ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>

                            {variants.map((variant) => {
                                const isSelected = selected.includes(variant.id) || isAll;
                                const isDisabled = disabledVariants.includes(variant.id);
                                return (
                                    <CommandItem
                                        key={variant.id}
                                        value={variant.name}
                                        onSelect={() => toggleVariant(variant.id, isDisabled)}
                                        disabled={isDisabled}
                                        className={cn(isDisabled && "opacity-50 cursor-not-allowed text-muted-foreground")}
                                    >
                                        <span className={cn(isDisabled && "line-through")}>{variant.name}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
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
