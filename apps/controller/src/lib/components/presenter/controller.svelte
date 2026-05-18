<script lang="ts">
    import type { NavigationSnapshot } from "@dotslide/protocol";
    import { ArrowLeft, ArrowRight, MousePointer2 } from "lucide-svelte";

    type Input = 'prev' | 'next' | 'laser'

    type Props = {
      state: NavigationSnapshot
      onInput: (input: Input) => void
    }

    const props: Props = $props()
</script>

<div class="flex flex-col">

<!-- Top area: status display -->
<div class="border border-white/40 rounded-lg p-4 w-full h-64">
  <span>{props.state.navigationIndex + 1} / {props.state.numSlides}</span>
</div>

<div class="grow"></div>

<!-- Bottom area: control buttons -->
<div class="flex flex-row flex-nowrap justify-center items-center gap-4">
  <button type="button" class="rounded-full h-24 w-24 bg-white text-gray-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('prev') }}>
    <ArrowLeft />
  </button>

  <button type="button" class="rounded-full h-32 w-32 bg-white text-gray-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('laser') }}>
    <MousePointer2 />
  </button>

  <button type="button" class="rounded-full h-24 w-24 bg-white text-gray-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('next') }}>
    <ArrowRight />
  </button>
</div>
</div>