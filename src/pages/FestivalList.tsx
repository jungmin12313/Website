import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import type { Festival } from '../types'
import { getFestivals } from '../firebaseUtils'
import './FestivalList.css'

export default function FestivalList() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [filtered, setFiltered] = useState<Festival[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFestivals()
        setFestivals(data || [])
        setFiltered(data || [])
      } catch (err) {
        console.error('Failed to load festivals from Firebase:', err)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    let result = [...festivals] // Copy to avoid mutation
    
    // Search
    if (q) result = result.filter(f => f.name.includes(q) || f.location.includes(q))
    
    // Status Filter
    if (statusFilter !== 'all') result = result.filter(f => f.status === statusFilter)
    
    // Region Filter (Item 17: Matches Gwangju Metropolitan City or Gwangju)
    if (regionFilter !== 'all') {
      result = result.filter(f => f.location.includes(regionFilter) || (regionFilter === '광주광역시' && f.location.includes('광주')))
    }
    
    // Sort by Category Alphabetically (Item 18)
    result.sort((a, b) => {
      const catA = a.category || ''
      const catB = b.category || ''
      return catA.localeCompare(catB, 'ko') || a.name.localeCompare(b.name, 'ko')
    })
    
    setFiltered(result)
  }, [festivals, statusFilter, regionFilter, searchParams])

  const statusLabel = (s: string) => {
    if (s === 'active') return '개최중'
    if (s === 'ended') return '종료'
    return '예정'
  }

  return (
    <div className="festival-list-page">
      <div className="list-container">
        {/* 필터 */}
        <div className="filters">
          <div className="filter-select half-width">
            <Calendar size={18} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">시기 전체</option>
              <option value="active">진행중</option>
              <option value="soon">예정</option>
              <option value="ended">종료</option>
            </select>
          </div>
          <div className="filter-select half-width">
            <MapPin size={18} />
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              <option value="all">지역 전체</option>
              <option value="충청남도">충청남도</option>
              <option value="전라남도">전라남도</option>
              <option value="광주광역시">광주광역시</option>
              <option value="전라북도">전라북도</option>
            </select>
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="card-grid">
          {filtered.map(f => (
            <div
              key={f.id}
              className="festival-card"
              onClick={() => navigate(`/maps/${f.id}`)}
            >
              <div className="card-thumb">
                <img
                  src={f.thumbnail || '/placeholder.svg'}
                  alt={f.name}
                  style={{ objectPosition: `center ${f.thumbnailPositionY || 50}%` }}
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                />

                <span className={`badge badge-${f.status === 'active' ? 'active' : f.status === 'soon' ? 'soon' : 'ended'}`}>
                  {statusLabel(f.status)}
                </span>
              </div>
              <div className="card-info">
                <h3>{f.name}</h3>
                <p className="card-date">
                  <Calendar size={13} />
                  {f.startDate} ~ {f.endDate}
                </p>
                <p className="card-location">
                  <MapPin size={13} />
                  {f.location}
                </p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
