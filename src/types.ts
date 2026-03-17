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
  images: string[]
  description: string
  programs: string[]
  mapImage: string
  hotspots: Hotspot[]
  transport: Transport | null
  pictograms: Pictogram[]
  category?: string
}
