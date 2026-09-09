import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchLeagues } from '@/api/sportsDb'
import { useLeagues } from '@/composables/useLeagues'
import type { League } from '@/types/sports'

vi.mock('@/api/sportsDb', () => ({
  fetchLeagues: vi.fn(),
}))

const leagues: League[] = [
  {
    idLeague: '1',
    strLeague: 'English Premier League',
    strSport: 'Soccer',
  },
  {
    idLeague: '2',
    strLeague: 'Basketball Champions League',
    strSport: 'Basketball',
  },
  {
    idLeague: '3',
    strLeague: 'Scottish Premier League',
    strSport: 'Soccer',
  },
]

const fetchLeaguesMock = vi.mocked(fetchLeagues)

async function setupLeagues() {
  fetchLeaguesMock.mockResolvedValue(leagues)
  const state = useLeagues()

  await flushPromises()

  return state
}

describe('useLeagues filtering', () => {
  beforeEach(() => {
    fetchLeaguesMock.mockReset()
  })

  it('matches league names case-insensitively', async () => {
    const { filteredLeagues, searchTerm } = await setupLeagues()

    searchTerm.value = 'PREMIER'

    expect(filteredLeagues.value.map((league) => league.idLeague)).toEqual(['1', '3'])
  })

  it('ignores leading and trailing search whitespace', async () => {
    const { filteredLeagues, searchTerm } = await setupLeagues()

    searchTerm.value = '  champions  '

    expect(filteredLeagues.value.map((league) => league.idLeague)).toEqual(['2'])
  })

  it('filters leagues by sport', async () => {
    const { filteredLeagues, selectedSport } = await setupLeagues()

    selectedSport.value = 'Soccer'

    expect(filteredLeagues.value.map((league) => league.idLeague)).toEqual(['1', '3'])
  })

  it('combines search and sport filters', async () => {
    const { filteredLeagues, searchTerm, selectedSport } = await setupLeagues()

    searchTerm.value = 'league'
    selectedSport.value = 'Basketball'

    expect(filteredLeagues.value.map((league) => league.idLeague)).toEqual(['2'])
  })

  it('derives sorted, unique sport options from the loaded leagues', async () => {
    const { sportOptions } = await setupLeagues()

    expect(sportOptions.value).toEqual(['Basketball', 'Soccer'])
  })
})
