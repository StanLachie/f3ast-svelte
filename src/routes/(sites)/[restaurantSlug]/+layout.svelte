<script lang="ts">
	import themes from '$lib/themes.js';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { LayoutData } from './$types';
	import ThemeStore from '$lib/stores/ThemeStore';

	export let data: LayoutData;

	let currentTheme = themes.default;
	ThemeStore.subscribe((value) => {
		currentTheme = value;
	});

	ThemeStore.set(themes[data.restaurant.theme] || themes.default);
</script>

<div
	class={`max-w-screen min-h-dvh ${currentTheme.colors.defaultBackground} ${currentTheme.colors.defaultText}`}
>
	<div class="mx-auto h-1/2 max-w-5xl p-2 sm:p-8 md:p-16">
		<slot />
	</div>
</div>
