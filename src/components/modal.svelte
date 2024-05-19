<script>
	import { modalStore, closeModal } from '../store/modal';
	import { fade } from 'svelte/transition';

	let isOpen = false;
	let title = '';
	let message = '';
	let yesCallback = () => {};
	let noCallback = () => {};

	modalStore.subscribe(
		({ isOpen: open, title: ttl, message: msg, yesCallback: yes, noCallback: no }) => {
			isOpen = open;
			title = ttl;
			message = msg;
			yesCallback = yes;
			noCallback = no;
		}
	);
</script>

{#if isOpen}
	<div class="modal" transition:fade={{ duration: 200 }}>
		<div class="modal-content">
			<div class="flex flex-row justify-end items-center">
				<h2 class="flex flex-1 text-center text-1xl font-semibold text-gray-800">{title}</h2>
				<button class="close" title="Clode modal" on:click={closeModal}>
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 39 39"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						xml:space="preserve"
						style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;"
						class="w-5 h-5"
					>
						<g transform="matrix(1,0,0,1,-3948.51,-835.562)">
							<g>
								<path
									d="M3987,855.055C3987,865.548 3978.49,874.055 3968,874.055C3957.51,874.055 3949,865.548 3949,855.055C3949,844.562 3957.51,836.055 3968,836.055C3978.49,836.055 3987,844.562 3987,855.055Z"
									style="fill:none;stroke:black;stroke-width:0.99px;"
								/>
								<path
									d="M3961,848.055L3975,862.055"
									style="fill:none;stroke:black;stroke-width:0.97px;"
								/>
								<path
									d="M3961,862.055L3975,848.055"
									style="fill:none;stroke:black;stroke-width:1.03px;"
								/>
							</g>
						</g>
					</svg>
				</button>
			</div>
			<hr class="border-t border-gray-300 my-2" />
			<p class="text-sm text-gray-700 py-4">{@html message}</p>
			<div class="flex justify-end">
				<button
					class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
					on:click={() => {
						noCallback();
						closeModal();
					}}>No</button
				>
				<button
					class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 ml-3 rounded"
					on:click={() => {
						yesCallback();
						closeModal();
					}}>Yes</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}

	.modal-content {
		background-color: white;
		padding: 20px;
		border-radius: 10px;
		width: 80%;
		max-width: 500px;
	}
</style>
