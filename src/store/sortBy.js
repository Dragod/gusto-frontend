import { writable, get } from 'svelte/store';

/** @type {import('svelte/store').Writable<any[]>} */
export const dataSort = writable([]);
export const selectedBusiness = writable(1);
export const activeSort = writable('default');

const partialEndpoint = `http://localhost:5000/data/admin/menu`;

/**
 * Sorts the data from the specified endpoint based on the active sort.
 * @param {string} sortType - The active sort to apply to the data.
 * @returns {Promise<any[]>} - A promise that resolves when the data is sorted.
 */
export async function sortBy(sortType) {
	const business = get(selectedBusiness);
	let endpoint;

	switch (sortType) {
		case 'default':
			endpoint = '';
			break;
		case 'highestPrice':
			endpoint = '/highest-price-sort';
			break;
		case 'lowestPrice':
			endpoint = '/lowest-price-sort';
			break;
		case 'isPizza':
			endpoint = '/pizza-sort';
			break;
		case 'newTag':
			endpoint = '/new-sort';
			break;
		case 'cerTag':
			endpoint = '/cer-sort';
			break;
		case 'surTag':
			endpoint = '/sur-sort';
			break;
		case 'nameAsc':
			endpoint = '/name-asc-sort';
			break;
		case 'nameDesc':
			endpoint = '/name-desc-sort';
			break;
		default:
			throw new Error(`Invalid sort type: ${sortType}`);
	}

	const url = `${partialEndpoint}${endpoint}?business=${business}`;

	console.log('sortBy:', url);

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		dataSort.set([...data]);
		activeSort.set(sortType);
	} catch (error) {
		console.error('Error in sortBy:', error);
	}

	return get(dataSort);
}
