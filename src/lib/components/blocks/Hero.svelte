<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Button from '../Button.svelte';
	import Icon from '@iconify/svelte';

	let learnMore: HTMLElement | null = null;

	onMount(() => {
		learnMore = document.getElementById('learnMore');
	});
</script>

<div class="my-24 flex w-full items-center justify-center">
	<div class="flex max-w-4xl flex-col items-center">
		<img src="/hero.png" alt="hero" class="w-64" />
		<h1
			class="text-pretty text-center text-2xl font-semibold drop-shadow-2xl sm:text-4xl md:text-5xl"
		>
			Create an <span class="text-emerald-300">online presence</span><br /> for your food business
			with
			<span class="font-norwester font-normal">F3AST</span>.
		</h1>
		<h2
			class=" mt-2 max-w-4xl text-pretty text-center text-xl font-semibold italic text-neutral-500 drop-shadow-xl sm:text-2xl md:text-3xl"
		>
			Starting from just <span class="text-emerald-400">$19.99</span> a month.
		</h2>
		<div class="my-8 flex gap-4">
			<a class="btn-primary" href="/pricing"
				>View Pricing <Icon icon="mingcute:arrow-right-circle-fill" class="text-xl" /></a
			>
			<button
				class="btn-outline"
				on:click={() =>
					learnMore &&
					learnMore.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'center'
					})}>Learn More <Icon icon="mingcute:information-fill" class="text-xl" /></button
			>
		</div>
	</div>
</div>
