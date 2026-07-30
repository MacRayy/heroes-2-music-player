import { describe, expect, it } from 'vitest'

import { parseTrackParam, trackShareUrl } from '@/data/share'
import { TRACKS } from '@/data/tracks'

describe('parseTrackParam', () => {
  const realId = TRACKS[0]?.id ?? ''

  it('returns a valid track id from the query', () => {
    expect(parseTrackParam(`?track=${realId}`)).toBe(realId)
  })

  it('returns null for an unknown id', () => {
    expect(parseTrackParam('?track=not-a-track')).toBeNull()
  })

  it('returns null when the param is absent', () => {
    expect(parseTrackParam('')).toBeNull()
    expect(parseTrackParam('?foo=bar')).toBeNull()
  })
})

describe('trackShareUrl', () => {
  it('builds an origin-rooted ?track= URL', () => {
    expect(trackShareUrl('https://homm2musicplayer.com', 'town-warlock')).toBe(
      'https://homm2musicplayer.com/?track=town-warlock',
    )
  })
})
