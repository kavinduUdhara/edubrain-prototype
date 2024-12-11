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

export function PopUpUnitSelect({ frameworks, onUnitSelect, styl }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [selectedLabel, setSelectedLabel] = React.useState("Select unit..."); // Store the label of the selected unit
  const [filteredFrameworks, setFilteredFrameworks] = React.useState([]);

  // Update filteredFrameworks whenever the frameworks prop changes
  React.useEffect(() => {
    if (frameworks && frameworks.length > 0) {
      setFilteredFrameworks(frameworks);
    }
  }, [frameworks]);

  // Function to handle selection
  const handleSelect = (currentValue, label) => {
    if (currentValue === value) {
      setValue(""); // Deselect if same value is selected again
      setSelectedLabel("Select unit...");
      onUnitSelect(null); // Notify the parent (main) component of deselection
    } else {
      setValue(currentValue);
      setSelectedLabel(label);
      onUnitSelect(currentValue); // Pass the selected unit back to the parent
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={"w-[125px] justify-between border-none " + styl }
        >
          {selectedLabel.length > 10
            ? `${selectedLabel.slice(0, 10)}...`
            : selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search unit..." />
          <CommandList>
            <CommandEmpty>No Unit Found.</CommandEmpty>
            <CommandGroup>
              {filteredFrameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={() =>
                    handleSelect(framework.value, framework.label)
                  }
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
