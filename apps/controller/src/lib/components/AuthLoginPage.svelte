<script lang="ts">
import { authClient } from "@dotslide/server/client";
import { onMount } from "svelte";
import { goto } from "$app/navigation";

type Props = {
  title: string;
  submitLabel: string;
};

const { title, submitLabel }: Props = $props();

let username = $state("");
let error = $state<string | null>(null);
let isSubmitting = $state(false);

onMount(async () => {
  const currentSession = await authClient.getSession();
  if (currentSession.data) {
    username = currentSession.data.user.name;
  }
});

async function handleLogin() {
  isSubmitting = true;
  error = null;

  try {
    const currentSession = await authClient.getSession();

    if (!currentSession.data) {
      await authClient.signIn.anonymous();
    }

    await authClient.updateUser({ name: username });

    await goto("/");
  } finally {
    isSubmitting = false;
  }
}
</script>

<div class="w-full h-full flex flex-col items-center justify-center p-4">
  <div class="flex flex-col gap-2 max-w-xl w-full items-center p-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-950">
    <h1 class="w-full text-center font-bold">{title}</h1>
    <input
      class="w-full border border-slate-300 rounded-lg p-2"
      type="text"
      placeholder="Name"
      bind:value={username}
    />
    {#if error}
      <p class="w-full text-sm text-red-600">{error}</p>
    {/if}
    <button
      disabled={username.trim().length < 1 || isSubmitting}
      class="w-full bg-slate-900 text-white p-2 rounded-lg disabled:opacity-60"
      type="button"
      onclick={handleLogin}
    >
      {submitLabel}
    </button>
  </div>
</div>
