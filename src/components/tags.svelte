<script lang="jsdoc">
	import { onMount } from 'svelte';
	import { toasts } from 'svelte-toasts';
	import schema from '../validation/tag-edit';
	import { openModal } from '../store/modal';
	import Modal from './modal.svelte';

	/**
	 * @type {any[]}
	 */
	let tags = [];

	onMount(async () => {
		const res = await fetch('http://localhost:5000/data/admin/tags');
		tags = await res.json();
	});

	/**
	 * @type {any}
	 */
	let editingId = null;

	/**
	 * @type {{ tag_name: string, description: string } | null}
	 */
	let originalData = null;

	let updatedData = { tag_name: '', description: '' };

	let showError = false;

	/**
	 * @typedef {Object} Errors
	 * @property {string} tag_name
	 * @property {string} description
	 */
	let errors = {
		tag_name: '',
		description: ''
	};

	/**
	 * @type {(id: any) => void}
	 */
	function startEditing(id) {
		const tag = tags.find((tag) => tag.id === id);
		if (tag) {
			editingId = id;
			originalData = { ...tag };
			updatedData = { ...tag };
		}
	}

	async function fetchTagData() {
		try {
			const response = await fetch('http://localhost:5000/data/admin/tags');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			tags = await response.json();
			console.log(tags);
		} catch (error) {
			console.error('Failed to fetch tags:', error);
		}
	}

	async function stopEditing() {
		console.log('stopEditing called');
		showError = true;
		try {
			if (!originalData) {
				console.error('stopEditing was called before startEditing');
				return;
			}

			if (updatedData) {
				// Validate the updatedData object
				// Clear the errors object
				for (let key in errors) {
					const errorKey = /** @type {keyof Errors} */ (key);
					errors[errorKey] = '';
				}

				// Validate the updatedData object
				const { error } = schema.validate(updatedData, { abortEarly: false });
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
					return;
				}

				if (JSON.stringify(originalData) === JSON.stringify(updatedData)) {
					console.log('No changes detected, not sending PATCH request');
				} else {
					const response = await fetch(`http://localhost:5000/data/admin/tags/${editingId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(updatedData)
					});
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					console.log('PATCH request successful');
					toasts.success({
						title: 'Success',
						description: 'Tag updated successfully to: ' + updatedData.tag_name,
						type: 'success',
						duration: 6000,
						placement: 'bottom-center'
					});
				}
			} else {
				console.log('updatedData does not exist, not sending PATCH request');
			}

			editingId = null;
			updatedData = { tag_name: '', description: '' };
			originalData = null;
			showError = false;
			if (Object.keys(errors).length === 0) {
				showError = false;
			}
			errors = { tag_name: '', description: '' };
			await fetchTagData();
		} catch (error) {
			toasts.error({
				title: 'Error',
				description: 'Failed to update tag: ' + error,
				type: 'error',
				duration: 6000,
				placement: 'bottom-center'
			});
		}
	}

	let newTagName = '';
	let newTagDesc = '';

	async function addTag() {
		// Validate the new tag data
		const { error } = schema.validate({ tag_name: newTagName, description: newTagDesc });
		if (error) {
			errors = error.details.reduce((acc, detail) => {
				const errorField = detail.path[0]; // Get the field that caused the error
				acc[/** @type {keyof Errors} */ (errorField)] = detail.message; // Set the error message for that field
				return acc;
			}, /** @type {Errors} */ ({ tag_name: '', description: '' }));
			console.log('Errors:', errors);
			return; // Return early to prevent the POST request from being sent
		}

		try {
			const response = await fetch('http://localhost:5000/data/admin/tags', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tag_name: newTagName, description: newTagDesc }) // Include the description in the request body
			});
			if (!response.ok) {
				const errorData = await response.json();
				errors = {
					tag_name: errorData.error,
					description: ''
				};
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			console.log('POST request successful');
			toasts.success({
				title: 'Success',
				description: 'Tag added successfully: ' + newTagName,
				type: 'success',
				duration: 6000,
				placement: 'bottom-center'
			});
			newTagName = '';
			newTagDesc = '';
			await fetchTagData();
		} catch (error) {
			toasts.error({
				title: 'Error',
				description: 'Failed to add tag: ' + error,
				type: 'error',
				duration: 6000,
				placement: 'bottom-center'
			});
		}

		// Clear the errors object
		for (let key in errors) {
			const errorKey = /** @type {keyof Errors} */ (key);
			errors[errorKey] = '';
		}

		// Clear the new tag data
		newTagName = '';
		newTagDesc = '';
		await fetchTagData();
	}

	/**
	 * @param {number} id
	 */
	async function deleteTag(id) {
		try {
			const response = await fetch(`http://localhost:5000/data/admin/tags/${id}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			console.log('DELETE request successful');
			await fetchTagData();
		} catch (error) {
			toasts.error({
				title: 'Error',
				description: 'Failed to delete tag: ' + error,
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
			'Delete Tag - ' + name,
			'Are you sure you want to <strong>delete' +
				'<' +
				'/strong> tag, <strong>' +
				name +
				'<' +
				'/strong>?',
			() => {
				deleteTag(id);
				toasts.success({
					title: 'Success',
					description: `${name}, tag was deleted successfully`,
					type: 'success',
					duration: 6000,
					placement: 'bottom-center'
				});
			},
			() => {
				toasts.info({
					title: 'Delete cancelled',
					description: `${name},tag was NOT deleted`,
					type: 'info',
					duration: 6000,
					placement: 'bottom-center'
				});
			}
		);
	}
</script>

<div class="flex flex-col overflow-auto">
	<h1 class="text-2xl font-bold text-gray-800 mb-4 mr-10 p-1">Tags</h1>
	<div class="flex overflow-auto mb-6">
		<form on:submit|preventDefault={addTag}>
			<div class="flex flex-col pr-8">
				<h2 class="text-1xl font-bold text-gray-800 pb-4">Insert new tag</h2>
				<label for="tagName" class="mr-2"> Tag name</label>
				<input
					type="text"
					bind:value={newTagName}
					placeholder="Tag name"
					class="border p-2 rounded mr-2"
				/>
				<small class="text text-rose-600 pt-2">{errors.tag_name}</small>
				<label for="tagDesc" class="mr-2 mt-4">Tag description</label>
				<input
					type="text"
					bind:value={newTagDesc}
					placeholder="Tag description"
					class="border p-2 rounded mr-2"
				/>
				<small class="text text-rose-600 pt-2">{errors.description}</small>
			</div>
			<button type="submit" class="bg-blue-500 text-white p-2 mt-4 rounded">Add Tag</button>
		</form>
		<div class="grid grid-cols-6 gap-1 w-full overflow-auto">
			<div class="col-start-1 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Tag</div>
			<div class="col-start-2 col-span-4 bg-gray-300 p-2 sticky top-0 font-bold">Description</div>
			<div class="col-start-6 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Action</div>
			{#each tags as tag (tag.id)}
				<div class="col-start-1 col-span-1 p-2 bg-slate-100 min-h-[60px]">
					{#if editingId === tag.id}
						<input
							type="text"
							class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
							placeholder="Tag"
							bind:value={updatedData.tag_name}
							on:keydown={(e) => e.key === 'Enter' && stopEditing()}
						/>
						{#if showError && errors.tag_name}
							<small class="text text-rose-600">{errors.tag_name}</small>
						{/if}
					{:else}
						{tag.tag_name}
					{/if}
				</div>
				<div class="col-start-2 col-span-4 p-2 bg-slate-100 min-h-[60px]">
					{#if editingId === tag.id}
						<input
							type="text"
							class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
							placeholder="Description"
							bind:value={updatedData.description}
							on:keydown={(e) => e.key === 'Enter' && stopEditing()}
						/>
						{#if showError && errors.description}
							<small class="text text-rose-600">{errors.description}</small>
						{/if}
					{:else}
						{tag.description}
					{/if}
				</div>
				<div class="col-start-6 col-span-1 p-2 bg-slate-100 min-h-[60px]">
					{#if editingId === tag.id}
						<button class="w-5 h-5 ml-4" type="button" aria-label="Save" on:click={stopEditing}>
							<svg
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
							aria-label="Edit"
							on:click={() => startEditing(tag.id)}
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
						<button
							on:click={() => {
								deleteItem(tag.id, tag.tag_name);
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
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style></style>
