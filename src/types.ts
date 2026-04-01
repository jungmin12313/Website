export interface Hotspot {
  id: string
  x: number        // % (0~100)
  y: number        // % (0~100)
  w?: number       // Width % (default 4 if missing)
  h?: number       // Height % (default 4 if missing)
  label: string
  description: string[]
  pictogramIds: string[]
  photos: string[]
  pictogramImages: string[]
  note?: string
  isReportBased?: boolean // 신고센터 제보 기반 핫스팟 여부
  modalType?: 'default' | 'enhanced' // 모달 종류 구분
}

export interface TransportService {
  name: string
  target: string
  phone: string
  fee: string
  operator: string
  inquiry: string
}

export interface Transport {
  description: string
  services: TransportService[]
}

export interface Pictogram {
  id: string
  name: string
  color: 'blue' | 'orange' | 'red' | 'green' | 'gray'
}

export interface Festival {
  id: string
  name: string
  subtitle: string
  startDate: string
  endDate: string
  location: string
  address: string
  fee: string
  phone: string
  instagram: string
  status: 'active' | 'ended' | 'soon'
  thumbnail: string
  thumbnailPositionY?: number

  images: string[]
  description: string
  programs: string[]
  mapImage: string
  hotspots: Hotspot[]
  transport: Transport | null
  pictograms: Pictogram[]
  category?: string
  showOnMain?: boolean // 어드민에서 메인에 띄울지 제어하는 플래그
}

export interface Report {
  id: string
  name: string
  contact: string
  festivalId: string
  festivalName: string
  locationDetail?: string // 대략적인 위치 설명
  x?: number             // % 좌표 (지도 표시용)
  y?: number             // % 좌표 (지도 표시용)
  content: string
  images: string[]
  createdAt: number
  status: 'pending' | 'resolved'
  isApproved?: boolean    // 관리자가 공개 지도에 표시하도록 승인했는지 여부
}
