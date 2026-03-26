<script lang="ts">
import { client } from "$lib/client";
import Button from "../Button.svelte";

function prev() {}
async function next() {
    await client.api.control.navigate[":idx"].$post({ param: { idx: "1" } })
}
</script>

<div class="flex flex-row gap-2">
    <Button onclick={prev}>Previous</Button>
    <Button onclick={next}>Next</Button>
</div>