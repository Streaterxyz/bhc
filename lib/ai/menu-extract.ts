/**
 * AI menu extraction — reads a photo or PDF of a menu and returns structured
 * items (name + sell price + category) using Claude Haiku 4.5.
 *
 * A printed menu only ever contains the item NAME, the SELL PRICE, and the
 * section it sits under. Cost, prep labour, overhead and volume are internal
 * data the operator still enters by hand — so this populates ~40% of the
 * table (the tedious typing) and leaves the margin inputs to the user.
 *
 * Env-gated: when ANTHROPIC_API_KEY is unset the import feature is hidden and
 * this is never called.
 */

import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

let cached: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (cached !== undefined) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export function isMenuExtractConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ExtractedMenuItem = {
  name: string;
  price: number | null;
  category: string | null;
};

const ExtractionSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      // null when the menu shows no price (e.g. "Market Price", "POA")
      price: z.number().nullable(),
      // the menu section the item sits under, if any
      category: z.string().nullable(),
    }),
  ),
});

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const SYSTEM = `You are a precise menu-data extractor for a hospitality margin tool.
You are given a photo or PDF of a venue's menu. Extract EVERY purchasable line item.

Rules:
- Extract food AND drinks — every item with a name. The operator will delete what they don't want.
- name: the item's name only. Do not include the description sentence underneath it.
- price: the numeric sell price in the menu's currency, as a plain number (e.g. 24, 18.5). If an item shows no price, or shows "Market Price"/"POA"/"Seasonal", set price to null. If an item lists multiple sizes/prices, use the first/standard price.
- category: the menu section the item appears under (e.g. "Entrées", "Mains", "Cocktails", "Wine"). If there is no clear section, set category to null.
- Do NOT invent items, prices, or categories. Only extract what is actually printed.
- Do NOT guess cost, margin, or anything not on the menu.`;

/**
 * Extract menu items from an uploaded image or PDF (base64 + media type).
 * Throws if the client isn't configured or the media type is unsupported.
 */
export async function extractMenuItems(file: {
  mediaType: string;
  data: string;
}): Promise<ExtractedMenuItem[]> {
  const client = getClient();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const isPdf = file.mediaType === "application/pdf";
  const isImage = IMAGE_TYPES.has(file.mediaType);
  if (!isPdf && !isImage) {
    throw new Error(`Unsupported media type: ${file.mediaType}`);
  }

  const mediaBlock = isPdf
    ? ({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: file.data,
        },
      } as const)
    : ({
        type: "image",
        source: {
          type: "base64",
          media_type: file.mediaType as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: file.data,
        },
      } as const);

  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          mediaBlock,
          {
            type: "text",
            text: "Extract every menu item from this menu into the structured format.",
          },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ExtractionSchema) },
  });

  const items = response.parsed_output?.items ?? [];
  // Defensive: drop empty names, trim, clamp negative prices to null.
  return items
    .map((it) => ({
      name: it.name.trim().slice(0, 120),
      price: it.price != null && it.price >= 0 ? it.price : null,
      category: it.category ? it.category.trim().slice(0, 60) : null,
    }))
    .filter((it) => it.name !== "");
}
