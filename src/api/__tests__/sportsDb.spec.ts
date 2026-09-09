import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchLeagueBadge, fetchLeagues } from '@/api/sportsDb'

const ALL_LEAGUES_URL = 'https://www.thesportsdb.com/api/v1/json/3/all_leagues.php'

function responseWith(body: unknown, options: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe('SportsDB API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches leagues from the exact All Leagues endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseWith({ leagues: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await fetchLeagues()

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(ALL_LEAGUES_URL)
  })

  it('throws when SportsDB returns a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(responseWith(null, { ok: false, status: 503 })),
    )

    await expect(fetchLeagues()).rejects.toThrow('TheSportsDB request failed with status 503')
  })

  it('returns the first non-empty season badge', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        responseWith({
          seasons: [
            { strSeason: '2012-2013', strBadge: null },
            { strSeason: '2013-2014', strBadge: '   ' },
            { strSeason: '2014-2015', strBadge: ' https://images.example/first.png ' },
            { strSeason: '2015-2016', strBadge: 'https://images.example/second.png' },
          ],
        }),
      ),
    )

    await expect(fetchLeagueBadge('4331')).resolves.toBe('https://images.example/first.png')
  })

  it.each([
    ['null seasons', null],
    ['an empty seasons array', []],
    [
      'seasons without a usable badge',
      [
        { strSeason: '2012-2013', strBadge: null },
        { strSeason: '2013-2014', strBadge: '   ' },
      ],
    ],
  ])('returns null for %s', async (_description, seasons) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWith({ seasons })))

    await expect(fetchLeagueBadge('4331')).resolves.toBeNull()
  })
})
