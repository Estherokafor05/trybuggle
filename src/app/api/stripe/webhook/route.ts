import { handleWebhook } from "@/server/payments";

// Stripe tells us here when a plan is bought, changed, renewed or cancelled.
export async function POST(request: Request) {
  const payload = await request.text();
  try {
    const result = await handleWebhook(payload, request.headers.get("stripe-signature"));
    return Response.json(result.error ? { error: result.error } : { received: true }, { status: result.status });
  } catch {
    return Response.json({ error: "Could not handle this event yet" }, { status: 500 });
  }
}
