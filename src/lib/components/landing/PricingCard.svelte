<script lang="ts">
	import type { Product } from '$lib/types';
	import Icon from '@iconify/svelte';
	export let product: Product;
	export let subscriptionBasis: 'monthly' | 'yearly';
</script>

<div
	class="flex flex-col items-center justify-between rounded-lg border border-neutral-400 bg-white p-4 shadow-sm"
>
	<div class="text-lg font-semibold text-neutral-800">{product.name}</div>
	<div class="text-2xl font-semibold">
		${(subscriptionBasis === 'monthly' ? product.prices.monthly : product.prices.yearly).toFixed(2)}
	</div>
	<div class="my-4 flex flex-col gap-2 rounded-lg border border-neutral-400 bg-white p-3 shadow-sm">
		{#each product.features as feature}
			<div class="flex items-center gap-3">
				<Icon icon="mingcute:check-fill" class="h-5 w-5 text-emerald-300" />
				<span class="text-neutral-600">{feature}</span>
			</div>
		{/each}
	</div>
	<button class="btn-primary w-full">Select Plan</button>
</div>
