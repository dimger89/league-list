import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchLeagueBadge } from '@/api/sportsDb'
import { useLeagueBadges } from '@/composables/useLeagueBadges'

vi.mock('@/api/sportsDb', () => ({
  fetchLeagueBadge: vi.fn(),
}))

const fetchLeagueBadgeMock = vi.mocked(fetchLeagueBadge)

describe('useLeagueBadges', () => {
  beforeEach(() => {
    fetchLeagueBadgeMock.mockReset()
  })

  it('caches a successfully resolved badge', async () => {
    fetchLeagueBadgeMock.mockResolvedValue('https://images.example/badge.png')
    const { getBadgeState, loadBadge } = useLeagueBadges()

    await loadBadge('1')
    await loadBadge('1')

    expect(fetchLeagueBadgeMock).toHaveBeenCalledOnce()
    expect(getBadgeState('1')).toEqual({
      status: 'success',
      badgeUrl: 'https://images.example/badge.png',
      error: null,
    })
  })

  it('caches a null badge result', async () => {
    fetchLeagueBadgeMock.mockResolvedValue(null)
    const { getBadgeState, loadBadge } = useLeagueBadges()

    await loadBadge('1')
    await loadBadge('1')

    expect(fetchLeagueBadgeMock).toHaveBeenCalledOnce()
    expect(getBadgeState('1')).toEqual({
      status: 'empty',
      badgeUrl: null,
      error: null,
    })
  })

  it('shares an in-flight request for concurrent calls to the same league', async () => {
    let resolveRequest: ((badgeUrl: string | null) => void) | undefined
    const pendingRequest = new Promise<string | null>((resolve) => {
      resolveRequest = resolve
    })
    fetchLeagueBadgeMock.mockReturnValue(pendingRequest)
    const { getBadgeState, loadBadge } = useLeagueBadges()

    const firstRequest = loadBadge('1')
    const secondRequest = loadBadge('1')

    expect(firstRequest).toBe(secondRequest)
    expect(fetchLeagueBadgeMock).toHaveBeenCalledOnce()
    expect(getBadgeState('1').status).toBe('loading')

    resolveRequest?.('https://images.example/badge.png')
    await Promise.all([firstRequest, secondRequest])

    expect(getBadgeState('1').status).toBe('success')
  })

  it('exposes an error state and retries failed requests', async () => {
    fetchLeagueBadgeMock
      .mockRejectedValueOnce(new Error('Badge request failed'))
      .mockResolvedValueOnce('https://images.example/recovered.png')
    const { getBadgeState, loadBadge } = useLeagueBadges()

    await loadBadge('1')

    expect(getBadgeState('1')).toEqual({
      status: 'error',
      badgeUrl: null,
      error: 'Badge request failed',
    })

    await loadBadge('1')

    expect(fetchLeagueBadgeMock).toHaveBeenCalledTimes(2)
    expect(getBadgeState('1')).toEqual({
      status: 'success',
      badgeUrl: 'https://images.example/recovered.png',
      error: null,
    })
  })
})
