<script lang="ts">
import { LogOutIcon } from "lucide-svelte";
    import type { Snippet } from "svelte";

interface ButtonProps {
    onclick?: () => void
    children?: Snippet
}

const props: ButtonProps = $props()
</script>

<button class="p-2 bg-slate-100 text-slate-950 rounded-full cursor-pointer" type="button" aria-label="Log out" onclick={props.onclick}>
    {@render props.children?.()}
</button>