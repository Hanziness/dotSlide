<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<style>
:global(html), :global(body) {
	background-color: black;
	color: var(--color-slate-50);
}
</style>