import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LeagueCard from '@/components/LeagueCard.vue'
import type { LeagueBadgeState } from '@/composables/useLeagueBadges'
import type { League } from '@/types/sports'

const league: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: 'Premier League',
}

const idleState: LeagueBadgeState = {
  status: 'idle',
  badgeUrl: null,
  error: null,
}

function mountCard({
  leagueValue = league,
  selected = false,
  badgeState = idleState,
}: {
  leagueValue?: League
  selected?: boolean
  badgeState?: LeagueBadgeState
} = {}) {
  return shallowMount(LeagueCard, {
    props: {
      league: leagueValue,
      searchTerm: '',
      selected,
      badgeState,
    },
    global: {
      stubs: {
        Transition: false,
        ProgressSpinner: {
          template: '<span data-testid="spinner" />',
        },
        Message: {
          template: '<div data-testid="message"><slot /></div>',
        },
        Button: {
          template: '<button type="button"><slot /></button>',
        },
      },
    },
  })
}

describe('LeagueCard', () => {
  it('renders a non-empty alternate name and omits it when absent', async () => {
    const wrapper = mountCard()

    expect(wrapper.get('.league-card__alternate').text()).toBe('Premier League')

    await wrapper.setProps({
      league: {
        idLeague: league.idLeague,
        strLeague: league.strLeague,
        strSport: league.strSport,
      },
    })

    expect(wrapper.find('.league-card__alternate').exists()).toBe(false)
  })

  it('emits the league ID when selected', async () => {
    const wrapper = mountCard()

    await wrapper.get('.league-card__trigger').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[league.idLeague]])
  })

  it('renders badge loading feedback', () => {
    const wrapper = mountCard({
      selected: true,
      badgeState: { status: 'loading', badgeUrl: null, error: null },
    })

    expect(wrapper.text()).toContain('Loading season badge…')
    expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(true)
  })

  it('renders a resolved badge image', () => {
    const wrapper = mountCard({
      selected: true,
      badgeState: {
        status: 'success',
        badgeUrl: 'https://images.example/badge.png',
        error: null,
      },
    })

    const image = wrapper.get('.league-card__badge-image')
    expect(image.attributes('src')).toBe('https://images.example/badge.png')
    expect(image.attributes('alt')).toBe('English Premier League season badge')
  })

  it('renders no-badge feedback', () => {
    const wrapper = mountCard({
      selected: true,
      badgeState: { status: 'empty', badgeUrl: null, error: null },
    })

    expect(wrapper.text()).toContain('No season badge is available for this league.')
  })

  it('renders badge errors with a retry action', () => {
    const wrapper = mountCard({
      selected: true,
      badgeState: { status: 'error', badgeUrl: null, error: 'Badge request failed' },
    })

    expect(wrapper.text()).toContain('Badge request failed')
    expect(wrapper.text()).toContain('Try again')
  })
})
