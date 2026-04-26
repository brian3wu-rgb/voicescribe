import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Missing env: ANTHROPIC_API_KEY");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/** @deprecated use getAnthropic() */
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getAnthropic() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
