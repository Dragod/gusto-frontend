<script lang="jsdoc">
	import { onMount } from 'svelte';
	import { toasts } from 'svelte-toasts';
	import schema from '../validation/insert-dish';
	/**
	 * @type {{name: string, description: string, price: number | null, is_pizza: string, tags: string[], categoryName: string, businessId: number}}
	 */
	let dish = {
		name: '',
		description: '',
		price: null,
		is_pizza: '0',
		tags: [],
		categoryName: '',
		businessId: 1
	};

	// Convert the business ID to a string so that it is passed as default value to the radio buttons
	let businessIdString = dish.businessId.toString();

	// When the form is submitted, convert businessIdString back to a number and assign it to dish.businessId
	function handleSubmit() {
		dish.businessId = Number(businessIdString);
	}

	/**
	 * @typedef {Object} Errors
	 * @property {string} name
	 * @property {string} description
	 * @property {string} price
	 * @property {string} is_pizza
	 * @property {string} tags
	 * @property {string} categoryName
	 * @property {string} businessId
	 * @property {string} categoryId
	 */

	/** @type {Errors} */
	let errors = {
		name: '',
		description: '',
		price: '',
		is_pizza: '',
		tags: '',
		categoryName: '',
		businessId: '',
		categoryId: ''
	};

	/**
	 * @type {any[]}
	 */
	let categories = [];

	/**
	 * @type {Array<{category_name: string}>}
	 */
	let catData = [];

	/**
	 * @param {number} businessId
	 * @returns {Promise<void>}
	 */
	async function getBusinessCategories(businessId) {
		const response = await fetch(
			`http://localhost:5000/data/admin/business_categories?business=${businessId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		catData = await response.json(); // Assign the fetched data to catData
		categories = catData.map((item) => item.category_name);
		//console.log('Categories:', categories);
	}

	/**
	 * @param {string} categoryName
	 */
	async function getCatId(categoryName) {
		//console.log('Category name:', categoryName);
		try {
			const response = await fetch(
				`http://localhost:5000/data/admin/catIdFromCatName?category_name=${encodeURIComponent(
					categoryName
				)}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const catId = await response.json();
			//console.log('Category id:', catId);
			return catId[0].id.toString();
		} catch (error) {
			//console.error('Failed to fetch category ID:', error);
			toasts.error({
				title: 'Insert dish',
				description: 'Category name not selected. Please, make sure you selected a category.',
				type: 'error',
				duration: 6000,
				placement: 'bottom-center'
			});
			return null;
		}
	}

	$: {
		if (dish.categoryName) {
			getCatId(dish.categoryName);
		}
	}

	$: console.log('Business ID:', businessIdString);

	// Reactive statement that watches for changes in dish.businessId
	$: {
		if (dish.businessId) {
			getBusinessCategories(dish.businessId);
		}
	}

	onMount(() => {
		dish.businessId = 1;
		getBusinessCategories(dish.businessId);
	});

	async function insertDish() {
		const categoryId = await getCatId(dish.categoryName);

		// Create a new object with the dish data and the category ID
		const dishToInsert = { ...dish, categoryId: categoryId };

		console.log('Sending payload:', dishToInsert);

		// Clear the errors object
		for (let key in errors) {
			const errorKey = /** @type {keyof Errors} */ (key);
			errors[errorKey] = '';
		}

		// Validate the dishToInsert object
		const { error } = schema.validate(dishToInsert, { abortEarly: false });
		if (error) {
			console.error('Validation error:', error.details[0].message);

			// Create a new errors object with all error messages
			const newErrors = error.details.reduce((acc, detail) => {
				const errorField = detail.path[0]; // Get the field that caused the error
				acc[/** @type {keyof Errors} */ (errorField)] = detail.message; // Set the error message for that field
				return acc;
			}, /** @type {Errors} */ ({}));

			errors = newErrors; // Assign the new errors object to errors
			console.log('Errors:', errors);
		}

		const response = await fetch('http://localhost:5000/data/admin/menu', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(dishToInsert)
		});

		if (response.ok) {
			toasts.success({
				title: 'Insert dish',
				description: 'Dish inserted successfully.',
				type: 'info',
				duration: 6000,
				placement: 'bottom-center'
			});
			// Reset the dish object
			dish = {
				name: '',
				description: '',
				price: null,
				is_pizza: '0',
				tags: [],
				categoryName: '',
				businessId: 0
			};
		} else {
			console.error('Failed to insert dish');
			toasts.error({
				title: 'Insert dish',
				description:
					'Failed to insert dish. Please, make sure you filled all the fields correctly.',
				type: 'error',
				duration: 6000,
				placement: 'bottom-center'
			});
		}
	}

	$: console.log(errors); // This will run whenever the errors object changes

	/**
	 * An array of tags. Each tag is an object with an `id` and a `tag_name`.
	 * @type {Array<{id: number, tag_name: string}>}
	 */
	let tags = [];

	async function getTags() {
		const response = await fetch('http://localhost:5000/data/admin/tags', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		tags = await response.json();
		//console.log('Tags:', tags);
	}

	$: {
		getTags();
	}
</script>

<div class="flex flex-col overflow-auto">
	<h1 class="text-2xl font-bold text-gray-800 mb-4 mr-10 p-1">Insert dish</h1>
	<form
		class="flex-grow overflow-auto mb-6 h-full"
		on:submit|preventDefault={() => {
			insertDish();
			handleSubmit();
		}}
	>
		<label for="business_id" class="block text-sm font-medium text-gray-700 mb-4"
			>Business location</label
		>
		<label class="flex items-center mb-3 cursor-pointer">
			<input
				id="business_id_senigallia"
				bind:group={businessIdString}
				type="radio"
				value="1"
				checked
				class="appearance-none h-6 w-6 rounded-full border border-gray-200 checked:border-transparent checked:bg-blue-600 focus:outline-none"
			/>
			<span class="ml-2">Senigallia</span>
		</label>

		<label class="flex items-center mb-3 cursor-pointer">
			<input
				id="business_id_trecastelli"
				bind:group={businessIdString}
				type="radio"
				value="2"
				class="appearance-none h-6 w-6 rounded-full border border-gray-200 checked:border-transparent checked:bg-blue-600 focus:outline-none"
			/>
			<span class="ml-2">Trecastelli</span>
		</label>

		<label for="dish" class="block text-sm font-medium text-gray-700">Name</label>
		<input
			id="dish"
			bind:value={dish.name}
			type="text"
			placeholder="Name of dish"
			class="p-2 mt-1 block w-full border rounded"
		/>
		{#if errors.name}
			<small class="text text-rose-600">{errors.name}</small>
		{/if}
		<label for="description" class="block text-sm font-medium text-gray-700 mt-3">Description</label
		>
		<input
			id="description"
			bind:value={dish.description}
			type="text"
			placeholder="Description of dish"
			class="p-2 mt-1 block w-full border rounded"
		/>
		{#if errors.description}
			<small class="text text-rose-600">{errors.description}</small>
		{/if}
		<label for="price" class="block text-sm font-medium text-gray-700 mt-3">Price</label>
		<input
			id="price"
			bind:value={dish.price}
			type="number"
			placeholder="Price you want to sell the dish for (€)"
			class="p-2 mt-1 block w-full border rounded"
		/>
		{#if errors.price}
			<small class="text text-rose-600">{errors.price}</small>
		{/if}
		<label for="category_id" class="block text-sm font-medium text-gray-700 mt-3"
			>Category name</label
		>
		<select
			bind:value={dish.categoryName}
			id="category_id"
			class="p-2 mt-1 block w-full border rounded"
		>
			<option value="">Select a category</option>
			{#each categories as category}
				<option value={category}>{category}</option>
			{/each}
		</select>
		{#if errors.categoryName}
			<small class="text text-rose-600">{errors.categoryName}</small>
		{/if}
		<label for="is_pizza" class="block text-sm font-medium text-gray-700 mb-4 mt-3"
			>Is this new dish a pizza?</label
		>
		<label class="flex items-center mb-3 cursor-pointer">
			<input
				id="is_pizza_no"
				bind:group={dish.is_pizza}
				type="radio"
				value="0"
				class="appearance-none h-6 w-6 rounded-full border border-gray-200 checked:border-transparent checked:bg-blue-600 focus:outline-none"
			/>
			<span class="ml-2">No</span>
		</label>
		<label class="flex items-center mb-3 cursor-pointer">
			<input
				id="is_pizza_yes"
				bind:group={dish.is_pizza}
				type="radio"
				value="1"
				class="appearance-none h-6 w-6 rounded-full border border-gray-200 checked:border-transparent checked:bg-blue-600 focus:outline-none"
			/>
			<span class="ml-2">Yes</span>
		</label>
		<label for="tags" class="mt-3 mb-4 block text-sm font-medium text-gray-700"
			>Tags (optional)</label
		>
		{#each tags as tag (tag.id)}
			<label class="flex items-center mb-3 cursor-pointer">
				<input
					id={`category_id_${tag.tag_name}`}
					type="checkbox"
					value={tag.id}
					bind:group={dish.tags}
					class="appearance-none bg-white bg-check h-6 w-6 border border-gray-200 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none"
				/>
				<span class="ml-2">{tag.tag_name}</span>
			</label>
		{/each}
		<hr class="border-t-2 mt-8 border-gray-200 p-1" />
		<button
			type="submit"
			class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded block mt-6"
			>Insert new</button
		>
	</form>
</div>

<style>
	.bg-check {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z' fill='%23fff'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}
</style>
