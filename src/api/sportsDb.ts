import type { AllLeaguesResponse, League, SeasonBadgeResponse } from '@/types/sports'

const ALL_LEAGUES_URL = 'https://www.thesportsdb.com/api/v1/json/3/all_leagues.php'
const SEASON_BADGE_URL =
  'https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id='

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`TheSportsDB request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchLeagues(): Promise<League[]> {
  const response = await fetchJson<AllLeaguesResponse>(ALL_LEAGUES_URL)

  return response.leagues
}

export async function fetchLeagueBadge(leagueId: string): Promise<string | null> {
  const response = await fetchJson<SeasonBadgeResponse>(`${SEASON_BADGE_URL}${leagueId}`)

  for (const season of response.seasons ?? []) {
    const badge = season.strBadge?.trim()

    if (badge) {
      return badge
    }
  }

  return null
}
