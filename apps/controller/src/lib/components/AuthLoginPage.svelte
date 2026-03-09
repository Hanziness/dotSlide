<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { claimPresenter } from "$lib/auth/claim-presenter";
import { authClient } from "$lib/auth-client";
import PinInput from "./pinInput.svelte";

type Props = {
  title: string;
  submitLabel: string;
  requirePresenterPin?: boolean;
};

const {
  title,
  submitLabel,
  requirePresenterPin = false,
}: Props = $props();

let username = $state("");
let pin = $state<string | undefined>(undefined);
let error = $state<string | null>(null);
let isSubmitting = $state(false);

onMount(async () => {
  const currentSession = await authClient.getSession();
  if (currentSession.data) {
    username = currentSession.data.user.name;
  }
});

async function handleLogin() {
  if (requirePresenterPin && !pin) {
    error = "Enter the presenter PIN.";
    return;
  }

  isSubmitting = true;
  error = null;

  try {
    const currentSession = await authClient.getSession();

    if (!currentSession.data) {
      await authClient.signIn.anonymous();
    }

    await authClient.updateUser({ name: username });

    if (requirePresenterPin && pin) {
      const presenterError = await claimPresenter(pin);
      if (presenterError) {
        error = presenterError;
        return;
      }
    }

    await goto("/");
  } finally {
    isSubmitting = false;
  }
}
</script>

<div class="w-full h-full flex flex-col items-center justify-center">
  <div class="flex flex-col gap-2 max-w-xl w-full items-center p-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-950">
    <h1 class="w-full text-center font-bold">{title}</h1>
    <input
      class="w-full border border-slate-300 rounded-lg p-2"
      type="text"
      placeholder="Name"
      bind:value={username}
    />
    {#if requirePresenterPin}
      <PinInput
        oninput={(value) => {
          pin = value;
        }}
      />
    {/if}
    {#if error}
      <p class="w-full text-sm text-red-600">{error}</p>
    {/if}
    <button
      disabled={username.trim().length < 1 || (requirePresenterPin && pin === undefined) || isSubmitting}
      class="w-full bg-slate-900 text-white p-2 rounded-lg disabled:opacity-60"
      type="button"
      onclick={handleLogin}
    >
      {submitLabel}
    </button>
  </div>
</div>
