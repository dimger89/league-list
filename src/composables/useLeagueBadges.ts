import { reactive } from 'vue'

import { fetchLeagueBadge } from '@/api/sportsDb'

export type LeagueBadgeStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface LeagueBadgeState {
  readonly status: LeagueBadgeStatus
  readonly badgeUrl: string | null
  readonly error: string | null
}

const idleState: LeagueBadgeState = {
  status: 'idle',
  badgeUrl: null,
  error: null,
}

export function useLeagueBadges() {
  const badgeStates = reactive(new Map<string, LeagueBadgeState>())
  const inFlightRequests = new Map<string, Promise<void>>()

  function getBadgeState(leagueId: string): LeagueBadgeState {
    return badgeStates.get(leagueId) ?? idleState
  }

  function loadBadge(leagueId: string): Promise<void> {
    const state = badgeStates.get(leagueId)

    if (state?.status === 'success' || state?.status === 'empty') {
      return Promise.resolve()
    }

    const inFlightRequest = inFlightRequests.get(leagueId)

    if (inFlightRequest) {
      return inFlightRequest
    }

    badgeStates.set(leagueId, {
      status: 'loading',
      badgeUrl: null,
      error: null,
    })

    const request = fetchLeagueBadge(leagueId)
      .then((badgeUrl) => {
        badgeStates.set(leagueId, {
          status: badgeUrl ? 'success' : 'empty',
          badgeUrl,
          error: null,
        })
      })
      .catch((caughtError: unknown) => {
        badgeStates.set(leagueId, {
          status: 'error',
          badgeUrl: null,
          error:
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load the league badge.',
        })
      })
      .finally(() => {
        inFlightRequests.delete(leagueId)
      })

    inFlightRequests.set(leagueId, request)

    return request
  }

  return {
    getBadgeState,
    loadBadge,
  }
}
