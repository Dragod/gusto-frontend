// store.js
import { writable } from 'svelte/store';

export const selectedBusinessId = writable(1);

/**
 * Sets the selected business ID.
 * @param {number} id - The ID of the business to be selected.
 */
export function selectBusinessId(id) {
	selectedBusinessId.set(Number(id));
}
