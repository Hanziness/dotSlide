<script lang="ts">
import { authClient, refreshSession } from "@dotslide/server/client";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { client } from "$lib/client";

type Status =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "success" };

let status = $state<Status>({ state: "loading" });

onMount(async () => {
  const token = $page.url.searchParams.get("token");

  if (!token) {
    status = {
      state: "error",
      message: "No presenter token provided. Please use a valid presenter invite link.",
    };
    return;
  }

  try {
    // Ensure an anonymous session exists before claiming
    const currentSession = await authClient.getSession();
    if (!currentSession.data) {
      await authClient.signIn.anonymous();
    }

    // Consume the presenter token via the server
    const response = await client.api.presenter.claim.$post({
      json: { token },
    });

    if (!response.ok) {
      let message = "Failed to join as presenter.";
      try {
        const body = await response.json();
        if ("error" in body && typeof body.error === "string") {
          message = body.error;
        }
      } catch {
        // use default message
      }
      status = { state: "error", message };
      return;
    }

    const roomId = (await response.json()).room

    // Refresh session so downstream sees presenter role immediately
    await refreshSession();

    status = { state: "success" };
    await goto(`/?p=${roomId}`, { replaceState: true });
  } catch {
    status = {
      state: "error",
      message: "Something went wrong. The invite link may have expired or already been used.",
    };
  }
});
</script>

<div class="w-full h-full flex flex-col items-center justify-center p-4">
  <div class="flex flex-col gap-3 max-w-xl w-full items-center p-6 rounded-lg border border-slate-300 bg-slate-50 text-slate-950">
    {#if status.state === "loading"}
      <h1 class="text-center font-bold">Joining as presenter...</h1>
      <p class="text-sm text-slate-500">Verifying your invite link.</p>
    {:else if status.state === "error"}
      <h1 class="text-center font-bold text-red-700">Unable to join</h1>
      <p class="text-sm text-red-600">{status.message}</p>
      <a
        href="/auth/viewer"
        class="w-full text-center bg-slate-900 text-white p-2 rounded-lg"
      >
        Join as viewer instead
      </a>
    {:else if status.state === "success"}
      <h1 class="text-center font-bold">Joined as presenter</h1>
      <p class="text-sm text-slate-500">Redirecting...</p>
    {/if}
  </div>
</div>
