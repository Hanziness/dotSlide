import type { Client } from "@dotslide/server/client";

export async function createRoom(client: Client) {
  return client.api.presenter.create.$post();
}
