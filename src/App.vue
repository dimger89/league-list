<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import LeagueFilters from '@/components/LeagueFilters.vue'
import LeagueList from '@/components/LeagueList.vue'
import { useLeagueBadges } from '@/composables/useLeagueBadges'
import { useLeagues } from '@/composables/useLeagues'

const {
  leagues,
  isLoading,
  error,
  searchTerm,
  selectedSport,
  sportOptions,
  filteredLeagues,
  loadLeagues,
} = useLeagues()
const { getBadgeState, loadBadge } = useLeagueBadges()

type ViewState = 'loading' | 'error' | 'empty' | 'ready'

const selectedLeagueId = ref<string | null>(null)
const viewState = computed<ViewState>(() => {
  if (isLoading.value) {
    return 'loading'
  }

  if (error.value) {
    return 'error'
  }

  if (leagues.value.length === 0) {
    return 'empty'
  }

  return 'ready'
})

function handleLeagueSelect(leagueId: string): void {
  if (selectedLeagueId.value === leagueId) {
    selectedLeagueId.value = null
    return
  }

  selectedLeagueId.value = leagueId
  void loadBadge(leagueId)
}

function handleBadgeRetry(leagueId: string): void {
  void loadBadge(leagueId)
}
</script>

<template>
  <div class="app-shell">
    <header class="page-header">
      <p class="page-header__eyebrow">Sports league directory</p>
      <h1>Find your league</h1>
      <p class="page-header__intro">
        Browse leagues across every available sport and reveal their season badges.
      </p>
    </header>

    <main>
      <section
        v-if="viewState === 'loading'"
        class="page-state"
        aria-live="polite"
        aria-busy="true"
      >
        <ProgressSpinner class="page-state__spinner" />
        <h2>Loading leagues</h2>
        <p>Getting the latest league directory from TheSportsDB.</p>
      </section>

      <section v-else-if="viewState === 'error'" class="page-state">
        <Message severity="error" variant="simple" :closable="false">
          {{ error }}
        </Message>
        <h2>We couldn’t load the leagues</h2>
        <p>Check your connection and try the request again.</p>
        <Button variant="outlined" @click="loadLeagues">Try again</Button>
      </section>

      <section v-else-if="viewState === 'empty'" class="page-state" aria-live="polite">
        <div class="page-state__symbol" aria-hidden="true">0</div>
        <h2>No leagues available</h2>
        <p>The API returned an empty league list. Try again in a moment.</p>
        <Button variant="outlined" @click="loadLeagues">Reload leagues</Button>
      </section>

      <section v-else class="league-directory" aria-labelledby="league-directory-title">
        <LeagueFilters
          v-model:search-term="searchTerm"
          v-model:selected-sport="selectedSport"
          :sport-options="sportOptions"
        />

        <div class="league-directory__heading">
          <div>
            <p class="league-directory__eyebrow">Directory</p>
            <h2 id="league-directory-title">Available leagues</h2>
          </div>
          <p class="league-directory__count" aria-live="polite">
            {{ filteredLeagues.length }} of {{ leagues.length }}
          </p>
        </div>

        <LeagueList
          :leagues="filteredLeagues"
          :search-term="searchTerm"
          :selected-league-id="selectedLeagueId"
          :get-badge-state="getBadgeState"
          @select="handleLeagueSelect"
          @retry-badge="handleBadgeRetry"
        />
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  width: min(100% - 2rem, 77.5rem);
  margin-inline: auto;
  padding-block: clamp(2.5rem, 7vw, 5.5rem) 4rem;
}

.page-header {
  max-width: 43rem;
  margin-bottom: clamp(2rem, 5vw, 3.75rem);

  &__eyebrow {
    margin: 0 0 0.65rem;
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: var(--color-heading);
    font-size: clamp(2.25rem, 6vw, 4.25rem);
    font-weight: 760;
    letter-spacing: -0.045em;
    line-height: 1;
  }

  &__intro {
    max-width: 38rem;
    margin: 1.25rem 0 0;
    color: var(--color-text-muted);
    font-size: clamp(1rem, 2vw, 1.125rem);
    line-height: 1.7;
  }
}

.league-directory {
  &__heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin: 2.25rem 0 1.25rem;
  }

  &__eyebrow {
    margin: 0 0 0.35rem;
    color: var(--color-accent);
    font-size: 0.72rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: clamp(1.35rem, 3vw, 1.75rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__count {
    flex: 0 0 auto;
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    font-weight: 600;
  }
}

.page-state {
  display: flex;
  min-height: 19rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 6vw, 4rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  text-align: center;

  &__spinner {
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 1.25rem;
  }

  &__symbol {
    display: grid;
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    place-items: center;
    border-radius: 50%;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-weight: 750;
  }

  h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: 1.4rem;
    font-weight: 700;
  }

  p {
    max-width: 31rem;
    margin: 0.65rem 0 1.25rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  :deep(.p-message) {
    max-width: 34rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 640px) {
  .app-shell {
    width: min(100% - 1.25rem, 77.5rem);
    padding-top: 2rem;
  }

  .league-directory__heading {
    align-items: center;
  }
}
</style>
