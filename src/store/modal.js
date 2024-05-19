import { writable } from 'svelte/store';

const initialState = {
	isOpen: false,
	title: '',
	message: '',
	yesCallback: () => {},
	noCallback: () => {}
};

const modalStore = writable({ ...initialState });

/**
 * @param {string} title
 * @param {string} message
 * @param {() => void} yesCallback
 * @param {() => void} noCallback
 * @returns {void}
 * @description
 * Opens the modal and sets the title, message, and callbacks.
 * The callbacks are optional.
 * @example
 * openModal('Delete Category', 'Are you sure you want to delete this category?', () => {
 *    // Delete the category
 * }, () => {
 *   // Do nothing
 * });
 *
 */
function openModal(title, message, yesCallback = () => {}, noCallback = () => {}) {
	modalStore.set({
		isOpen: true,
		title,
		message,
		yesCallback,
		noCallback
	});
}

function closeModal() {
	modalStore.set({ ...initialState });
}

export { modalStore, openModal, closeModal };
