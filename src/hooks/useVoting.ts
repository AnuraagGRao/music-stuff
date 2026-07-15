import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Vote } from '../types'

type VoteType = 'up' | 'down'

export function useVoting() {
  const [userVotes, setUserVotes] = useState<Map<string, VoteType>>(new Map())
  const [loading, setLoading] = useState(false)

  const currentUser = auth.currentUser

  // Load user's existing votes
  useEffect(() => {
    if (!currentUser) {
      setUserVotes(new Map())
      return
    }

    const loadVotes = async () => {
      try {
        const votesQuery = query(collection(db, 'votes'), where('userId', '==', currentUser.uid))
        const snapshot = await getDocs(votesQuery)

        const votesMap = new Map<string, VoteType>()
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Vote
          votesMap.set(data.trackId, data.type)
        })

        setUserVotes(votesMap)
      } catch (err) {
        console.error('Failed to load user votes:', err)
      }
    }

    void loadVotes()
  }, [currentUser])

  const toggleVote = useCallback(
    async (trackId: string, voteType: VoteType) => {
      if (!currentUser) return

      setLoading(true)
      try {
        const currentVote = userVotes.get(trackId)

        // If same vote exists, remove it (undo)
        if (currentVote === voteType) {
          const votesQuery = query(
            collection(db, 'votes'),
            where('userId', '==', currentUser.uid),
            where('trackId', '==', trackId),
            where('type', '==', voteType),
          )
          const snapshot = await getDocs(votesQuery)

          for (const voteDoc of snapshot.docs) {
            await deleteDoc(voteDoc.ref)
          }

          // Decrement counter on track
          const trackRef = doc(db, 'tracks', trackId)
          await updateDoc(trackRef, {
            [`${voteType}votesCount`]: increment(-1),
            netScore: increment(voteType === 'up' ? -1 : 1),
          })

          setUserVotes((prev) => {
            const newVotes = new Map(prev)
            newVotes.delete(trackId)
            return newVotes
          })

          return
        }

        // If different vote exists, replace it
        if (currentVote) {
          const oldVotesQuery = query(
            collection(db, 'votes'),
            where('userId', '==', currentUser.uid),
            where('trackId', '==', trackId),
            where('type', '==', currentVote),
          )
          const snapshot = await getDocs(oldVotesQuery)

          for (const voteDoc of snapshot.docs) {
            await deleteDoc(voteDoc.ref)
          }

          // Update track counters atomically
          const trackRef = doc(db, 'tracks', trackId)
          await updateDoc(trackRef, {
            [`${currentVote}votesCount`]: increment(-1),
            [`${voteType}votesCount`]: increment(1),
            netScore: increment(voteType === 'up' ? 2 : -2),
          })
        } else {
          // New vote
          await addDoc(collection(db, 'votes'), {
            userId: currentUser.uid,
            trackId,
            type: voteType,
            timestamp: serverTimestamp(),
          })

          // Increment counter on track
          const trackRef = doc(db, 'tracks', trackId)
          await updateDoc(trackRef, {
            [`${voteType}votesCount`]: increment(1),
            netScore: increment(voteType === 'up' ? 1 : -1),
          })
        }

        // Update local state
        setUserVotes((prev) => {
          const newVotes = new Map(prev)
          newVotes.set(trackId, voteType)
          return newVotes
        })
      } catch (err) {
        console.error('Failed to toggle vote:', err)
      } finally {
        setLoading(false)
      }
    },
    [currentUser, userVotes],
  )

  const getUserVote = useCallback(
    (trackId: string): VoteType | null => {
      return userVotes.get(trackId) ?? null
    },
    [userVotes],
  )

  return {
    toggleVote,
    getUserVote,
    loading,
    isAuthenticated: !!currentUser,
  }
}
