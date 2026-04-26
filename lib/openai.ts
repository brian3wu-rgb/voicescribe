import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing env: OPENAI_API_KEY");
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/** @deprecated use getOpenAI() */
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
