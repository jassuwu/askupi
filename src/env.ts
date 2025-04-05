import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_HOSTED_URL: z
      .string()
      .url()
      .describe("The hosted URL for the app"),
  },
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z
      .string()
      .describe("The API key for the Google Generative AI"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_HOSTED_URL: process.env.NEXT_PUBLIC_HOSTED_URL,
  },
});
