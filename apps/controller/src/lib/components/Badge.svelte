<script lang="ts">
import type { Snippet } from "svelte";

interface BadgeProps {
    children?: Snippet
}

const props: BadgeProps = $props()
</script>

<div class="py-1 px-2 rounded-lg text-xs border border-slate-200 text-slate-200">
    {@render props.children?.()}
</div>