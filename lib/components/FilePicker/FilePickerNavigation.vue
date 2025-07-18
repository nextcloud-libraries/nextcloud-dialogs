<!--
  - SPDX-FileCopyrightText: 2023-2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<!-- Filter for the file list -->
	<NcTextField
		class="file-picker__filter-input"
		:label="t('Filter file list')"
		:show-trailing-button="!!filterString"
		:model-value="filterString"
		@update:model-value="updateFilterValue"
		@trailing-button-click="updateFilterValue('')">
		<IconMagnify :size="16" />
		<template #trailing-button-icon>
			<IconClose :size="16" />
		</template>
	</NcTextField>
	<template v-if="availableViews.length > 1 && !disabledNavigation">
		<!-- On non collapsed dialogs show the tablist, otherwise a dropdown is shown -->
		<ul
			v-if="!isCollapsed"
			class="file-picker__side">
			<li v-for="view in availableViews" :key="view.id">
				<NcButton
					:variant="currentView === view.id ? 'primary' : 'tertiary'"
					:wide="true"
					@click="$emit('update:currentView', view.id)">
					<template #icon>
						<NcIconSvgWrapper :path="view.icon" :size="20" />
					</template>
					{{ view.label }}
				</NcButton>
			</li>
		</ul>
		<NcSelect
			v-else
			:aria-label="t('Current view selector')"
			:clearable="false"
			:searchable="false"
			:options="availableViews"
			:model-value="currentViewObject"
			@update:model-value="emit('update:currentView', $event.id)" />
	</template>
</template>

<script setup lang="ts">
import { getCurrentUser } from '@nextcloud/auth'
import { computed, ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import NcSelect from '@nextcloud/vue/components/NcSelect'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconClose from 'vue-material-design-icons/Close.vue'
import IconMagnify from 'vue-material-design-icons/Magnify.vue'
import { useViews } from '../../composables/views.ts'
import { t } from '../../utils/l10n.ts'

const props = defineProps<{
	/**
	 * Current view
	 */
	currentView: 'files' | 'recent' | 'favorites'
	/**
	 * Current query for filenames
	 */
	filterString: string
	/**
	 * Collapsed state of the navigation
	 */
	isCollapsed: boolean
	/**
	 * Disabled state of the navigation
	 */
	disabledNavigation: boolean
}>()

const emit = defineEmits<INavigationEvents>()
interface INavigationEvents {
	(e: 'update:currentView', v: typeof props.currentView): void
	(e: 'update:filterString', v: string): void
}
const { availableViews } = useViews(ref(getCurrentUser() === null))

/**
 * The currently active view object
 */
const currentViewObject = computed(() => availableViews.filter((v) => v.id === props.currentView)[0] ?? availableViews[0])

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
		align-items: stretch;
		gap: 0.5rem;
		min-width: 200px;
		// ensure focus outline is visible
		padding: 2px;
		// align with input
		margin-block-start: 7px;
		// make only the navigation scroll
		overflow: auto;

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

<style lang="scss">
/* Ensure focus outline is visible */
.file-picker__navigation {
	padding-inline: 8px 2px;
	&, * {
		box-sizing: border-box;
	}

	.v-select.select {
		min-width: 220px;
	}
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
