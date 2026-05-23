<script lang="ts">
    import {
        type ClientMessage,
        type NavigationSnapshot,
        ServerMessage as ServerMessageSchema,
    } from "@dotslide/protocol";
    import { authClient } from "@dotslide/server/client";
    import { LogOutIcon } from "lucide-svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { client } from "$lib/client";
    import Badge from "$lib/components/Badge.svelte";
    import Button from "$lib/components/Button.svelte";
    import Controller from "$lib/components/presenter/controller.svelte";

    const getRoomIdFromUrl = () => {
        const params = new URLSearchParams(location.search)
        return params.get("p")
    }

    let session: Awaited<ReturnType<typeof authClient.getSession>> | undefined = $state()
    let roomId: string | null = $state(null)
    let userRole: string | null = $state(null)
    let ws: WebSocket | null = $state(null)
    let localNavState: NavigationSnapshot | null = $state(null)

    $inspect(localNavState)

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

        roomId = getRoomIdFromUrl()

        if (!roomId) {
            throw new Error("No presentation ID supplied")
        }

        const userRoleQuery = await client.api.presenter[":roomId"].me.$get({ param: { roomId } })
        if (userRoleQuery.ok) {
            userRole = (await userRoleQuery.json()).currentRole
            console.log("User role:", userRole)
        }

        console.log(await (await client.api.control[":roomId"].metadata.$get({ param: { roomId } })).json())
        console.log(client.api.ws[":roomId"].$url({ param: { roomId } }))
        ws = new WebSocket(client.api.ws[":roomId"].$url({ param: { roomId } }))
        ws.onmessage = (msg) => {
            const parsed = JSON.parse(msg.data)
            const result = ServerMessageSchema.safeParse(parsed)

            if (!result.success) {
                console.error("Invalid server message", result.error)
                return
            }

            const data = result.data
            console.info(data)

            if (data.type === 'sync') {
                const { type, ...navData } = data
                localNavState = navData
            } else if (data.type === 'navigate') {
                if (localNavState == null) return;
                console.log(`Updating nav index to ${data.navigationIndex}`)
                localNavState.navigationIndex = data.navigationIndex
            }
        }
        ws.onopen = () => {
            // Send a sync request on open
            ws?.send(JSON.stringify({ type: "sync:request" } as ClientMessage) )
        }
    })

    const logout = async () => {
        await authClient.signOut()
        goto(`/auth/viewer?p=${roomId}`)
    }
</script>

<div class="w-full h-full flex flex-col relative">
    <div class="w-full flex flex-row items-center justify-start gap-2 p-2 border-b border-slate-800">
        <div class="p-2">dotSlide</div>
        {#if userRole === 'controller'}
            <Badge>Presenter</Badge>
        {/if}
        <div class="grow"></div>
        <div>
            <Button onclick={logout}>
                <LogOutIcon size={18} />
            </Button>
        </div>
    </div>
    <div class="grow">
        {#if localNavState != null && ws != null}
        <Controller state={localNavState} onInput={(input) => {
            switch (input) {
                case 'prev':
                    ws?.send(JSON.stringify({ type: "navigate", action: "prev" }))
                    break;
                case 'next':
                    ws?.send(JSON.stringify({ type: "navigate", action: "next" }))
                    break;
            }
        }} />
        {/if}
    </div>

</div>
