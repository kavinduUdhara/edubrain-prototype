"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// List of districts in Sri Lanka
const districts = [
  { value: "Colombo", label: "Colombo" },
  { value: "Gampaha", label: "Gampaha" },
  { value: "Kalutara", label: "Kalutara" },
  { value: "Matale", label: "Matale" },
  { value: "Kandy", label: "Kandy" },
  { value: "Nuwara Eliya", label: "Nuwara Eliya" },
  { value: "Galle", label: "Galle" },
  { value: "Matara", label: "Matara" },
  { value: "Hambantota", label: "Hambantota" },
  { value: "Jaffna", label: "Jaffna" },
  { value: "Kilinochchi", label: "Kilinochchi" },
  { value: "Mannar", label: "Mannar" },
  { value: "Mullaitivu", label: "Mullaitivu" },
  { value: "Vavuniya", label: "Vavuniya" },
  { value: "Trincomalee", label: "Trincomalee" },
  { value: "Batticaloa", label: "Batticaloa" },
  { value: "Ampara", label: "Ampara" },
  { value: "Puttalam", label: "Puttalam" },
  { value: "Kurunegala", label: "Kurunegala" },
  { value: "Anuradhapura", label: "Anuradhapura" },
  { value: "Polonnaruwa", label: "Polonnaruwa" },
  { value: "Badulla", label: "Badulla" },
  { value: "Monaragala", label: "Monaragala" },
  { value: "Kegalle", label: "Kegalle" },
  { value: "Ratnapura", label: "Ratnapura" },
];


export default function Districtselect({ onChange }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleSelect = (currentValue) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
    onChange(currentValue === value ? "" : currentValue); // Pass the value back to parent
  };

  return (
    <Popover open={open} onOpenChange={setOpen} className="w-full">
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? districts.find((district) => district.value === value)?.label
            : "Select district..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search district..." />
          <CommandList>
            <CommandEmpty>No district found.</CommandEmpty>
            <CommandGroup>
              {districts.map((district) => (
                <CommandItem
                  key={district.value}
                  value={district.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === district.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {district.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
