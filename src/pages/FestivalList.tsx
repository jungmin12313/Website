import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, MapPin, Search } from 'lucide-react'
import type { Festival } from '../types'
import { getFestivals } from '../firebaseUtils'
import './FestivalList.css'

export default function FestivalList() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [filtered, setFiltered] = useState<Festival[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
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
    let result = festivals
    if (q) result = result.filter(f => f.name.includes(q) || f.location.includes(q))
    if (statusFilter !== 'all') result = result.filter(f => f.status === statusFilter)
    if (regionFilter !== 'all') result = result.filter(f => f.location.includes(regionFilter))
    if (categoryFilter !== 'all') result = result.filter(f => f.category === categoryFilter)
    setFiltered(result)
  }, [festivals, statusFilter, regionFilter, categoryFilter, searchParams])

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
          <div className="filter-select">
            <Calendar size={16} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">시기 전체</option>
              <option value="active">진행중</option>
              <option value="soon">예정</option>
              <option value="ended">종료</option>
            </select>
          </div>
          <div className="filter-select">
            <MapPin size={16} />
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              <option value="all">지역 전체</option>
              <option value="충청남도">충청남도</option>
              <option value="전라남도">전라남도</option>
              <option value="광주">광주</option>
              <option value="전라북도">전라북도</option>
            </select>
          </div>
          <div className="filter-select">
            <Search size={16} />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">카테고리</option>
              {Array.from(new Set(festivals.map(f => f.category).filter(Boolean))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary search-btn">검색</button>
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
