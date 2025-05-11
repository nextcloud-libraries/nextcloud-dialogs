<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcDialog :buttons="dialogButtons"
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

<script lang="ts">
import { defineComponent } from 'vue'
import { getBuilder } from '@nextcloud/browser-storage'
import { setGuestNickname } from '@nextcloud/auth'
import { showError } from '@nextcloud/dialogs'

import NcButton from '@nextcloud/vue/components/NcButton'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcTextField from '@nextcloud/vue/components/NcTextField'

import { t } from '../utils/l10n.ts'

const storage = getBuilder('public').build()

export default defineComponent({
	name: 'PublicAuthPrompt',

	components: {
		NcDialog,
		NcNoteCard,
		NcTextField,
	},

	props: {
		/**
		 * Preselected nickname
		 * @default '' No name preselected by default
		 */
		nickname: {
			type: String,
			default: '',
		},

		/**
		 * Dialog title
		 */
		title: {
			type: String,
			default: t('Guest identification'),
		},

		/**
		 * Dialog text under the dialog title
		 * e.g 'Enter your name to access the file'
		 * @default '' Not shown by default
		 */
		 text: {
			type: String,
			default: '',
		},

		/**
		 * Dialog notice
		 * @default 'You are currently not identified.'
		 */
		notice: {
			type: String,
			default: t('You are currently not identified.'),
		},

		/**
		 * Dialog submit button label
		 * @default 'Submit name'
		 */
		submitLabel: {
			type: String,
			default: t('Submit name'),
		},

		/**
		 * Whether the dialog is cancellable
		 * @default false
		 */
		cancellable: {
			type: Boolean,
			default: false,
		},
	},

	setup() {
		return {
			t,
		}
	},

	emits: ['close'],

	data() {
		return {
			name: '',
		}
	},

	computed: {
		dialogButtons() {
			const cancelButton = {
				label: t('Cancel'),
				variant: 'tertiary',
				callback: () => this.$emit('close'),
			}

			const submitButton = {
				label: this.submitLabel,
				type: 'submit',
				variant: 'primary',
			}

			// If the dialog is cancellable, add a cancel button
			if (this.cancellable) {
				return [cancelButton, submitButton]
			}

			return [submitButton]
		},
	},

	watch: {
		/** Reset name to pre-selected nickname (e.g. Talk / Collabora ) */
		nickname: {
			handler() {
				this.name = this.nickname
			},
			immediate: true,
		},
	},

	methods: {
		onSubmit() {
			const input = this.$refs.input as HTMLInputElement
			const nickname = this.name.trim()

			if (nickname === '') {
				// Show error if the nickname is empty
				input.setCustomValidity(t('You cannot leave the name empty.'))
				input.reportValidity()
				input.focus()
				return
			}

			if (nickname.length < 2) {
				// Show error if the nickname is too short
				input.setCustomValidity(t('Please enter a name with at least 2 characters.'))
				input.reportValidity()
				input.focus()
				return
			}

			try {
				// Set the nickname
				setGuestNickname(nickname)
			} catch (e) {
				showError(t('Failed to set nickname.'))
				console.error('Failed to set nickname', e)
				input.focus()
				return
			}

			// Set the dialog as shown
			storage.setItem('public-auth-prompt-shown', 'true')

			// Close the dialog
			this.$emit('close', this.name)
		},
	},
})
</script>
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
