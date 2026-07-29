import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { usePlayerEngine } from '@/hooks/usePlayerEngine'

describe('usePlayerEngine.setLoop', () => {
  it('toggles the audio element loop flag (repeat-one uses native looping)', () => {
    const { result } = renderHook(() =>
      usePlayerEngine({ onEnded: () => undefined, onError: () => undefined }),
    )
    expect(result.current.audioRef.current?.loop).toBe(false)
    result.current.setLoop(true)
    expect(result.current.audioRef.current?.loop).toBe(true)
    result.current.setLoop(false)
    expect(result.current.audioRef.current?.loop).toBe(false)
  })
})
