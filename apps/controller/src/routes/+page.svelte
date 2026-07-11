<script lang="ts">
    import {
        deriveNavigationState,
        type NavigationSnapshot,
    } from "@dotslide/protocol";
    import { LogOutIcon } from "lucide-svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { authClient, client } from "$lib/client";
    import Badge from "$lib/components/Badge.svelte";
    import Button from "$lib/components/Button.svelte";
    import Controller from "$lib/components/presenter/controller.svelte";
    import { ControllerConnection } from "$lib/controllerConnection";

    const getRoomIdFromUrl = () => {
        const params = new URLSearchParams(location.search);
        return params.get("p");
    };

    let roomId: string | null = $state(null);
    let userRole: string | null = $state(null);
    let localNavState: NavigationSnapshot | null = $state(null);
    let isConnected = $state(false);

    let connection: ControllerConnection | null = null;

    onMount(() => {
        let isCancelled = false;

        const bootstrap = async () => {
            const currentSession = await authClient.getSession();
            if (isCancelled) {
                return;
            }

            if (!currentSession.data) {
                await authClient.signIn.anonymous();
                if (isCancelled) {
                    return;
                }
            }

            roomId = getRoomIdFromUrl();

            if (!roomId) {
                throw new Error("No presentation ID supplied");
            }

            const userRoleQuery = await client.api.presenter[":roomId"].me.$get({
                param: { roomId },
            });

            if (isCancelled) {
                return;
            }

            if (userRoleQuery.ok) {
                userRole = (await userRoleQuery.json()).currentRole;
            }

            connection = new ControllerConnection({
                roomId,
                onConnected: () => {
                    isConnected = true;
                },
                onDisconnected: () => {
                    isConnected = false;
                },
                onSyncState: (state) => {
                    localNavState = {
                        ...state,
                        ...deriveNavigationState(
                            state.navigationSequence,
                            state.navigationIndex,
                        ),
                    };
                },
                onNavigationUpdate: (navigationIndex) => {
                    if (localNavState == null) {
                        return;
                    }

                    if (localNavState.navigationIndex === navigationIndex) {
                        return;
                    }

                    localNavState = {
                        ...localNavState,
                        navigationIndex,
                        ...deriveNavigationState(
                            localNavState.navigationSequence,
                            navigationIndex,
                        ),
                    };
                },
            });
            connection.start();
        };

        bootstrap();

        return () => {
            isCancelled = true;
            connection?.stop();
            connection = null;
        };
    });

    const logout = async () => {
        connection?.stop();
        await authClient.signOut();

        const currentRoomId = roomId ?? getRoomIdFromUrl();
        if (currentRoomId == null) {
            goto(`/auth/viewer`);
            return;
        }

        goto(`/auth/viewer?p=${currentRoomId}`);
    };
</script>

<div class="w-full h-full flex flex-col relative">
    <div class="w-full flex flex-row justify-center items-center gap-2 p-2 relative">
        <div class="p-2">dotSlide</div>
        {#if userRole === "controller"}
            <Badge>Presenter</Badge>
        {/if}
        <div class="absolute right-2">
            <Button onclick={logout}>
                <LogOutIcon size={18} />
            </Button>
        </div>
    </div>
    <div class="grow">
        {#if localNavState != null && isConnected}
            <Controller
                state={localNavState}
                onInput={(input) => {
                    if (input === "laser") {
                        return;
                    }

                    connection?.sendNavigate(input);
                }}
            />
        {/if}
    </div>
</div>
