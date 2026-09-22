type TurnstileResult = {
  success: boolean;
  error?: string;
};

/**
 * Verify Cloudflare Turnstile token when TURNSTILE_SECRET_KEY is configured.
 * If secret is not set, verification is skipped (development-friendly).
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Please complete the security check." };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const data = (await response.json()) as { success?: boolean };
    if (!data.success) {
      return { success: false, error: "Security check failed. Please try again." };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: "We couldn't verify the security check. Please try again.",
    };
  }
}
