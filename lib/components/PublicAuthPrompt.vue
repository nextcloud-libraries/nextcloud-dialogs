<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { getBuilder } from '@nextcloud/browser-storage'
import { setGuestNickname } from '@nextcloud/auth'
import { showError } from '@nextcloud/dialogs'

import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcTextField from '@nextcloud/vue/components/NcTextField'

import { t } from '../utils/l10n.ts'

export interface PublicAuthPromptProps {
	/**
	 * Preselected nickname.
	 * No name preselected by default.
	 */
	nickname?: string,

	/**
	 * Dialog title
	 */
	title?: string

	/**
	 * Dialog text under the dialog title.
	 * e.g 'Enter your name to access the file'.
	 * Not shown by default.
	 */
	text?: string

	/**
	 * Dialog notice
	 */
	notice?: string

	/**
	 * Dialog submit button label
	 */
	submitLabel?: string

	/**
	 * Whether the dialog is cancellable
	 */
	cancellable?: boolean
}

const props = withDefaults(defineProps<PublicAuthPromptProps>(), {
	title: t('Guest identification'),
	nickname: '',
	notice: t('You are currently not identified.'),
	submitLabel: t('Submit name'),
})

const emit = defineEmits<{
	close: [nickname?: string]
}>()

const inputElement = useTemplateRef('input')
const storage = getBuilder('public').build()

const name = ref(props.nickname)
watch(() => props.nickname, () => {
	// Reset name to pre-selected nickname (e.g. Talk / Collabora)
	name.value = props.nickname
})

const buttons = computed(() => {
	const cancelButton = {
		label: t('Cancel'),
		variant: 'tertiary',
		callback: () => emit('close'),
	} as const

	const submitButton = {
		label: props.submitLabel,
		type: 'submit',
		variant: 'primary',
	} as const

	// If the dialog is cancellable, add a cancel button
	if (props.cancellable) {
		return [cancelButton, submitButton]
	}

	return [submitButton]
})

function onSubmit() {
	const nickname = name.value.trim()

	if (nickname === '') {
		// Show error if the nickname is empty
		inputElement.value.setCustomValidity(t('You cannot leave the name empty.'))
		inputElement.value.reportValidity()
		inputElement.value.focus()
		return
	}

	if (nickname.length < 2) {
		// Show error if the nickname is too short
		inputElement.value.setCustomValidity(t('Please enter a name with at least 2 characters.'))
		inputElement.value.reportValidity()
		inputElement.value.focus()
		return
	}

	try {
		// Set the nickname
		setGuestNickname(nickname)
	} catch (e) {
		showError(t('Failed to set nickname.'))
		console.error('Failed to set nickname', e)
		inputElement.value.focus()
		return
	}

	// Set the dialog as shown
	storage.setItem('public-auth-prompt-shown', 'true')

	// Close the dialog
	emit('close', name.value)
}
</script>

<template>
	<NcDialog
		:buttons
		class="public-auth-prompt"
		data-cy-public-auth-prompt-dialog
		is-form
		no-close
		:name="title"
		@submit="onSubmit">
		<p v-if="text" class="public-auth-prompt__text">
			{{ text }}
		</p>

		<!-- Header -->
		<NcNoteCard class="public-auth-prompt__header"
			:text="notice"
			type="info" />

		<!-- Form -->
		<NcTextField ref="input"
			class="public-auth-prompt__input"
			data-cy-public-auth-prompt-dialog-name
			:label="t('Name')"
			:placeholder="t('Enter your name')"
			:required="!cancellable"
			v-model="name"
			minlength="2"
			name="name" />
	</NcDialog>
</template>

<style scoped lang="scss">
.public-auth-prompt {
	&__text {
		// Smaller than dialog title
		font-size: 1.25em;
		margin-block: 0 calc(3 * var(--default-grid-baseline));
	}

	&__header {
		margin-block: 0 calc(3 * var(--default-grid-baseline));
		// No extra top margin for the first child
		&:first-child {
			margin-top: 0;
		}
	}

	&__input {
		margin-block: calc(4 * var(--default-grid-baseline)) calc(2 * var(--default-grid-baseline));
	}
}
</style>
