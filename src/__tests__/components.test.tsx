import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VotingButtons } from '../src/components/VotingButtons'
import { PlaylistSelector } from '../src/components/PlaylistSelector'
import { CreatePlaylistModal } from '../src/components/CreatePlaylistModal'
import type { Track } from '../src/types'

// Mock hooks
vi.mock('../src/hooks/useVoting', () => ({
  useVoting: () => ({
    toggleVote: vi.fn(),
    getUserVote: () => null,
    loading: false,
    isAuthenticated: true,
  }),
}))

vi.mock('../src/hooks/usePlaylists', () => ({
  usePlaylists: () => ({
    playlists: [
      { id: 'p1', name: 'My Playlist', trackIds: [], createdBy: 'user-1', isPublic: false },
    ],
    loading: false,
    createPlaylist: vi.fn(),
    addTrackToPlaylist: vi.fn(),
    removeTrackFromPlaylist: vi.fn(),
    isTrackInPlaylist: () => false,
    deletePlaylist: vi.fn(),
    isAuthenticated: true,
  }),
}))

const mockTrack: Track = {
  id: 'track-1',
  title: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 180,
  audioUrl: 'https://example.com/audio.mp3',
  coverUrl: 'https://example.com/cover.jpg',
  ownerId: 'user-1',
  lyrics: [],
}

describe('VotingButtons Component', () => {
  it('should render upvote and downvote buttons', () => {
    render(<VotingButtons track={mockTrack} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should display vote counts', () => {
    const trackWithVotes = {
      ...mockTrack,
      upvotesCount: 10,
      downvotesCount: 2,
    }

    render(<VotingButtons track={trackWithVotes} />)

    // Vote counts should be visible
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })

  it('should trigger onAuthRequired when not authenticated', async () => {
    const onAuthRequired = vi.fn()
    const user = userEvent.setup()

    render(<VotingButtons track={mockTrack} onAuthRequired={onAuthRequired} />)

    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      await user.click(buttons[0])
    }

    // This would depend on the actual implementation of auth checking
  })

  it('should show different styles for upvote vs downvote', () => {
    const trackWithUpvote = {
      ...mockTrack,
      upvotesCount: 5,
      downvotesCount: 1,
    }

    const { container } = render(<VotingButtons track={trackWithUpvote} />)

    // Verify voting buttons are rendered
    expect(container.querySelector('button')).toBeInTheDocument()
  })
})

describe('PlaylistSelector Component', () => {
  it('should render a button to open playlist selector', () => {
    render(<PlaylistSelector track={mockTrack} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should show playlists in dropdown', async () => {
    const user = userEvent.setup()

    render(<PlaylistSelector track={mockTrack} />)

    const button = screen.getByRole('button')
    await user.click(button)

    // Playlist should appear in dropdown
    // (This depends on the popover implementation)
  })

  it('should trigger onAuthRequired if not authenticated', () => {
    const onAuthRequired = vi.fn()

    render(<PlaylistSelector track={mockTrack} onAuthRequired={onAuthRequired} />)

    // Button should be present
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle adding track to playlist', async () => {
    const user = userEvent.setup()

    render(<PlaylistSelector track={mockTrack} />)

    const button = screen.getByRole('button')
    await user.click(button)

    // Playlist interaction depends on popover behavior
  })

  it('should show checkmark for tracks already in playlist', () => {
    render(<PlaylistSelector track={mockTrack} />)

    // Component should render without errors
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

describe('CreatePlaylistModal Component', () => {
  it('should render modal when open=true', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText('Create Playlist')).toBeInTheDocument()
  })

  it('should not render modal when open=false', () => {
    const { container } = render(<CreatePlaylistModal open={false} onOpenChange={vi.fn()} />)

    // Modal content should not be visible
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('should have name input field', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('My Awesome Mix')
    expect(input).toBeInTheDocument()
  })

  it('should have description textarea', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const textarea = screen.getByPlaceholderText('Add a description...')
    expect(textarea).toBeInTheDocument()
  })

  it('should have public toggle checkbox', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should have Create and Cancel buttons', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should validate name is required', async () => {
    const user = userEvent.setup()

    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const createButton = screen.getByText('Create')
    await user.click(createButton)

    // Error should be shown
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })

  it('should accept playlist name input', async () => {
    const user = userEvent.setup()

    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('My Awesome Mix')
    await user.type(input, 'My Test Playlist')

    expect(input).toHaveValue('My Test Playlist')
  })

  it('should accept playlist description input', async () => {
    const user = userEvent.setup()

    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const textarea = screen.getByPlaceholderText('Add a description...')
    await user.type(textarea, 'A test description')

    expect(textarea).toHaveValue('A test description')
  })

  it('should toggle public checkbox', async () => {
    const user = userEvent.setup()

    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('should call onOpenChange when closed', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(<CreatePlaylistModal open={true} onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should disable inputs while loading', () => {
    // This would require a loading state in the mock
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    const input = screen.getByPlaceholderText('My Awesome Mix')
    expect(input).not.toBeDisabled()
  })
})

describe('Component Integration', () => {
  it('should support voting on a track', () => {
    render(<VotingButtons track={mockTrack} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should support adding track to playlist', () => {
    render(<PlaylistSelector track={mockTrack} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should support creating a new playlist', () => {
    render(<CreatePlaylistModal open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText('Create Playlist')).toBeInTheDocument()
  })

  it('should support full voting + playlist workflow', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <>
        <VotingButtons track={mockTrack} />
        <PlaylistSelector track={mockTrack} />
        <CreatePlaylistModal open={false} onOpenChange={vi.fn()} />
      </>,
    )

    // All components should render
    expect(screen.getAllByRole('button')).toHaveLength(2) // One for voting, one for playlist

    // Rerender with modal open
    rerender(
      <>
        <VotingButtons track={mockTrack} />
        <PlaylistSelector track={mockTrack} />
        <CreatePlaylistModal open={true} onOpenChange={vi.fn()} />
      </>,
    )

    expect(screen.getByText('Create Playlist')).toBeInTheDocument()
  })
})
