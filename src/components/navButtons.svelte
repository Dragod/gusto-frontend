<script lang="jsdoc">
	/**
	 * @component navButtons
	 * @description
	 *  Component that renders the navigation buttons for the app.
	 *  This component is used in the header component.
	 * @example
	 *  <navButtons />
	 */

	import { refreshStore } from '../store/refreshMenu';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let activeButton = 'updateMenu';
	/**
	 * @type {any[]}
	 */
	let data = [];

	async function fetchData() {
		try {
			const response = await fetch('http://localhost:5000/data/admin/menu');
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			data = await response.json();
		} catch (error) {
			console.error(error);
		}
	}

	async function handleRefresh() {
		refreshStore.set(true);
		await fetchData();
		dispatch('sort');
	}

	const buttons = [
		{ state: 'updateMenu', label: 'Menu', refresh: true },
		{ state: 'addDish', label: 'Insert New', refresh: false },
		{ state: 'addRemoveCategory', label: 'Categories', refresh: false },
		{ state: 'tags', label: 'Tags', refresh: false },
		{ state: 'updateBusiness', label: 'Business', refresh: false }
	];
</script>

{#each buttons as { state, label, refresh }}
	<button
		class="text-gray-800 mb-4 pt-4 hover:underline {activeButton === state
			? 'text-green-500 underline '
			: ''}"
		on:click={() => {
			activeButton = state;
			if (refresh) handleRefresh();
		}}
	>
		{label}
	</button>
	<p class="px-2">|</p>
{/each}
