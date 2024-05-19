<!-- <script>
	import { onMount } from 'svelte';

	/** @type {Array<{id: number, name: string, description: string, category_id: number, price: number, is_pizza: number, category_name: string, tags: string}>} */
	let menu = [];
	/** @type {null | string} */
	let error = null;

	onMount(async () => {
		try {
			const response = await fetch('http://localhost:5000/data/admin/menu?business=2');
			if (response.ok) {
				menu = await response.json();
			} else {
				error = `Failed to fetch menu: ${response.statusText}`;
			}
		} catch (err) {
			/** @type {Error} */
			const errorObj = err;
			error = `Failed to fetch menu: ${errorObj.message}`;
		}
	});

	/**
	 * Format tags string
	 * @param {string} tags
	 * @returns {string}
	 */
	function formatTags(tags) {
		return tags
			? tags
					.split(',')
					.map((tag) => tag.trim())
					.join(', ')
			: '';
	}
</script>

<div class="menu-container">
	{#if error}
		<div class="error">{error}</div>
	{:else}
		{#each menu as item}
			<div class="menu-item">
				<h3>{item.name}</h3>
				<p>{item.description}</p>
				<p><strong>Price:</strong> ${item.price}</p>
				<p><strong>Category:</strong> {item.category_name}</p>
				<p class="tags"><strong>Tags:</strong> {formatTags(item.tags)}</p>
			</div>
		{/each}
	{/if}
</div>

<style>
	.menu-container {
		@apply m-8 p-4 bg-white shadow-lg rounded-md;
	}
	.menu-item {
		@apply my-4 p-4 border rounded shadow-md bg-gray-50;
	}
	.menu-item h3 {
		@apply text-lg font-bold mb-2;
	}
	.tags {
		@apply text-sm text-gray-500 italic;
	}
	.error {
		@apply text-red-500 text-lg;
	}
</style> -->

<script>
	import { onMount } from 'svelte';

	// State variables
	let menu = [];
	let groupedMenu = {};
	let categories = [];
	let error = null;

	// Perform API call on component mount
	onMount(async () => {
		try {
			const response = await fetch('http://localhost:5000/data/admin/menu?business=1');
			if (response.ok) {
				menu = await response.json();
				groupMenuByCategory(menu);
			} else {
				error = `Failed to fetch menu: ${response.statusText}`;
			}
		} catch (err) {
			error = `Failed to fetch menu: ${err.message}`;
		}
	});

	// Group menu items by their category and get category names
	function groupMenuByCategory(menu) {
		(groupedMenu = menu.reduce((acc, item) => {
			if (!acc[item.category_name]) {
				acc[item.category_name] = [];
				categories.push(item.category_name);
			}
			acc[item.category_name].push(item);
			return acc;
		}, {})),
			// Ensure categories array is populated after grouping
			(categories = Object.keys(groupedMenu));
		console.log('Categories:', categories); // Debugging line to check categories
	}

	// Function to format tags
	function formatTags(tags) {
		return tags
			? tags
					.split(',')
					.map((tag) => tag.trim())
					.join(', ')
			: '';
	}

	// Scroll to category
	function scrollToCategory(category) {
		const categoryElement = document.getElementById(category);
		if (categoryElement) {
			categoryElement.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function filteredMenuByCategory() {
		if (!sortInput) {
			return groupedMenu;
		}
		const filtered = Object.keys(groupedMenu).reduce((acc, key) => {
			const filteredItems = groupedMenu[key].filter((item) =>
				item.name.toLowerCase().includes(sortInput.toLowerCase())
			);
			if (filteredItems.length) {
				acc[key] = filteredItems;
			}
			return acc;
		}, {});
		return filtered;
	}
</script>

<div class="container h-full flex overflow-hidden">
	<div class="sidebar">
		<h1 class="text-xl font-bold mb-4">Categories</h1>
		<ul class="category-quick-link">
			{#each categories as category}
				<li>
					<button class="text-blue-500 hover:underline" on:click={() => scrollToCategory(category)}>
						{category}
					</button>
				</li>
			{/each}
		</ul>
	</div>
	<div class="menu-container overflow-auto flex-grow">
		{#if error}
			<div class="error">{error}</div>
		{:else}
			{#each Object.keys(groupedMenu) as category}
				<div id={category} class="category-section">
					<h2 class="category-header">{category}</h2>
					{#each groupedMenu[category] as item}
						<div class="menu-item">
							<h3>{item.name}</h3>
							<p>{item.description}</p>
							<p>€ {item.price}</p>
							<!-- <p><strong>Category:</strong> {item.category_name}</p> -->
							{#if item.tags && item.tags.length > 0}
								<hr class="mt-1" />
								<p class="tags pt-2">{formatTags(item.tags)}</p>
							{:else}
								<hr class="mt-1" />
								<p class="tags pt-2">-</p>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.container {
		@apply flex;
	}
	.sidebar {
		@apply w-1/4 p-4 mt-4 mb-4 ml-4 mr-4 bg-gray-50 shadow-lg rounded-md sticky top-0;
		align-self: self-start;
	}
	.menu-container {
		@apply w-3/4 mt-4 mb-4 ml-4 mr-4 p-8 bg-white shadow-lg rounded-md overflow-y-auto;
	}
	.category-header {
		@apply text-4xl font-bold mb-4;
	}
	.menu-item {
		@apply my-4 p-4 border rounded shadow-md bg-gray-50;
	}
	.menu-item p {
		@apply pb-2;
	}
	.menu-item h3 {
		@apply text-lg font-bold mb-2;
		color: #000;
	}
	.tags {
		@apply text-sm text-gray-500 italic;
	}
	.error {
		@apply text-red-500 text-lg;
	}
	h1,
	h2 {
		color: #ea3b62;
	}
	.category-quick-link button {
		/* color: #88d8c0; */
		color: #000;
	}
	.menu-container::-webkit-scrollbar {
		width: 5px;
	}
	.menu-container::-webkit-scrollbar-track {
		background: #f1f1f1;
	}
	.menu-container::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 20px;
	}
	.menu-container::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
