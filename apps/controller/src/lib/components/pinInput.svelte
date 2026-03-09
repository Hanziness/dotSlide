<script lang="ts">
type Props = {
    oninput?: (pin: string | undefined) => void
}

const props: Props = $props()

let input: string[] = $state([])
let focusIndex: number = $state(0)
let inputContainer: HTMLDivElement

const filler = new Array(6).fill(0)
const finalInput = $derived(input.join(''))

$effect(() => {
    (inputContainer.children[focusIndex] as HTMLElement | undefined)?.focus()
})

$effect(() => {
    if (finalInput.length === 6) {
        props.oninput?.(finalInput)
    } else if (finalInput.length > 6) {
        console.warn('finalInput is wrong length: ', finalInput, ' is of length ', finalInput.length)
    } else {
        props.oninput?.(undefined)
    }
})

</script>

<div class="grid grid-flow-col gap-2" style="grid-template-columns: 6;" bind:this={inputContainer}>
    {#each filler as _, idx}
        <input class="p-2 h-16 w-12 text-lg text-center border border-slate-300 rounded-lg" oninput={(e) => {
            const value = (e.target as HTMLInputElement).value.slice(-1)
            input[idx] = value;

            // Trim input value as well
            (e.target as HTMLInputElement).value = value.slice(-1)
            
            if (value === '' && focusIndex > 0) {
                focusIndex -= 1
            } else if (value !== '' && focusIndex < 5) {
                focusIndex += 1
            }
         }} 
         onfocus={() => { focusIndex = idx }}
         onkeyup={(e) => { if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') { 
            focusIndex = idx - 1
        } }}
         >
    {/each}
</div>