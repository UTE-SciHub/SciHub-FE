import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export type OptionType = {
    label: string;
    value: string;
    disabled?: boolean;
};

interface MultiSelectProps {
    options: OptionType[];
    selected: string[];
    onChange: (values: string[]) => void;
    className?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    maxDisplayValues?: number;
    disabled?: boolean;
}

export function MultiSelect({
    options,
    selected = [],
    onChange,
    className,
    placeholder = "Chọn các tùy chọn...",
    searchPlaceholder = "Tìm kiếm...",
    emptyMessage = "Không tìm thấy kết quả.",
    maxDisplayValues = 3,
    disabled = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (selected.length === options.filter((option) => !option.disabled).length) {
            onChange([]);
        } else {
            const allValues = options.filter((option) => !option.disabled).map((option) => option.value);
            onChange(allValues);
        }
    };

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== value));
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedLabels = selected
        .map((value) => options.find((option) => option.value === value)?.label)
        .filter(Boolean) as string[];

    const displaySelectedLabels = selectedLabels.slice(0, maxDisplayValues);
    const remainingCount = selectedLabels.length - maxDisplayValues;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
                        {displaySelectedLabels.map((label) => (
                            <Badge key={label} variant="default" className="mr-1">
                                {label}
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        const value = options.find((option) => option.label === label)?.value;
                                        if (value) handleRemove(value, e);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {label}</span>
                                </button>
                            </Badge>
                        ))}
                        {remainingCount > 0 && <Badge variant="secondary">+{remainingCount}</Badge>}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => handleSelectAll()} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={
                                            selected.length > 0 &&
                                            selected.length === options.filter((option) => !option.disabled).length
                                        }
                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                    <span>Chọn tất cả</span>
                                </div>
                            </CommandItem>
                            <CommandSeparator />
                            {filteredOptions.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                        disabled={option.disabled}
                                        className={cn("cursor-pointer", option.disabled && "cursor-not-allowed opacity-50")}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Checkbox
                                                checked={isSelected}
                                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                            />
                                            <span>{option.label}</span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                    {selected.length > 0 && (
                        <>
                            <CommandSeparator />
                            <div className="p-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={handleClearAll}>
                                    Xóa tất cả
                                </Button>
                            </div>
                        </>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}