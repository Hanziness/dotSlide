<script lang="ts">
    import type { NavigationSnapshot } from "@dotslide/protocol";
    import { ArrowLeft, ArrowRight, MousePointer2 } from "lucide-svelte";

    type Input = 'prev' | 'next' | 'laser'

    type Props = {
      state: NavigationSnapshot
      onInput: (input: Input) => void
    }

    const props: Props = $props()
    const progress = $derived((props.state.navigationIndex + 1) / props.state.numNavigationSteps)

    $inspect(props.state)
</script>

<div class="flex flex-col h-full p-4 pb-16 gap-4">

  <!-- Top area: status display -->
  <div class="w-full h-2 rounded-full bg-white/20 relative">
    <div class="absolute inset-0 left-0 bg-white rounded-full" style:width={`${(progress * 100).toFixed(2)}%`}></div>
  </div>
  <div class="p-4 w-full h-64 flex flex-col justify-center items-center gap-2">
    <div class="text-6xl font-mono font-bold flex flex-row items-start">
      <div>{props.state.activeSlide + 1}</div>
      <div class="text-2xl">{props.state.activeStep + 1}</div>
    </div>
    <div class="text-4xl opacity-80">{props.state.numNavigationSteps}</div>
  </div>

  <div class="grow"></div>

  <!-- Bottom area: control buttons -->
  <div class="flex flex-row justify-center px-8">
    <div class="w-full flex flex-row flex-nowrap justify-center items-center gap-4 max-w-md">
      <button type="button" disabled={props.state.navigationIndex === 0} class="disabled:opacity-40 rounded-full flex-2 aspect-square ring ring-white text-white active:bg-white active:text-slate-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('prev') }}>
        <ArrowLeft class="w-full h-full p-[25%] min-w-8" />
      </button>
    
      <!-- <button type="button" class="rounded-full flex-3 aspect-square ring ring-white text-white active:bg-white active:text-slate-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('laser') }}>
        <MousePointer2 class="w-full h-full p-[30%] min-w-8" />
      </button> -->
    
      <button type="button" disabled={props.state.navigationIndex === (props.state.numNavigationSteps - 1)} class="disabled:opacity-40 rounded-full flex-2 aspect-square ring ring-white text-white active:bg-white active:text-slate-900 flex flex-col items-center justify-center" onclick={() => { props.onInput('next') }}>
        <ArrowRight class="w-full h-full p-[25%] min-w-8" />
      </button>
    </div>
  </div>
</div>