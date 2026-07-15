export type LyricLine = {
  time: number
  text: string
}

export type Track = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  coverUrl: string
  ownerId: string
  lyrics: LyricLine[]
  // Voting aggregates
  upvotesCount?: number
  downvotesCount?: number
  netScore?: number
  // Metadata
  isPublic?: boolean
  isInstrumental?: boolean
  lyricsStatus?: 'pending' | 'completed' | 'failed'
  createdAt?: any
}

export type Vote = {
  id: string
  userId: string
  trackId: string
  type: 'up' | 'down'
  timestamp: any
}

export type Playlist = {
  id: string
  name: string
  description: string
  createdBy: string
  isPublic: boolean
  isSystemGenerated: boolean
  trackIds: string[]
  createdAt: any
  updatedAt: any
}

export type UserHistoryEvent = {
  id: string
  userId: string
  trackId: string
  action: 'play' | 'skip' | 'complete' | 'heart'
  listenDuration: number
  percentagePlayed: number
  timestamp: any
}
