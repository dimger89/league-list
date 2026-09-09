<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

import type { LeagueBadgeState } from '@/composables/useLeagueBadges'
import type { League } from '@/types/sports'

const props = defineProps<{
  league: League
  searchTerm: string
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
const leagueNameSegments = computed(() => {
  const name = props.league.strLeague
  const query = props.searchTerm.trim()

  if (!query) {
    return [{ text: name, highlighted: false }]
  }

  const segments: Array<{ text: string; highlighted: boolean }> = []
  const normalizedName = name.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  let currentIndex = 0
  let matchIndex = normalizedName.indexOf(normalizedQuery)

  while (matchIndex !== -1) {
    if (matchIndex > currentIndex) {
      segments.push({ text: name.slice(currentIndex, matchIndex), highlighted: false })
    }

    const matchEnd = matchIndex + query.length
    segments.push({ text: name.slice(matchIndex, matchEnd), highlighted: true })
    currentIndex = matchEnd
    matchIndex = normalizedName.indexOf(normalizedQuery, currentIndex)
  }

  if (currentIndex < name.length) {
    segments.push({ text: name.slice(currentIndex), highlighted: false })
  }

  return segments.length > 0 ? segments : [{ text: name, highlighted: false }]
})

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
          <template v-for="(segment, index) in leagueNameSegments" :key="index">
            <mark
              v-if="segment.highlighted"
              class="league-card__name-highlight"
              v-text="segment.text"
            ></mark>
            <template v-else>{{ segment.text }}</template>
          </template>
        </span>
        <span v-if="alternateName" class="league-card__alternate">{{ alternateName }}</span>
      </span>
      <span class="league-card__toggle" aria-hidden="true">{{ selected ? '−' : '+' }}</span>
    </button>

    <Transition name="badge">
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

        <div
          v-else-if="badgeState.status === 'error'"
          class="badge-feedback badge-feedback--stacked"
        >
          <Message severity="error" variant="simple" :closable="false">
            {{ badgeState.error ?? 'Unable to load the league badge.' }}
          </Message>
          <Button size="small" variant="outlined" @click="$emit('retry', league.idLeague)">
            Try again
          </Button>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped lang="scss">
.league-card {
  height: fit-content;
  align-self: start;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  box-shadow: var(--shadow-small);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-medium);
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

  &__name-highlight {
    padding: 0;
    border-radius: 0.15rem;
    background: var(--color-accent-soft);
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
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

.badge-enter-active,
.badge-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: translateY(0.25rem);
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

  .badge-enter-active,
  .badge-leave-active {
    transition: none;
  }

  .badge-enter-from,
  .badge-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
