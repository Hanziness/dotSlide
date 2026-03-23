<script lang="ts">
import { onMount } from "svelte";
import AuthLoginPage from "$lib/components/AuthLoginPage.svelte";

let roomId: string | null = $state(null)

onMount(() => {
  const params = new URLSearchParams(location.search)
  roomId = params.get("p")

  if (!roomId) {
    throw new Error("Invalid presentation ID")
  }
})
</script>

<AuthLoginPage
  title="Join the presentation"
  submitLabel="View presentation"
  roomId={roomId}
/>
