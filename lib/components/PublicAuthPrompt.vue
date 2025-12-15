<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { setGuestNickname } from '@nextcloud/auth'
import { getBuilder } from '@nextcloud/browser-storage'
import { computed, ref, useTemplateRef, watch } from 'vue'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import { showError } from '../toast.ts'
import { getGuestNameValidity } from '../utils/guestNameValidity.ts'
import { t } from '../utils/l10n.ts'
import { logger } from '../utils/logger.ts'

export interface PublicAuthPromptProps {
	/**
	 * Preselected nickname.
	 * No name preselected by default.
	 */
	nickname?: string

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
	nickname: '',
	notice: '',
	submitLabel: t('Submit name'),
	text: '',
	title: t('Guest identification'),
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

watch(name, (newName) => {
	// Check validity of the new name
	const validity = getGuestNameValidity(newName)
	if (!validity && inputElement.value) {
		// If the nickname is not valid, show an error
		setCustomValidity(validity)
		return
	}
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

const defaultNotice = computed(() => {
	if (props.notice) {
		return props.notice
	}

	// If no notice is provided, use a default one
	// that changes based on the nickname definition
	if (name.value) {
		return t('You are currently identified as {nickname}.', { nickname: name.value })
	}

	return t('You are currently not identified.')
})

/**
 * Handle saving the nickname and return it.
 */
function onSubmit() {
	const nickname = name.value.trim()

	const validity = getGuestNameValidity(nickname)
	if (validity) {
		// If the nickname is not valid, show an error
		setCustomValidity(validity)
		return
	}

	if (nickname === '') {
		// Show error if the nickname is empty
		setCustomValidity(t('You cannot leave the name empty.'))
		return
	}

	if (nickname.length < 2) {
		// Show error if the nickname is too short
		setCustomValidity(t('Please enter a name with at least 2 characters.'))
		return
	}

	try {
		// Set the nickname
		setGuestNickname(nickname)
	} catch (error) {
		logger.error('Failed to set nickname', { error })
		showError(t('Failed to set nickname.'))
		inputElement.value!.focus()
		return
	}

	// Set the dialog as shown
	storage.setItem('public-auth-prompt-shown', 'true')

	// Close the dialog
	emit('close', name.value)
}

/**
 * Set custom validity message on the input
 *
 * @param message - The validity message
 */
function setCustomValidity(message: string) {
	if (inputElement.value) {
		// @ts-expect-error -- not exposed by the library but exists (todo: fix in vue library)
		inputElement.value.setCustomValidity(message)
		// @ts-expect-error -- not exposed by the library but exists (todo: fix in vue library)
		inputElement.value.reportValidity()
		inputElement.value.focus()
	}
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
		<NcNoteCard
			class="public-auth-prompt__header"
			:text="defaultNotice"
			type="info" />

		<!-- Form -->
		<NcTextField
			ref="input"
			v-model="name"
			class="public-auth-prompt__input"
			data-cy-public-auth-prompt-dialog-name
			:label="t('Name')"
			:placeholder="t('Enter your name')"
			:required="!cancellable"
			minlength="2"
			maxlength="64"
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
