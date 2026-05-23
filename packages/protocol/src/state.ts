import type { z } from "zod";
import type { SyncBroadcast } from "./messages";

/** Snapshot of the presentation state, sent on sync */
export type NavigationSnapshot = Omit<z.infer<typeof SyncBroadcast>, "type">
