import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getFestivals } from '../firebaseUtils'
import type { Festival } from '../types'
import './Calendar.css'

export default function Calendar() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    getFestivals().then(data => {
      setFestivals(data)
    })
  }, [])

  // Date helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  
  // Padding for the first week
  const startOffset = firstDayOfMonth.getDay() // 0: Sun, 1: Mon...
  const firstCalendarDay = new Date(year, month, 1 - startOffset)
  
  // We want to show 6 weeks usually to keep it consistent
  const calendarDays: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(firstCalendarDay.getTime())
    d.setDate(d.getDate() + i)
    calendarDays.push(d)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month && date.getFullYear() === year
  }

  // Parse YYYY-MM-DD
  const parseDate = (str: string) => {
    if (!str) return null
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const getFestivalSegments = (weekIdx: number) => {
    const weekStart = new Date(calendarDays[weekIdx * 7].getTime())
    weekStart.setHours(0,0,0,0)
    const weekEnd = new Date(calendarDays[weekIdx * 7 + 6].getTime())
    weekEnd.setHours(23,59,59,999)

    const segments: any[] = []
    
    // Logic to avoid overlap: maintain row occupied status
    const rows: string[][] = Array.from({ length: 10 }, () => Array(7).fill(''))

    festivals.forEach(f => {
      const start = parseDate(f.startDate)
      const end = parseDate(f.endDate)
      if (!start || !end) return

      // Check if festival overlaps with this week
      if (start <= weekEnd && end >= weekStart) {
        // Calculate relative span in week (0 to 6)
        const relStart = Math.max(0, Math.floor((start.getTime() - weekStart.getTime()) / (24 * 3600 * 1000)))
        const relEnd = Math.min(6, Math.floor((end.getTime() - weekStart.getTime()) / (24 * 3600 * 1000)))

        // Find available row
        let rowIdx = 0
        while (rowIdx < rows.length) {
          let available = true
          for (let col = relStart; col <= relEnd; col++) {
            if (rows[rowIdx][col] !== '') {
              available = false
              break
            }
          }
          if (available) {
            for (let col = relStart; col <= relEnd; col++) rows[rowIdx][col] = f.id
            segments.push({
              festival: f,
              start: relStart,
              end: relEnd,
              row: rowIdx
            })
            break
          }
          rowIdx++
        }
      }
    })
    return segments
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={24} /></button>
          <h2>{year}년 {month + 1}월</h2>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={24} /></button>
        </div>

        <div className="calendar-grid">
          {weekDays.map(d => <div key={d} className="weekday">{d}</div>)}
          
          {Array.from({ length: 6 }).map((_, weekIdx) => (
            <div key={weekIdx} className="calendar-week-row">
              {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((date, dayIdx) => (
                <div 
                  key={dayIdx} 
                  className={`day-cell ${!isCurrentMonth(date) ? 'outside' : ''} ${dayIdx === 0 ? 'sun' : dayIdx === 6 ? 'sat' : ''} ${isToday(date) ? 'today' : ''}`}
                >
                  <span className="day-number">{date.getDate()}</span>
                </div>
              ))}
              
              {/* Overlay segments for this week */}
              <div className="bars-overlay">
                {getFestivalSegments(weekIdx).map((seg, i) => {
                  const startDateObj = parseDate(seg.festival.startDate)
                  const showLabel = seg.start === 0 || (startDateObj && startDateObj.getTime() >= calendarDays[weekIdx * 7].getTime())
                  
                  return (
                    <div
                      key={`${seg.festival.id}-${weekIdx}-${i}`}
                      className="bar-segment"
                      onClick={() => navigate(`/maps/${seg.festival.id}`)}
                      style={{
                        left: `${(seg.start / 7) * 100}%`,
                        width: `${((seg.end - seg.start + 1) / 7) * 100}%`,
                        top: `${seg.row * 1.6}rem`,
                        backgroundColor: i % 4 === 0 ? '#e6f3ec' : i % 4 === 1 ? '#fff4e6' : i % 4 === 2 ? '#eef6fc' : '#f3f0ff',
                        color: i % 4 === 0 ? '#2b8a3e' : i % 4 === 1 ? '#e67700' : i % 4 === 2 ? '#1971c2' : '#5f3dc4',
                      }}
                    >
                      {showLabel ? seg.festival.name : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
