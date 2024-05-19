<script lang="jsdoc">
	/**
	 * Component for sorting list based on different criteria.
	 *
	 * @component SortBy
	 * @example
	 * <SortBy />
	 */
	import { sortBy, activeSort } from '../store/sortBy';
	//{ sortType: 'highestPrice', label: 'Highest price' },
	//{ sortType: 'lowestPrice', label: 'Lowest price' },
	const buttons = [
		{ sortType: 'default', label: 'Category' },
		{ sortType: 'isPizza', label: 'Is pizza' },
		{ sortType: 'newTag', label: 'NEW tag' },
		{ sortType: 'cerTag', label: 'CER tag' },
		{ sortType: 'surTag', label: 'SUR tag' },
		{ sortType: 'nameAsc', label: 'Name asc' },
		{ sortType: 'nameDesc', label: 'Name desc' }
	];
</script>

<label class="pb-2 text-sm font-medium text-gray-700" for="sort">Sort by</label>
<div class="flex flex-row">
	{#each buttons as { sortType, label }}
		<button
			class={`mr-4 px-2 py-1 ${
				$activeSort === sortType ? 'bg-green-500' : 'bg-blue-500'
			} text-white rounded`}
			on:click={() => sortBy(sortType)}>{label}</button
		>
	{/each}
</div>

<style></style>
