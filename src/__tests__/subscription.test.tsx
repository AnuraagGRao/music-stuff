import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAudioStore } from '../store/audioStore'
import { UploadZone } from '../components/UploadZone'
import { UpgradeModal } from '../components/UpgradeModal'
import { PLAN_LIMITS, formatBytes, getPlanLimits } from '../utils/planLimits'

describe('Subscription Model & Plan Limits', () => {
  beforeEach(() => {
    useAudioStore.setState({
      userPlan: 'pro',
    })
  })

  describe('Plan Limits Configuration', () => {
    it('should have correct limits for Free tier', () => {
      const free = getPlanLimits('free')
      expect(free.maxFileSizeBytes).toBe(15 * 1024 * 1024)
      expect(free.maxTracks).toBe(5)
      expect(free.formattedFileSize).toBe('15 MB')
      expect(free.monthlyPrice).toBe('$0')
    })

    it('should have correct limits for Pro tier', () => {
      const pro = getPlanLimits('pro')
      expect(pro.maxFileSizeBytes).toBe(100 * 1024 * 1024)
      expect(pro.maxTracks).toBe(Infinity)
      expect(pro.formattedFileSize).toBe('100 MB')
      expect(pro.monthlyPrice).toBe('$4.99/mo')
    })

    it('should format bytes properly', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(15 * 1024 * 1024)).toBe('15 MB')
      expect(formatBytes(100 * 1024 * 1024)).toBe('100 MB')
    })
  })

  describe('Audio Store Plan State', () => {
    it('should default to pro plan', () => {
      const state = useAudioStore.getState()
      expect(state.userPlan).toBe('pro')
    })

    it('should allow setting plan state', () => {
      const store = useAudioStore.getState()
      store.setUserPlan('free')
      expect(useAudioStore.getState().userPlan).toBe('free')

      store.setUserPlan('pro')
      expect(useAudioStore.getState().userPlan).toBe('pro')
    })
  })

  describe('UploadZone Component Quota & Size Limit', () => {
    it('should render Free plan limit badge and storage quota', () => {
      useAudioStore.setState({ userPlan: 'free' })
      render(
        <UploadZone
          onUpload={vi.fn()}
          isUploading={false}
          progress={{}}
          userTracksCount={2}
          onUpgradeClick={vi.fn()}
        />
      )

      expect(screen.getByText(/Free: 15MB limit/i)).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText(/\/ 5 tracks used/i)).toBeInTheDocument()
    })

    it('should block file upload larger than 15MB on Free tier and offer upgrade', async () => {
      useAudioStore.setState({ userPlan: 'free' })
      const onUpload = vi.fn()
      const onUpgradeClick = vi.fn()

      const { container } = render(
        <UploadZone
          onUpload={onUpload}
          isUploading={false}
          progress={{}}
          userTracksCount={1}
          onUpgradeClick={onUpgradeClick}
        />
      )

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      // Create a simulated 20MB file
      const oversizedFile = new File([''], 'heavy-track.mp3', { type: 'audio/mpeg' })
      Object.defineProperty(oversizedFile, 'size', { value: 20 * 1024 * 1024 })

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } })

      await waitFor(() => {
        expect(screen.getByText(/Free tier limit is 15 MB/i)).toBeInTheDocument()
      })
      expect(onUpload).not.toHaveBeenCalled()

      // Test upgrade button click
      const upgradeBtns = screen.getAllByRole('button', { name: /aura pro/i })
      expect(upgradeBtns.length).toBeGreaterThanOrEqual(1)
      fireEvent.click(upgradeBtns[0])
      expect(onUpgradeClick).toHaveBeenCalled()
    })

    it('should block uploads when Free track limit of 5 is reached', async () => {
      useAudioStore.setState({ userPlan: 'free' })
      const onUpload = vi.fn()
      const onUpgradeClick = vi.fn()

      render(
        <UploadZone
          onUpload={onUpload}
          isUploading={false}
          progress={{}}
          userTracksCount={5}
          onUpgradeClick={onUpgradeClick}
        />
      )

      expect(screen.getByText(/Storage limit reached \(5\/5 tracks\)/i)).toBeInTheDocument()
    })

    it('should allow up to 100MB files when user is on Pro tier', async () => {
      useAudioStore.setState({ userPlan: 'pro' })
      const onUpload = vi.fn().mockResolvedValue('track-id-123')

      const { container } = render(
        <UploadZone
          onUpload={onUpload}
          isUploading={false}
          progress={{}}
          userTracksCount={12}
        />
      )

      expect(screen.getByText(/AURA PRO • 100MB UNLIMITED/i)).toBeInTheDocument()

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      // Create a 50MB file (which would fail free tier, but should succeed on Pro)
      const proTrack = new File([''], 'studio-master.wav', { type: 'audio/wav' })
      Object.defineProperty(proTrack, 'size', { value: 50 * 1024 * 1024 })

      fireEvent.change(fileInput, { target: { files: [proTrack] } })

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(proTrack)
      })
    })

    it('should display legal copyright disclaimer and DMCA safe harbor notice', () => {
      render(
        <UploadZone
          onUpload={vi.fn()}
          isUploading={false}
          progress={{}}
          userTracksCount={0}
        />
      )

      expect(screen.getByText(/Content Rights & Copyright Notice/i)).toBeInTheDocument()
      expect(screen.getByText(/DMCA Safe Harbor § 512/i)).toBeInTheDocument()
      expect(screen.getByText(/Users are solely and personally responsible for the audio files they upload/i)).toBeInTheDocument()
      expect(screen.getByText(/legal@musicforall.app/i)).toBeInTheDocument()
    })
  })

  describe('UpgradeModal Component', () => {
    it('should render modal with plan pricing, comparison, and legal disclaimer', () => {
      render(<UpgradeModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByText(/Expand Your Studio Storage/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Free Starter/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Aura Pro/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/Plan Specification Comparison/i)).toBeInTheDocument()
      expect(screen.getByText(/Content & Copyright Disclaimer/i)).toBeInTheDocument()
      expect(screen.getByText(/Subscribers hold sole legal responsibility for all uploaded tracks/i)).toBeInTheDocument()
    })

    it('should switch between monthly and annual billing', () => {
      render(<UpgradeModal isOpen={true} onClose={vi.fn()} />)

      const monthlyBtn = screen.getByRole('button', { name: /^monthly$/i })
      fireEvent.click(monthlyBtn)

      expect(screen.getByText(/\$4.99/i)).toBeInTheDocument()

      const annualBtn = screen.getByRole('button', { name: /annual/i })
      fireEvent.click(annualBtn)

      expect(screen.getByText(/\$3.25/i)).toBeInTheDocument()
    })

    it('should show Coming Soon on Pro button for Free users and prevent self-upgrade', () => {
      useAudioStore.setState({ userPlan: 'free' })
      render(<UpgradeModal isOpen={true} onClose={vi.fn()} />)

      const comingSoonBtn = screen.getByRole('button', { name: /aura pro • coming soon/i })
      expect(comingSoonBtn).toBeInTheDocument()
      fireEvent.click(comingSoonBtn)

      expect(useAudioStore.getState().userPlan).toBe('free')
      expect(screen.getByText(/public subscriptions are coming soon/i)).toBeInTheDocument()
    })

    it('should display active VIP membership for Pro users', () => {
      useAudioStore.setState({ userPlan: 'pro' })
      render(<UpgradeModal isOpen={true} onClose={vi.fn()} />)

      expect(screen.getByText(/Active Aura Pro Member/i)).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<UpgradeModal isOpen={true} onClose={onClose} />)

      const closeBtn = screen.getByRole('button', { name: /close upgrade dialog/i })
      fireEvent.click(closeBtn)

      expect(onClose).toHaveBeenCalled()
    })
  })
})
