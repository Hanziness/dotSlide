<script lang="ts">
    import Button from "../Button.svelte";

    interface Props {
        ws: WebSocket;
    }

    let { ws }: Props = $props();

    function prev() {
        ws.send(JSON.stringify({ type: "navigate", action: "prev" }));
    }

    function next() {
        ws.send(JSON.stringify({ type: "navigate", action: "next" }));
    }
</script>

<div class="flex flex-row gap-2">
    <Button onclick={prev}>Previous</Button>
    <Button onclick={next}>Next</Button>
</div>
