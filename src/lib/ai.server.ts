const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type VoiceProfile = {
  name: string;
  brokerage: string;
  tone_tags: string[];
  buyer_type: string;
  visual_style: string;
  brand_colors: string[];
};

export type PropertyDetails = {
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  neighborhood: string;
  target_buyer: string;
  key_features: string;
};

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project yet.");
  return key;
}

function gatewayError(status: number, body: string): Error {
  if (status === 429) return new Error("Too many requests right now — try again in a moment.");
  if (status === 402) return new Error("AI credits are exhausted. Add credits to keep generating.");
  if (status === 403) return new Error("AI access is blocked for this workspace.");
  return new Error(`AI request failed (${status}): ${body.slice(0, 200)}`);
}

export async function generateListingContent(voice: VoiceProfile, details: PropertyDetails) {
  const system = `You are the in-house copywriter for ${voice.name || "a real estate agent"}${
    voice.brokerage ? ` at ${voice.brokerage}` : ""
  }. Write strictly in their brand voice.
Tone attributes: ${voice.tone_tags.join(", ") || "professional, warm"}.
Primary audience: ${voice.buyer_type || "general buyers"}.
Never invent facts that were not provided. No emojis in the listing description. Avoid clichés like "must see" and "hidden gem".
Return ONLY minified JSON with keys: title, description, social_caption, follow_up_email.
- title: a short punchy listing headline (max 8 words).
- description: 150-220 word MLS-ready listing description.
- social_caption: Instagram/Facebook caption, 40-70 words, 3-5 relevant hashtags at the end, tasteful emoji use allowed.
- follow_up_email: a warm follow-up email to an interested lead, with a "Subject:" first line, 120-160 words, signed off by the agent.`;

  const user = `Property type: ${details.property_type}
Bedrooms: ${details.bedrooms}
Bathrooms: ${details.bathrooms}
Price: ${details.price}
Neighborhood: ${details.neighborhood}
Target buyer: ${details.target_buyer}
Key features: ${details.key_features}`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("The AI returned an unexpected format. Please try generating again.");
  }

  return {
    title: String(parsed["title"] ?? details.neighborhood),
    description: String(parsed["description"] ?? ""),
    social_caption: String(parsed["social_caption"] ?? ""),
    follow_up_email: String(parsed["follow_up_email"] ?? ""),
  };
}

export type NeighborhoodHighlights = { bullets: string[]; paragraph: string };

export async function generateNeighborhoodHighlights(input: {
  neighborhood: string;
  property_type: string;
  target_buyer: string;
}): Promise<NeighborhoodHighlights> {
  const system = `You are a local-area expert who advises real estate agents on neighborhood talking points.
Given a neighborhood name, produce realistic, locally-relevant highlights — draw on what is genuinely known about that area (its character, well-known amenities, school reputation, green space, dining and shopping corridors, transit and walkability).
If you are not confident about a specific named place, describe the area's typical character instead of inventing business or school names. Never fabricate specific statistics.
Return ONLY minified JSON with keys: bullets, paragraph.
- bullets: an array of 3-5 short talking points (max 18 words each) covering a mix of: nearby schools, parks/outdoor space, restaurants & shopping, walkability/commute, and the general character of the area (e.g. "quiet and family-friendly" vs "walkable and vibrant"). No numbering, no dashes, just the point text.
- paragraph: a natural-language 40-60 word paragraph that weaves the bullets into flowing prose suitable for appending to a listing description.`;

  const user = `Neighborhood: ${input.neighborhood}
Property type: ${input.property_type || "residential home"}
Target buyer: ${input.target_buyer || "general buyers"}`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("The AI returned an unexpected format. Please try generating again.");
  }

  const bullets = Array.isArray(parsed["bullets"])
    ? (parsed["bullets"] as unknown[]).map(String).filter((b) => b.trim().length > 0).slice(0, 5)
    : [];
  if (bullets.length === 0) throw new Error("No highlights were generated. Please try again.");

  return { bullets, paragraph: String(parsed["paragraph"] ?? bullets.join(" ")) };
}

export type MarketStats = {
  period: string;
  area: string;
  median_price: string;
  days_on_market: string;
  inventory: string;
  notes: string;
};

export async function generateMarketNewsletter(voice: VoiceProfile, stats: MarketStats) {
  const system = `You are the in-house copywriter for ${voice.name || "a real estate agent"}${
    voice.brokerage ? ` at ${voice.brokerage}` : ""
  }. Write strictly in their brand voice.
Tone attributes: ${voice.tone_tags.join(", ") || "professional, warm"}.
Primary audience: ${voice.buyer_type || "local homeowners and buyers"}.
Turn raw market statistics into a client-friendly monthly market update newsletter. Interpret what the numbers mean for readers in plain language — never just restate stats. Never invent statistics beyond what was provided; you may add general, clearly-framed context (e.g. seasonal patterns) but no fabricated figures.
Return ONLY minified JSON with keys: subject, body.
- subject: a short email subject line for the newsletter (max 10 words).
- body: the newsletter body, 220-320 words, plain text with short paragraphs separated by blank lines. Structure: a warm opening line, what the numbers mean for buyers, what they mean for sellers, and a closing invitation to reply or call. No emojis, no markdown formatting, no bullet characters.`;

  const user = `Period: ${stats.period}
Area: ${stats.area}
Median price: ${stats.median_price || "not provided"}
Days on market: ${stats.days_on_market || "not provided"}
Inventory: ${stats.inventory || "not provided"}
Agent notes: ${stats.notes || "none"}`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("The AI returned an unexpected format. Please try generating again.");
  }

  const subject = String(parsed["subject"] ?? `${stats.period} market update`);
  const body = String(parsed["body"] ?? "");
  if (!body.trim()) throw new Error("No newsletter was generated. Please try again.");

  return { subject, body };
}

const STYLE_HINTS: Record<string, string> = {
  Minimal: "airy minimalist composition, generous white space, thin type, muted palette",
  Bold: "high contrast blocks, oversized condensed type, confident graphic shapes",
  Luxury: "editorial luxury magazine feel, deep tones, refined serif type, subtle gold rule lines",
  Warm: "sun-warmed natural light, earthy textures, friendly rounded type",
};

export async function generateListingImage(voice: VoiceProfile, details: PropertyDetails) {
  const [c1, c2] = voice.brand_colors;
  const prompt = `A polished real estate social media graphic (square) promoting a listing.
Photographic hero image of a ${details.property_type.toLowerCase()} in ${details.neighborhood}, ${details.key_features}.
Overlay a clean brand banner with the text "${details.neighborhood}" and "${details.bedrooms} BD · ${details.bathrooms} BA · ${details.price}".
Visual style: ${STYLE_HINTS[voice.visual_style] ?? STYLE_HINTS["Minimal"]}.
Brand colors: ${c1 ?? "#12233F"} and ${c2 ?? "#C4653A"}. Professional real estate marketing, crisp legible typography, no watermarks, no gibberish text.`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey() },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const dataUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) throw new Error("The image could not be generated. Please try again.");

  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
