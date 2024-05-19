<script lang="jsdoc">
	// @ts-nocheck

	//import { onMount } from 'svelte';
	import Header from '../components/header.svelte';
	import Menu from '../components/menu.svelte';
</script>

<!-- <Modal /> -->

<!-- Toaster -->
<!-- <ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer> -->

<div class="flex flex-col h-screen min-w-full bg-slate-50">
	<Header />
	<Menu />
</div>

<style>
	/* This will apply to all containers */
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}
	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 20px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
