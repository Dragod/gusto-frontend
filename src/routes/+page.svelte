<script lang="jsdoc">
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import schema from '../validation/update-dish';
	import NavButtons from '../components/navButtons.svelte';
	import InsertDish from '../components/insertDish.svelte';
	import Business from '../components/business.svelte';
	import SortBy from '../components/sortBy.svelte';
	import Categories from '../components/categories.svelte';
	import Tags from '../components/tags.svelte';
	import Modal from '../components/modal.svelte';
	import { openModal } from '../store/modal';
	import { dataSort, selectedBusiness, sortBy } from '../store/sortBy';
	import { refreshStore } from '../store/refreshMenu';

	let activeButton = 'updateMenu';

	let tagInput = '';

	/**
	 *  @type {Array<{tag_name: string}>}
	 */

	let availableTags = [];

	/**
	 * @type {any}
	 */
	let selectedTags = [];

	/**
	 * @type {any}
	 */
	let errors = {};

	/**
	 * @type {any[]}
	 */
	let data = [];

	// Subscribe to dataSort, this is needed to show the data when editing a dish since we now use a store.
	dataSort.subscribe((value) => {
		data = [...value];
	});

	/**
	 * @type {any}
	 */
	let editingId = null;

	/**
	 * @type {{ name: string, description: string, is_pizza: string, price: number, tags: string } | null}
	 */
	let originalData = null;

	let updatedData = {
		name: '',
		description: '',
		is_pizza: '',
		price: '',
		category_id: 0,
		category_name: '',
		tags: ''
	};

	let showError = false;

	let isLoading = false;

	async function getMenu() {
		try {
			/**
			 * @type {any[]}
			 */
			const menu = await sortBy('default');
			updatedData.category_id = menu[0].category_id;
			console.log('menu', menu);
			console.log('updatedData.category_id', updatedData.category_id);
			console.log(
				'category_id of all items:',
				menu.map((item) => item.category_id)
			);
		} catch (error) {
			console.error(error);
		}
	}

	// Call getMenu whenever selectedBusiness changes
	$: selectedBusiness;

	/**
	 * @param {number} businessId
	 */

	async function selectBusiness(businessId) {
		selectedBusiness.set(businessId); // Set the selected business
		await sortBy('default'); // Reset the sort by to default
		await getMenu(); // Get the menu for the selected business
	}

	async function fetchData() {
		try {
			const response = await fetch('http://localhost:5000/data/admin/menu');
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			data = await response.json();
			console.log('Updated data:', data);
			refreshStore.set(false);
		} catch (error) {
			console.error(error);
		}
	}

	$: {
		if ($refreshStore) {
			fetchData();
		}
	}

	let filter = '';

	$: filteredData = data.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));

	// Whenever dataSort or filter changes, update filteredData
	$: {
		if ($dataSort.length > 0) {
			//console.log('Current dataSort:', $dataSort);
			filteredData = $dataSort.filter((item) =>
				item.name.toLowerCase().includes(filter.toLowerCase())
			);
		} else {
			//console.log('Current filter:', filter);
			filteredData = data.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
		}
	}

	/**
	 * Handles the change event of the tag select element.
	 * @param {Event} event - The change event.
	 */
	function handleTagChange(event) {
		const selectElement = event.target;
		if (selectElement && 'selectedOptions' in selectElement) {
			// @ts-ignore
			selectedTags = Array.from(selectElement.selectedOptions, (option) => option.value);
		}
	}

	$: selectedTags = (tagInput || '')
		.split(',')
		.map(
			/**
			 * Trims whitespace from each tag.
			 * @param {string} tag - The tag.
			 * @returns {string} The tag with whitespace trimmed.
			 */
			(tag) => tag.trim()
		)
		.filter((tag) => availableTags.some((availableTag) => availableTag.tag_name === tag));

	onMount(async () => {
		await getMenu();
		const response = await fetch('http://localhost:5000/data/admin/tags');
		const data = await response.json();

		availableTags = data.map(
			/**
			 * Maps a tag object to its name.
			 * @param {{tag_name: string}} tag - The tag object.
			 * @returns {string} The name of the tag.
			 */
			(tag) => tag.tag_name
		);
	});

	/**
	 * @param {number} id
	 * @param {number} businessId
	 */
	async function startEditing(id, businessId) {
		categoryNames = await fetchCategoryData();
		showError = false;
		const dish = data.find((item) => item.id === id);
		console.log('dish', dish);
		editingId = id;
		originalData = { ...dish, businessId };
		updatedData = { ...dish, businessId };
		tagInput = dish.tags;
	}

	/**
	 * @type {any[]}
	 */
	let categoryData = [];

	/**
	 * @type {any[]}
	 */
	let categoryNames = [];

	// Fetch categories and set category_id to the id of the first category
	selectedBusiness.subscribe(() => {
		fetchCategoryData().then((categories) => {
			if (categories.length > 0) {
				updatedData.category_id = categories[0].id;
			}
		});
	});

	/**
	 * @param {string} newTagsString
	 */
	function updateTags(newTagsString) {
		updatedData = { ...updatedData, tags: newTagsString };
	}

	async function stopEditing() {
		categoryNames = await fetchCategoryData();
		console.log('PATCH request body:', updatedData);

		try {
			if (editingId === null) {
				console.error('stopEditing was called before startEditing');
				return;
			}

			if (JSON.stringify(originalData) === JSON.stringify(updatedData)) {
				console.log('No changes detected, not sending PATCH request');
			} else {
				/**Reset errors*/
				errors = {};

				const { error } = await schema.validateAsync(updatedData, { abortEarly: false });

				if (error) {
					console.log('error', error);
					console.log('updatedData', updatedData);
					error.details.forEach((detail) => {
						errors[detail.path[0]] = detail.message;
					});

					showError = true;

					throw new Error('Validation error');
				} else {
					errors = {};
					showError = false;

					const response = await fetch(`http://localhost:5000/data/admin/menu/${editingId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(updatedData)
					});

					console.log('response', response);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					} else {
						console.log('Menu changes saved successfully');
					}

					console.log('updatedData', updatedData);
					console.log('originalData', originalData);
					console.log('updatedData.price', updatedData.price);

					// If price is part of the updated data, make a separate request to update it
					if ('price' in updatedData) {
						const priceResponse = await fetch(
							`http://localhost:5000/data/admin/business_menu/${$selectedBusiness}/${editingId}`,
							{
								method: 'PATCH',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({ price: updatedData.price })
							}
						);

						console.log('priceResponse', priceResponse);

						if (!priceResponse.ok) {
							throw new Error(`HTTP error! status: ${priceResponse.status}`);
						} else {
							console.log('Price changes saved successfully');
						}
					}

					toasts.success({
						title: 'Success',
						description: 'Changes saved.',
						type: 'success',
						duration: 6000,
						placement: 'bottom-center'
					});

					//Refresh data
					await getMenu();
					await fetchCategoryData();
				}
			}

			editingId = null;
			updatedData = {
				name: '',
				description: '',
				is_pizza: '',
				price: '',
				category_id: 0,
				category_name: '',
				tags: ''
			};
			originalData = null;
		} catch (error) {
			console.error('Could not save changes, validation error/s.', error);
			let errorMessage =
				"Could not save changes, please make sure you're inserting the correct data.";
			if (error.name === 'ValidationError') {
				errorMessage = error.details.map((e) => e.message).join(', ');
			}
			toasts.error({
				title: 'Validation Error',
				description: errorMessage,
				type: 'warning',
				duration: 6000,
				placement: 'bottom-center'
			});
		}
	}

	/**
	 * @param {number} delete_id
	 */
	async function deleteDish(delete_id) {
		const response = await fetch(`http://localhost:5000/data/admin/menu/${delete_id}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			// Refresh the list after successful delete
			await getMenu();
		} else {
			console.error('Failed to delete dish');
			toasts.error({
				title: 'Delete dish',
				description: 'Failed to delete dish.',
				type: 'error',
				duration: 6000,
				placement: 'bottom-center'
			});
		}
	}

	/**
	 * @param {number} id
	 * @param {string} name
	 * @description Can't use string literal in conjunction with @html also <strong> tag "/" is escaped or it thinks it's a regular expression
	 */
	async function deleteItem(id, name) {
		openModal(
			`Delete dish - ${name}`,
			'Are you sure you want to <strong>delete' +
				'<' +
				'/strong> dish, <strong>' +
				name +
				'<' +
				'/strong>?',
			() => {
				// Code to delete the item goes here
				deleteDish(id);
				toasts.success({
					title: 'Delete dish',
					description: `Dish deleted successfully, ${name}`,
					type: 'success',
					duration: 6000,
					placement: 'bottom-center'
				});
			},
			() => {
				toasts.info({
					title: 'Delete cancelled',
					description: `Dish, ${name}, not deleted.`,
					type: 'info',
					duration: 6000,
					placement: 'bottom-center'
				});
			}
		);
	}

	$: {
		//console.log('selectBusiness', $selectedBusiness);
	}

	async function fetchCategoryData() {
		isLoading = true;
		try {
			const response = await fetch(
				`http://localhost:5000/data/admin/category-by-business/${$selectedBusiness}`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			categoryData = await response.json();
		} catch (error) {
			console.error('Failed to fetch category data:', error);
		} finally {
			isLoading = false;
		}
		return categoryData;
	}

	$: {
		(async () => {
			categoryNames = await fetchCategoryData();
		})();
	}

	/**
	 * @type {any}
	 */
	let selectedCategory;

	/**
	 * Updates the category name in updatedData based on the selected category ID.
	 *
	 * @param {Event} event - The event object from the select element's change event.
	 */
	function updateCategoryName(event) {
		if (event.target instanceof HTMLSelectElement) {
			const selectedCategoryName = event.target.value;
			//console.log('selectedCategoryName:', selectedCategoryName); // Log selectedCategoryName

			const selectedCategory = categoryNames.find(
				(category) => category.category_name === selectedCategoryName
			);
			//console.log('selectedCategory:', selectedCategory); // Log selectedCategory
			//console.log('selectedCategory.category_id:', selectedCategory?.category_id); // Log selectedCategory.category_id

			if (selectedCategory) {
				updatedData.category_id = selectedCategory.category_id;
				//console.log('updatedData.category_id:', updatedData.category_id); // Log updatedData.category_id
			}
		}
	}

	async function handleSortEvent() {
		await sortBy('default');
	}
</script>

<Modal />

<!-- Toaster -->
<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer>

<div class="flex flex-col h-screen min-w-full p-6 pt-4 bg-slate-50">
	<header class="flex flex-row">
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 233 233"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			xml:space="preserve"
			style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
			class="w-12 h-12"
		>
			<g transform="matrix(1,0,0,1,-304.779,-157.842)">
				<g transform="matrix(1,0,0,1,343.353,312.536)">
					<path
						d="M0,-76.933C0,-98.57 17.54,-116.11 39.177,-116.11C60.813,-116.11 78.353,-98.57 78.353,-76.933C78.353,-55.296 60.813,-37.756 39.177,-37.756C17.54,-37.756 0,-55.296 0,-76.933M38.743,39.103C38.743,60.459 56.056,77.761 77.411,77.761L77.411,0.828L116.418,0.828C137.734,0.828 155.015,-16.44 155.015,-37.756L106.356,-37.756C113.08,-49.261 116.938,-62.646 116.938,-76.933C116.938,-77.028 116.934,-77.122 116.934,-77.216L155.112,-77.216C176.455,-77.216 193.758,-94.621 193.758,-115.965L106.442,-115.965C92.976,-139.123 67.896,-154.694 39.177,-154.694C-3.77,-154.694 -38.575,-119.879 -38.575,-76.933L-38.575,1.277C-38.575,22.633 -21.263,39.926 0.093,39.926L0.083,-9.748C11.473,-3.092 24.617,0.748 38.743,0.824L38.743,39.103Z"
						style="fill:rgb(255,36,120);fill-rule:nonzero;"
					/>
				</g>
			</g>
		</svg>
		<h1 class="text-4xl font-bold text-gray-800 pl-5 p-1">Pfcode Admin</h1>
	</header>

	<div class="flex flex-row items-center p-1">
		<NavButtons bind:activeButton on:sort={handleSortEvent} />
	</div>

	<hr class="border-t-2 border-gray-200 p-1" />
	{#if activeButton === 'updateMenu'}
		<div class="update-menu flex flex-col overflow-auto">
			<h1 class="text-2xl font-bold text-gray-800 mb-4 mr-10 p-1">Menu</h1>
			<div class="flex flex-col pb-6">
				<label for="business" class="pb-2 text-sm font-medium text-gray-700">Business</label>
				<div class="flex flex-row">
					<button
						class={`mr-4 px-2 py-1 rounded ${
							$selectedBusiness === 1 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
						}`}
						on:click={() => selectBusiness(1)}
						type="button">Senigallia</button
					>
					<button
						class={`mr-4 px-2 py-1 rounded ${
							$selectedBusiness === 2 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
						}`}
						on:click={() => selectBusiness(2)}
						type="button">Trecastelli</button
					>
				</div>
			</div>
			<div class="flex flex-col pb-6">
				<SortBy />
			</div>
			<label for="filter" class="block text-sm font-medium text-gray-700">Filter list</label>
			<input
				id="filter"
				type="text"
				bind:value={filter}
				placeholder="Filter by name"
				class="p-2 mt-1 mb-6 block w-full border rounded"
			/>
			<div class="flex-grow overflow-auto mb-6 h-full scrollbar">
				<div class="grid grid-cols-12 gap-1 w-full">
					<div class="col-start-1 col-span-2 bg-gray-300 p-2 sticky top-0 font-bold">Name</div>
					<div class="col-start-3 col-span-3 bg-gray-300 p-2 sticky top-0 font-bold">
						Description
					</div>
					<div class="col-start-6 col-span-2 bg-gray-300 p-2 sticky top-0 font-bold">Category</div>
					<div class="col-start-8 col-span-2 bg-gray-300 p-2 sticky top-0 font-bold">Tags</div>
					<div class="col-start-10 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">
						Price - €
					</div>
					<div class="col-start-11 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Is pizza</div>
					<div class="col-start-12 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Actions</div>
					{#each filteredData as item, index (index)}
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-2 p-2 `}>
							{#if editingId === item.id}
								<input
									type="text"
									class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
									bind:value={updatedData.name}
									placeholder="Name"
								/>
								{#if showError && errors.name}
									<small class="text text-rose-600">{errors.name}</small>
								{/if}
							{:else}
								{item.name}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-3 p-2 `}>
							{#if editingId === item.id}
								<input
									type="text"
									class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
									bind:value={updatedData.description}
									placeholder="Description"
								/>
								{#if showError && errors.description}
									<small class="text text-rose-600">{errors.description}</small>
								{/if}
							{:else}
								{item.description}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-2 p-2 `}>
							{#if editingId === item.id}
								<select
									bind:value={updatedData.category_name}
									on:change={updateCategoryName}
									class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
								>
									{#each categoryNames as category, i (i)}
										<option value={category.category_name}>{category.category_name}</option>
									{/each}
								</select>
							{:else}
								{item.category_name}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-2 p-2 `}>
							{#if editingId === item.id}
								<input
									type="text"
									placeholder="Tag1, Tag2, Tag3"
									bind:value={tagInput}
									on:input={/** @param {InputEvent & { target: HTMLInputElement }} e */ (e) =>
										updateTags(e.target.value)}
									class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
								/>
								{#if showError && errors.tags}
									<small class="text text-rose-600">{errors.tags}</small>
								{/if}
							{:else if item.tags == null}
								No tags
							{:else}
								{item.tags.replace(/,/g, ', ')}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-1 p-2 `}>
							{#if editingId === item.id}
								<input
									type="number"
									class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
									bind:value={updatedData.price}
									placeholder="Price"
								/>
								{#if showError && errors.price}
									<small class="text text-rose-600">{errors.price}</small>
								{/if}
							{:else}
								{item.price}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-1 p-2 `}>
							{#if editingId === item.id}
								<input
									type="number"
									class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
									bind:value={updatedData.is_pizza}
									placeholder="Is pizza"
								/>
								{#if showError && errors.is_pizza}
									<small class="text text-rose-600">{errors.is_pizza}</small>
								{/if}
							{:else}
								{item.is_pizza}
							{/if}
						</div>
						<div class={`bg-gray-${index % 2 === 0 ? '100' : '200'} bg-slate-100 col-span-1 p-2 `}>
							{#if editingId === item.id}
								<button class="w-5 h-5 ml-4" on:click={stopEditing} aria-label="Save"
									><svg
										width="100%"
										height="100%"
										viewBox="0 0 251 251"
										version="1.1"
										xmlns="http://www.w3.org/2000/svg"
										xmlns:xlink="http://www.w3.org/1999/xlink"
										xml:space="preserve"
										style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;"
									>
										<g transform="matrix(1,0,0,1,-1875,-1458.33)">
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M483.567,409L454,409C452.343,409 451,407.657 451,406L451,360L460,351L492,351C493.657,351 495,352.343 495,354L495,378.028"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M462,355L462,361L456,361"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M466.5,373L485.5,373"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M466.5,385L481.729,385"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M466.5,397L478.028,397"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M462,373C462,371.896 461.104,371 460,371C458.896,371 458,371.896 458,373C458,374.104 458.896,375 460,375C461.104,375 462,374.104 462,373Z"
													style="fill:rgb(61,62,68);fill-rule:nonzero;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M462,385C462,383.896 461.104,383 460,383C458.896,383 458,383.896 458,385C458,386.104 458.896,387 460,387C461.104,387 462,386.104 462,385Z"
													style="fill:rgb(61,62,68);fill-rule:nonzero;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M462,397C462,395.896 461.104,395 460,395C458.896,395 458,395.896 458,397C458,398.104 458.896,399 460,399C461.104,399 462,398.104 462,397Z"
													style="fill:rgb(61,62,68);fill-rule:nonzero;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M509,396C509,388.82 503.18,383 496,383C488.82,383 483,388.82 483,396C483,403.18 488.82,409 496,409C503.18,409 509,403.18 509,396Z"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M491,396.5L494,399.5L501,392.5"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
										</g>
									</svg>
								</button>
							{:else}
								<button
									class="w-5 h-5 ml-4"
									type="button"
									on:click={() => startEditing(item.id, $selectedBusiness)}
									aria-label="Edit"
								>
									<svg
										width="100%"
										height="100%"
										viewBox="0 0 247 261"
										version="1.1"
										xmlns="http://www.w3.org/2000/svg"
										xmlns:xlink="http://www.w3.org/1999/xlink"
										xml:space="preserve"
										style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-miterlimit:2;"
									>
										<g transform="matrix(1,0,0,1,-1457.35,-619.85)">
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M398,193.06L398,206.478C398,207.871 396.855,209 395.444,209L354.556,209C353.145,209 352,207.871 352,206.478L352,157.827C352,157.492 352.135,157.171 352.374,156.935L358.015,151.369C358.254,151.133 358.579,151 358.918,151L395.444,151C396.855,151 398,152.129 398,153.522L398,165.201"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M362,155L362,161L356,161"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M380.572,200.938L372,204L375.062,195.428L401.238,169.251C402.845,167.645 405.38,167.576 406.902,169.098C408.424,170.62 408.355,173.156 406.749,174.762L380.572,200.938Z"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M400.269,170.221L405.779,175.731"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M398.33,172.16L403.841,177.67"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M376.031,194.458L381.542,199.969"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M360,172L386,172"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
											<g transform="matrix(4.16667,0,0,4.16667,0,0)">
												<path
													d="M360,182L378,182"
													style="fill:none;stroke:rgb(61,62,68);stroke-width:2px;stroke-linejoin:round;"
												/>
											</g>
										</g>
									</svg>
								</button>
							{/if}
							<button
								on:click={() => {
									deleteItem(item.id, item.name);
								}}
								class="w-5 h-5 ml-4"
								><svg
									width="100%"
									height="100%"
									viewBox="0 0 33 36"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									xml:space="preserve"
									style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;"
								>
									<g transform="matrix(1,0,0,1,-1935.51,-741.539)">
										<g>
											<path
												d="M1964,748.055L1962.28,772.362C1962.12,774.446 1960.39,776.055 1958.3,776.055L1945.7,776.055C1943.61,776.055 1941.88,774.446 1941.72,772.362L1940,748.055"
												style="fill:none;stroke:black;stroke-width:1.03px;"
											/>
											<path
												d="M1936,748.055L1968,748.055"
												style="fill:none;stroke:black;stroke-width:0.99px;"
											/>
											<path
												d="M1948,748.055L1948,744.055C1948,742.95 1948.9,742.055 1950,742.055L1954,742.055C1955.1,742.055 1956,742.95 1956,744.055L1956,748.055"
												style="fill:none;stroke:black;stroke-width:1.03px;"
											/>
											<path
												d="M1948,768.055L1948,756.055"
												style="fill:none;stroke:black;stroke-width:0.97px;"
											/>
											<path
												d="M1956,768.055L1956,756.055"
												style="fill:none;stroke:black;stroke-width:0.95px;"
											/>
										</g>
									</g>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	{#if activeButton === 'addRemoveCategory'}
		<Categories />
	{/if}
	{#if activeButton === 'addDish'}
		<InsertDish />
	{/if}
	{#if activeButton === 'updateBusiness'}
		<Business />
	{/if}
	{#if activeButton === 'tags'}
		<Tags />
	{/if}
</div>

<style>
</style>
