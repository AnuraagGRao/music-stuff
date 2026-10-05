import type { UserPlan } from '../types'

export const PLAN_LIMITS = {
  free: {
    tierName: 'Free Starter',
    badge: 'Free',
    maxFileSizeBytes: 15 * 1024 * 1024, // 15 MB
    maxTracks: 5,
    formattedFileSize: '15 MB',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    billingNote: 'Free forever for personal listening',
    features: [
      '15 MB max file upload size',
      '5 personal cloud tracks storage',
      'Standard streaming (MP3, M4A, OGG)',
      'Basic queue & synced playlists',
      'Community voting & sharing',
    ],
  },
  pro: {
    tierName: 'Aura Pro',
    badge: '⚡ PRO',
    maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
    maxTracks: Infinity,
    formattedFileSize: '100 MB',
    monthlyPrice: '$4.99/mo',
    yearlyPrice: '$39/year',
    billingNote: 'Save 35% with annual billing',
    features: [
      '100 MB max file upload size',
      'Unlimited personal cloud tracks',
      'Lossless FLAC, WAV & High-Res ALAC',
      'High-bitrate studio audio streaming',
      'Priority cloud sync & persistent backup',
      'Exclusive ⚡ PRO member badge',
      'Early access to new audio tools',
    ],
  },
} as const

export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const getPlanLimits = (plan: UserPlan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}
