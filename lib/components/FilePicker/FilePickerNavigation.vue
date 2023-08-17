<template>
	<Fragment>
		<!-- Filter for the file list -->
		<NcTextField class="file-picker__filter-input"
			:value="filterString"
			:label="t('Filter file list')"
			:show-trailing-button="!!filterString"
			@update:value="updateFilterValue"
			@trailing-button-click="updateFilterValue('')">
			<IconMagnify :size="16" />
			<template #trailing-button-icon>
				<IconClose :size="16" />
			</template>
		</NcTextField>
		<!-- On non collapsed dialogs show the tablist, otherwise a dropdown is shown -->
		<ul v-if="!isCollapsed"
			class="file-picker__side"
			role="tablist"
			:aria-label="t('Filepicker sections')">
			<li v-for="view in allViews" :key="view.id">
				<NcButton :aria-selected="currentView === view.id"
					:type="currentView === view.id ? 'primary' : 'tertiary'"
					:wide="true"
					role="tab"
					@click="$emit('update:currentView', view.id)">
					<template #icon>
						<component :is="view.icon" :size="20" />
					</template>
					{{ view.label }}
				</NcButton>
			</li>
		</ul>
		<NcSelect v-else
			:aria-label="t('Current view selector')"
			:clearable="false"
			:searchable="false"
			:options="allViews"
			:value="currentViewObject"
			@input="v => emit('update:currentView', v.id)" />
	</Fragment>
</template>

<script setup lang="ts">
import IconFolder from 'vue-material-design-icons/Folder.vue'
import IconClock from 'vue-material-design-icons/Clock.vue'
import IconClose from 'vue-material-design-icons/Close.vue'
import IconMagnify from 'vue-material-design-icons/Magnify.vue'
import IconStar from 'vue-material-design-icons/Star.vue'

import { NcButton, NcSelect, NcTextField } from '@nextcloud/vue'
import { t } from '../../utils/l10n'
import { computed } from 'vue'
import { Fragment } from 'vue-frag'

const allViews = [{
	id: 'files',
	label: t('All files'),
	icon: IconFolder,
}, {
	id: 'recent',
	label: t('Recent'),
	icon: IconClock,
}, {
	id: 'favorites',
	label: t('Favorites'),
	icon: IconStar,
}]

const props = defineProps<{
	currentView: 'files' | 'recent' | 'favorites',
	filterString: string,
	isCollapsed: boolean
}>()

interface INavigationEvents {
	(e: 'update:currentView', v: typeof props.currentView): void
	(e: 'update:filterString', v: string): void
}
const emit = defineEmits<INavigationEvents>()

/**
 * The currently active view object
 */
const currentViewObject = computed(() => allViews.filter(v => v.id === props.currentView)[0])

/**
 * Propagate current filter value to paren
 *
 * @param value The new filter value
 */
const updateFilterValue = (value: string) => emit('update:filterString', value)
</script>

<style scoped lang="scss">
.file-picker {
	&__side {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 0.5rem;
		min-width: 200px;

		:deep(.button-vue__wrapper) {
			justify-content: start;
		}
	}

	&__filter-input {
		// Align with view title and breadcrumbs
		margin-block: 7px; // 36px height + 2x 7px => 50px

		max-width: 260px;
	}
}

// Ensure filepicker works on mobile
@media (max-width: 736px) {
	.file-picker {
		&__side {
			flex-direction: row;
			min-width: unset;

		}
	}
}
@media (max-width: 512px) {
	.file-picker {
		&__side {
			flex-direction: row;
			min-width: unset;

		}
		&__filter-input {
			max-width: unset;
		}
	}
}
</style>

<style>
.file-picker__navigation .v-select.select {
	min-width: 220px;
}

@media (min-width: 513px) and (max-width: 736px) {
	.file-picker__navigation {
		gap: 11px;
	}
}

@media (max-width: 512px) {
	.file-picker__navigation {
		flex-direction: column-reverse!important;
	}
}
</style>
