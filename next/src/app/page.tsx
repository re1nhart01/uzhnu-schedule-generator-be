// app/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Download } from 'lucide-react'

const groups = ['КН-31', 'КН-32', 'КН-33']
const courses = ['1', '2', '3', '4']
const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця']
const hours = ['8:00 - 9:30', '9:45 - 11:15', '11:30 - 13:00', '13:15 - 14:45', '15:00 - 16:30']

const randomSubject = () => `Предмет ${Math.ceil(Math.random() * 5)}`

const generateWeeklySchedule = () => {
  return days.map((day) => ({
    day,
    lessons: hours.map((time) => ({ subject: randomSubject(), time }))
  }))
}

export default function HomePage() {
  const [selectedGroup, setSelectedGroup] = useState(groups[0])
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [schedule] = useState(generateWeeklySchedule())

  const exportTo = (type: 'pdf' | 'excel' | 'json') => {
    alert(`Export as ${type.toUpperCase()} is not implemented yet.`)
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <CalendarDays className="w-6 h-6 text-primary" /> Розклад на тиждень
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Оберіть групу та експортуйте у зручному форматі</p>
        </div>

        <div className="flex flex-row gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Оберіть курс" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Оберіть групу" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((dayItem, index) => (
          <div key={index} className="border rounded-lg shadow-sm overflow-hidden bg-card">
            <div className="bg-muted px-4 py-2 font-semibold text-foreground">{dayItem.day}</div>
            <ul>
              {dayItem.lessons.map((lesson, i) => (
                <li key={i} className="flex justify-between items-center border-t px-4 py-3 text-sm">
                  <span className="text-foreground">{lesson.subject}</span>
                  <span className="text-muted-foreground">{lesson.time}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 pt-6">
        <Button onClick={() => exportTo('pdf')} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> PDF
        </Button>
        <Button onClick={() => exportTo('excel')} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Excel
        </Button>
        <Button onClick={() => exportTo('json')} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> JSON
        </Button>
      </div>
    </div>
  )
}
