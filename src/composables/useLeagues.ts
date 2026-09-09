import { computed, ref } from 'vue'

import { fetchLeagues } from '@/api/sportsDb'
import type { League } from '@/types/sports'

export function useLeagues() {
  const leagues = ref<League[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchTerm = ref('')
  const selectedSport = ref<string | null>(null)

  const sportOptions = computed(() => {
    const sports = new Set(leagues.value.map((league) => league.strSport))

    return [...sports].sort((first, second) => first.localeCompare(second))
  })

  const filteredLeagues = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()

    return leagues.value.filter((league) => {
      const matchesSearch = league.strLeague.toLowerCase().includes(query)
      const matchesSport = !selectedSport.value || league.strSport === selectedSport.value

      return matchesSearch && matchesSport
    })
  })

  async function loadLeagues(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      leagues.value = await fetchLeagues()
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error ? caughtError.message : 'Unable to load sports leagues.'
    } finally {
      isLoading.value = false
    }
  }

  void loadLeagues()

  return {
    leagues,
    isLoading,
    error,
    searchTerm,
    selectedSport,
    sportOptions,
    filteredLeagues,
    loadLeagues,
  }
}
