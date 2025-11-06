"use client"

import { useState } from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function DateRangeFilter({ setStart, setEnd, start, end }) {
  const dict = useTranslations("dateFilter")

  const presets = [
    { label: dict("next90"), getValue: () => {
        const end =  new Date()
        const start =  new Date()
        end.setDate(start.getDate() + 90)
        return { start, end }
    }},
    { label: dict("next30"), getValue: () => {
        const end = new Date()
        const start = new Date()
        end.setDate(start.getDate() + 30)
        return { start, end }
    }},
    { label: dict("next7"), getValue: () => {
        const end = new Date()
        const start = new Date()
        end.setDate(start.getDate() + 7)
        return { start, end }
    }},
    { label: dict("today"), getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: dict("last7"), getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return { start, end }
    }},
    { label: dict("last30"), getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)
        return { start, end }
    }},
    { label: dict("last90"), getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 90)
        return { start, end }
    }},
  ]

  const [startDate, setStartDate] = useState(start || undefined)
  const [endDate, setEndDate] = useState(end || undefined)
  const [tempStartDate, setTempStartDate] = useState(undefined)
  const [tempEndDate, setTempEndDate] = useState(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const handleApplyFilter = () => {
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    setStart(format(tempStartDate, "yyyy-MM-dd"))
    setEnd(format(tempEndDate, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue()
    setTempStartDate(start)
    setTempEndDate(end)
    setStartDate(start)
    setEndDate(end)
    setStart(format(start, "yyyy-MM-dd"))
    setEnd(format(end, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setTempStartDate(undefined)
    setTempEndDate(undefined)
    setStart(undefined)
    setEnd(undefined)
  }

  const formatDateRange = () => {
    if (!startDate && !endDate) return dict("selectRange")
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
    }
    if (startDate) return `${dict("from")} ${format(startDate, "MMM d, yyyy")}`
    if (endDate) return `${dict("until")} ${format(endDate, "MMM d, yyyy")}`
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start gap-2 font-normal text-left",
              !startDate && !endDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">{formatDateRange()}</span>
            <span className="text-sm sm:hidden">{dict("filter")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-80 sm:max-w-max p-0" align="end">
          <div className="flex sm:flex-row flex-col">
            <div className="flex sm:flex-col flex-row gap-1 md:border-r border-b md:border-b-0 border-border p-3 sm:w-max overflow-x-auto sm:overflow-x-visible">
              <div className="text-xs font-medium text-muted-foreground mb-0 md:mb-2 whitespace-nowrap md:whitespace-normal">
                {dict("presets")}
              </div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="justify-start text-sm font-normal whitespace-nowrap"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3 md:p-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-muted-foreground">{dict("startDate")}</div>
                  <Calendar
                    mode="single"
                    selected={tempStartDate}
                    onSelect={(date) => setTempStartDate(date)}
                    disabled={(date) => (tempEndDate ? date > tempEndDate : false)}
                    initialFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-muted-foreground">{dict("endDate")}</div>
                  <Calendar
                    mode="single"
                    selected={tempEndDate}
                    onSelect={(date) => setTempEndDate(date)}
                    disabled={(date) => (tempStartDate ? date < tempStartDate : false)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTempStartDate(startDate)
                    setTempEndDate(endDate)
                    setIsOpen(false)
                  }}
                >
                  {dict("cancel")}
                </Button>
                <Button size="sm" onClick={handleApplyFilter} disabled={!tempStartDate && !tempEndDate}>
                  {dict("apply")}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {(startDate || endDate) && (
        <Button variant="ghost" size="icon" onClick={handleClear} className="h-9 w-9">
          <X className="h-4 w-4" />
          <span className="sr-only">{dict("clearDates")}</span>
        </Button>
      )}
    </div>
  )
}
