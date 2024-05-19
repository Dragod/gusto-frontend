# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## gusto-client

```js
const unsubscribe = menuRefresh.subscribe((value) => {
	refreshList = value;
});

$: {
	if ($dataSort.length > 0) {
		filteredData = $dataSort.filter((item) =>
			item.name.toLowerCase().includes(filter.toLowerCase())
		);
	} else {
		filteredData = data.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}

	if (refreshList.length > 0) {
		// Apply the same sorting to refreshList
		dataToRender = refreshList.sort((a, b) => {
			// Replace this with your sorting logic
			return a.name.localeCompare(b.name);
		});
	} else {
		dataToRender = filteredData;
	}
}

onDestroy(() => {
	unsubscribe();
});
```

## Read on eventDispatcher

Based on the code you've provided, it seems like the `sortBy` function is called in the `getMenu` function and when a business is selected. If you want to call `sortBy` when a button is clicked in the `navButtons.svelte` component, you'll need to emit an event from `navButtons.svelte` and listen for that event in `+page.svelte`.

Here's an example of how you might do this:

In `navButtons.svelte`:

```svelte
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleButtonClick() {
		dispatch('sort');
	}
</script>

<button on:click={handleButtonClick}>Sort</button>
```

In this example, `navButtons.svelte` dispatches a 'sort' event when the button is clicked.

Then, in `+page.svelte`, you can listen for the 'sort' event and call `sortBy` when the event is fired:

```svelte
<script>
	import NavButtons from '../components/navButtons.svelte';
	// ... rest of your imports

	async function handleSortEvent() {
		await sortBy('default');
	}

	// ... rest of your script
</script>

<NavButtons on:sort={handleSortEvent} />
```

In this example, `+page.svelte` listens for the 'sort' event from `NavButtons` and calls `handleSortEvent` when the event is fired. `handleSortEvent` then calls `sortBy`.

Please replace `'default'` with the appropriate sort type based on your application's logic.
# gusto-frontend
