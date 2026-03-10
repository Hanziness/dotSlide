import { auth } from "./auth";

export type OneTimeTokenVerificationResult = Awaited<
  ReturnType<typeof auth.api.verifyOneTimeToken>
>;

export async function generateOneTimeToken(headers: Headers): Promise<string> {
  const result = await auth.api.generateOneTimeToken({
    headers,
  });

  return result.token;
}

export async function verifyOneTimeToken(
  token: string,
): Promise<OneTimeTokenVerificationResult> {
  return auth.api.verifyOneTimeToken({
    body: { token },
  });
}
