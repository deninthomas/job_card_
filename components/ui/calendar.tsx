"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Calendar({
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date()
  )

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      day === selected.getDate() &&
      month === selected.getMonth() &&
      year === selected.getFullYear()
    )
  }

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day)
    return disabled ? disabled(date) : false
  }

  // Generate calendar days
  const days: (number | null)[] = []
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {MONTHS[month]} {year}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToNextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-xs font-medium text-center h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8" />
          }

          const dayIsToday = isToday(day)
          const dayIsSelected = isSelected(day)
          const dayIsDisabled = isDisabled(day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={dayIsDisabled}
              className={cn(
                "h-8 w-8 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                dayIsToday && "bg-accent text-accent-foreground font-semibold",
                dayIsSelected &&
                  !dayIsToday &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                dayIsDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

