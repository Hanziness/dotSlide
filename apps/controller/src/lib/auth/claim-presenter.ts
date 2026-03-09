import { refreshSession } from "../auth-client";
import { client } from "../client";

export async function claimPresenter(pin: string): Promise<string | null> {
  const response = await client.api.claim.$post({
    json: { pin },
  });

  if (!response.ok) {
    try {
      const body = await response.json();
      return "error" in body ? body.error : "Failed to verify presenter PIN.";
    } catch {
      return "Failed to verify presenter PIN.";
    }
  }

  await refreshSession();

  return null;
}
