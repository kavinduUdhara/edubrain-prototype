"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PopUpOrderBySelect({ onPositionChange, options = [] }) {
  const [position, setPosition] = useState(
    options.length > 0 ? options[0].value : ""
  );

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    onPositionChange(newPosition); // Call the parent-provided function
  };

  // Handle empty options case
  if (options.length === 0) {
    return (
      <div className="flex items-center">
        <p>No options available</p>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-none h-8">
          {position
            ? options.find((option) => option.value === position).label
            : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuLabel>Order By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={handlePositionChange}
        >
          {/* Loop through options prop to create DropdownMenuRadioItem */}
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
