<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<!-- Simple component to fake a loading table row with placeholders -->
<template>
	<tr aria-hidden="true" class="file-picker__row loading-row">
		<td v-if="showCheckbox" class="row-checkbox">
			<span />
		</td>
		<td class="row-name">
			<div class="row-wrapper">
				<span :class="fileListIconStyles['file-picker__file-icon']" />
				<span />
			</div>
		</td>
		<td class="row-size">
			<span />
		</td>
		<td class="row-modified">
			<span />
		</td>
	</tr>
</template>

<script setup lang="ts">
import fileListIconStyles from './FileListIcon.module.scss'

defineProps<{
	/**
	 * Does the filelist use the checkbox column
	 */
	showCheckbox: boolean
}>()
</script>

<style scoped lang="scss">
@use './FileList';

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

.loading-row {
	.row-checkbox {
		text-align: center!important;
	}

	span {
		display: inline-block;
		height: 24px;

		background: linear-gradient(to right,var(--color-background-darker),var(--color-text-maxcontrast),var(--color-background-darker));
		background-size: 600px 100%;
		border-radius: var(--border-radius);
		animation: gradient 12s ease infinite;
	}

	.row-wrapper {
		display: inline-flex;
		align-items: center;
	}

	.row-checkbox span {
		width: 24px;
	}

	.row-name span:last-of-type {
		margin-inline-start: 6px;
		width: 130px;
	}

	.row-size span {
		width: 80px;
	}

	.row-modified span {
		width: 90px;
	}
}
</style>
