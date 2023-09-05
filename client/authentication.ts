import { z } from "https://deno.land/x/zod/mod.ts";

export const Authentication = z.object({
  did: z.string(),
  is_portal_port: z.boolean(),
  sid: z.string(),
  synotoken: z.string(),
});

export type Authentication = z.infer<typeof Authentication>;
