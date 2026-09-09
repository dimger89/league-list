<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import type { LeagueBadgeState } from '@/composables/useLeagueBadges'
import type { League } from '@/types/sports'

const props = defineProps<{
  league: League
  selected: boolean
  badgeState: LeagueBadgeState
}>()

defineEmits<{
  select: [leagueId: string]
  retry: [leagueId: string]
}>()

const imageLoadFailed = ref(false)
const alternateName = computed(() => props.league.strLeagueAlternate?.trim())
const badgePanelId = computed(() => `league-badge-${props.league.idLeague}`)

watch(
  () => props.badgeState.badgeUrl,
  () => {
    imageLoadFailed.value = false
  },
)
</script>

<template>
  <article class="league-card" :class="{ 'league-card--selected': selected }">
    <button
      type="button"
      class="league-card__trigger"
      :aria-expanded="selected"
      :aria-controls="badgePanelId"
      @click="$emit('select', league.idLeague)"
    >
      <span class="league-card__content">
        <span class="league-card__sport">{{ league.strSport }}</span>
        <span class="league-card__name" role="heading" aria-level="3">
          {{ league.strLeague }}
        </span>
        <span v-if="alternateName" class="league-card__alternate">{{ alternateName }}</span>
      </span>
      <span class="league-card__toggle" aria-hidden="true">{{ selected ? '−' : '+' }}</span>
    </button>

    <div v-if="selected" :id="badgePanelId" class="league-card__badge" aria-live="polite">
      <div v-if="badgeState.status === 'loading'" class="badge-feedback">
        <ProgressSpinner class="badge-feedback__spinner" />
        <span>Loading season badge…</span>
      </div>

      <template v-else-if="badgeState.status === 'success'">
        <div v-if="imageLoadFailed" class="badge-feedback badge-feedback--stacked">
          <Message severity="warn" variant="simple" :closable="false">
            The badge image could not be displayed.
          </Message>
        </div>
        <img
          v-else
          class="league-card__badge-image"
          :src="badgeState.badgeUrl ?? undefined"
          :alt="`${league.strLeague} season badge`"
          loading="lazy"
          @error="imageLoadFailed = true"
        />
      </template>

      <Message
        v-else-if="badgeState.status === 'empty'"
        severity="secondary"
        variant="simple"
        :closable="false"
      >
        No season badge is available for this league.
      </Message>

      <div v-else-if="badgeState.status === 'error'" class="badge-feedback badge-feedback--stacked">
        <Message severity="error" variant="simple" :closable="false">
          {{ badgeState.error ?? 'Unable to load the league badge.' }}
        </Message>
        <Button size="small" variant="outlined" @click="$emit('retry', league.idLeague)">
          Try again
        </Button>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.league-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  box-shadow: var(--shadow-small);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-medium);
    transform: translateY(-1px);
  }

  &--selected {
    border-color: var(--color-accent);
    box-shadow:
      0 0 0 1px var(--color-accent),
      var(--shadow-medium);
  }

  &__trigger {
    display: flex;
    width: 100%;
    min-height: 9.5rem;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.35rem;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;

    &:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: -3px;
    }
  }

  &__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
  }

  &__sport {
    display: inline-flex;
    margin-bottom: 0.85rem;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.7rem;
    font-weight: 750;
    letter-spacing: 0.07em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  &__name {
    color: var(--color-heading);
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.35;
  }

  &__alternate {
    margin-top: 0.45rem;
    color: var(--color-text-muted);
    font-size: 0.84rem;
    line-height: 1.45;
  }

  &__toggle {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-text-muted);
    font-size: 1.15rem;
    line-height: 1;
  }

  &__badge {
    display: grid;
    min-height: 10rem;
    place-items: center;
    padding: 1.25rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-muted);
  }

  &__badge-image {
    display: block;
    width: min(100%, 10rem);
    height: 8rem;
    object-fit: contain;
  }
}

.badge-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  text-align: center;

  &--stacked {
    flex-direction: column;
  }

  &__spinner {
    width: 1.5rem;
    height: 1.5rem;
  }

  :deep(.p-message) {
    margin: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .league-card {
    transition: none;
  }
}
</style>
