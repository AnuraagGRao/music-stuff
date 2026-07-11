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
}
