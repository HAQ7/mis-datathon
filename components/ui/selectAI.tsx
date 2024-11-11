import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectDemo() {
  return (
    <Select defaultValue="open">
      <SelectTrigger className="w-max bg-white shadow-lg">
        <SelectValue defaultValue="open" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="open">مفتوح المصدر</SelectItem>
          <SelectItem value="closed">مغلق المصدر</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
