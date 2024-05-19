<script lang="jsdoc">
	import { onMount } from 'svelte';

	/**
	 * @type {any[]}
	 */
	let businesses = [];

	onMount(async () => {
		const res = await fetch('http://localhost:5000/data/admin/business');
		businesses = await res.json();
	});
</script>

<div class="flex flex-col overflow-auto">
	<h1 class="text-2xl font-bold text-gray-800 mb-4 mr-10 p-1">Business</h1>
	<div class="flex overflow-auto mb-6">
		<div class="grid grid-cols-9 gap-1 w-full overflow-auto">
			<div class="col-start-1 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Name</div>
			<div class="col-start-2 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">City</div>
			<div class="col-start-3 col-span-2 bg-gray-300 p-2 sticky top-0 font-bold">Address</div>
			<div class="col-start-5 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Cap</div>
			<div class="col-start-6 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Province</div>
			<div class="col-start-7 col-span-1 bg-gray-300 p-2 sticky top-0 font-bold">Phone</div>
			<div class="col-start-8 col-span-2 bg-gray-300 p-2 sticky top-0 font-bold">Email</div>
			{#each businesses as business (business.id)}
				<div class="col-start-1 col-span-1 p-2 bg-slate-100 min-h-[60px]">{business.name}</div>
				<div class="col-start-2 col-span-1 p-2 bg-slate-100 min-h-[60px]">{business.city}</div>
				<div class="col-start-3 col-span-2 p-2 bg-slate-100 min-h-[60px]">{business.address}</div>
				<div class="col-start-5 col-span-1 p-2 bg-slate-100 min-h-[60px]">{business.cap}</div>
				<div class="col-start-6 col-span-1 p-2 bg-slate-100 min-h-[60px]">{business.province}</div>
				<div class="col-start-7 col-span-1 p-2 bg-slate-100 min-h-[60px]">
					{business.phone_number}
				</div>
				<div class="col-start-8 col-span-2 p-2 bg-slate-100 min-h-[60px]">{business.email}</div>
			{/each}
		</div>
	</div>
</div>

<style></style>
