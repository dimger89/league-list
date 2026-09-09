<script setup lang="ts">
import LeagueCard from '@/components/LeagueCard.vue'
import type { LeagueBadgeState } from '@/composables/useLeagueBadges'
import type { League } from '@/types/sports'

defineProps<{
  leagues: League[]
  searchTerm: string
  selectedLeagueId: string | null
  getBadgeState: (leagueId: string) => LeagueBadgeState
}>()

const emit = defineEmits<{
  select: [leagueId: string]
  retryBadge: [leagueId: string]
}>()
</script>

<template>
  <section v-if="leagues.length === 0" class="filter-empty" aria-live="polite">
    <div class="filter-empty__symbol" aria-hidden="true">×</div>
    <h3>No matching leagues</h3>
    <p>Try a broader league name or choose “All sports”.</p>
  </section>

  <TransitionGroup v-else name="league-list" tag="div" class="league-grid" role="list">
    <LeagueCard
      v-for="league in leagues"
      :key="league.idLeague"
      :league="league"
      :search-term="searchTerm"
      :selected="selectedLeagueId === league.idLeague"
      :badge-state="getBadgeState(league.idLeague)"
      role="listitem"
      @select="emit('select', $event)"
      @retry="emit('retryBadge', $event)"
    />
  </TransitionGroup>
</template>

<style scoped lang="scss">
.league-grid {
  display: grid;
  align-items: start;
  grid-auto-rows: max-content;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}

.league-list-enter-active,
.league-list-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.league-list-enter-from,
.league-list-leave-to {
  opacity: 0;
  transform: translateY(0.2rem);
}

.filter-empty {
  display: flex;
  min-height: 16rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  text-align: center;

  &__symbol {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: 0.9rem;
    place-items: center;
    border-radius: 50%;
    background: var(--color-surface-muted);
    color: var(--color-text-muted);
    font-size: 1.3rem;
  }

  h3 {
    margin: 0;
    color: var(--color-heading);
    font-size: 1.2rem;
    font-weight: 700;
  }

  p {
    margin: 0.55rem 0 0;
    color: var(--color-text-muted);
  }
}

@media (prefers-reduced-motion: reduce) {
  .league-list-enter-active,
  .league-list-leave-active {
    transition: none;
  }

  .league-list-enter-from,
  .league-list-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
