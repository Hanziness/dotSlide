<script lang="ts">
    import { authClient } from "@dotslide/server/client";
    import { LogOutIcon } from "lucide-svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { client } from "$lib/client";
    import Badge from "$lib/components/Badge.svelte";
    import Button from "$lib/components/Button.svelte";

    let session: Awaited<ReturnType<typeof authClient.getSession>> | undefined = $state()
    const userRole = $derived(session?.data.session.presentationRole)

    onMount(async () => {
        session = await authClient.getSession()
        if (!session.data) {
            // TODO Make note that the user has not yet picked a name, so we need to request one from them before login
            const res = await authClient.signIn.anonymous()
            session = await authClient.getSession()
            console.log(res)
        } else {
            console.info("Already logged in:\n", session)
        }

        console.log(await (await client.api.slides.$get()).json())
    })

    const logout = async () => {
        await authClient.signOut()
        goto('/auth/viewer')
    }
</script>

<div class="w-full h-full flex flex-col relative">
    <div class="w-full flex flex-row items-center justify-start gap-2 p-2 border-b border-slate-800">
        <div class="p-2">dotSlide</div>
        {#if userRole === 'viewer'}
            <Badge>Viewer</Badge>
        {:else if userRole === 'presenter'}
            <Badge>Presenter</Badge>
        {/if}
        <div class="grow"></div>
        <div>
            <Button onclick={logout}>
                <LogOutIcon size={18} />
            </Button>
        </div>
    </div>


</div>
