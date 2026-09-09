<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const props = defineProps<{
  sportOptions: string[]
}>()

const searchTerm = defineModel<string>('searchTerm', { required: true })
const selectedSport = defineModel<string | null>('selectedSport', { required: true })

const selectOptions = computed(() => [
  { label: 'All sports', value: null },
  ...props.sportOptions.map((sport) => ({ label: sport, value: sport })),
])
</script>

<template>
  <form class="league-filters" role="search" @submit.prevent>
    <div class="league-filters__field league-filters__field--search">
      <label for="league-search">Search leagues</label>
      <InputText
        id="league-search"
        v-model="searchTerm"
        class="league-filters__control"
        type="search"
        placeholder="Search by league name"
        autocomplete="off"
      />
    </div>

    <div class="league-filters__field">
      <label for="sport-filter">Sport</label>
      <Select
        v-model="selectedSport"
        input-id="sport-filter"
        class="league-filters__control"
        :options="selectOptions"
        option-label="label"
        option-value="value"
        placeholder="All sports"
        aria-label="Filter leagues by sport"
      />
    </div>
  </form>
</template>

<style scoped lang="scss">
.league-filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
  gap: 1rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
  box-shadow: var(--shadow-small);

  &__field {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.5rem;

    label {
      color: var(--color-heading);
      font-size: 0.82rem;
      font-weight: 700;
    }
  }

  &__control {
    width: 100%;
  }

  :deep(.p-inputtext),
  :deep(.p-select) {
    min-height: 2.85rem;
  }
}

@media (max-width: 640px) {
  .league-filters {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
