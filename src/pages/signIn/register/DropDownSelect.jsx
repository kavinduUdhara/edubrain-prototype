import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PronounSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="pronounce">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="m">He/Him</SelectItem>
        <SelectItem value="f">She/Her</SelectItem>
        <SelectItem value="t">They/Them</SelectItem>
        <SelectItem value="n">Prefer not to say</SelectItem>
      </SelectContent>
    </Select>
  );
}
export function BirthYearSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="birthYear">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="2004">2004</SelectItem>
        <SelectItem value="2005">2005</SelectItem>
        <SelectItem value="2006">2006</SelectItem>
        <SelectItem value="2007">2007</SelectItem>
        <SelectItem value="2008">2008</SelectItem>
        <SelectItem value="2009">2009</SelectItem>
        <SelectItem value="2010">2010</SelectItem>
      </SelectContent>
    </Select>
  );
}
export function BirthMonthSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="birthMonth">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="01">January</SelectItem>
        <SelectItem value="02">February</SelectItem>
        <SelectItem value="03">March</SelectItem>
        <SelectItem value="04">April</SelectItem>
        <SelectItem value="05">May</SelectItem>
        <SelectItem value="06">June</SelectItem>
        <SelectItem value="07">July</SelectItem>
        <SelectItem value="08">August</SelectItem>
        <SelectItem value="09">September</SelectItem>
        <SelectItem value="10">October</SelectItem>
        <SelectItem value="11">November</SelectItem>
        <SelectItem value="12">December</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function NICGenderSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="nicGender">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ALStreamSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="alStream">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="art">Art</SelectItem>
        <SelectItem value="bs">Biological Science</SelectItem>
        <SelectItem value="com">Commerce</SelectItem>
        <SelectItem value="ps">Physical Science</SelectItem>
        <SelectItem value="tec">Technology</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}
export function AcademicYearSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="academicYear">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="2024">2024</SelectItem>
        <SelectItem value="2025">2025</SelectItem>
        <SelectItem value="2026">2026</SelectItem>
        <SelectItem value="2027">2027</SelectItem>
        <SelectItem value="2028">2028</SelectItem>
      </SelectContent>
    </Select>
  );
}
export function MediumSelector({ onChange }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger id="medium">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="english">English</SelectItem>
        <SelectItem value="sinhala">Sinhala</SelectItem>
      </SelectContent>
    </Select>
  );
}