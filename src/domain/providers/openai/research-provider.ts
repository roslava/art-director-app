import "server-only";
import OpenAI from "openai";
import type { Response, ResponseOutputItem } from "openai/resources/responses/responses";
import type { ProviderResearchReference, ResearchProvider, ResearchProviderRequest, ResearchProviderResult } from "@/domain/providers";

const model = "gpt-5.5";

const researchInstructions = [
  "Research the supplied subject for a visual art director, not as an encyclopedia entry.",
  "Use web search and favor primary, museum, geological, scientific, or specialist references where available.",
  "Cover only relevant properties: identity/material, appearance, colour, transparency, surface/fracture, texture/pattern/zoning, geometry, luster/reflection, inclusions, finish states, lighting changes, context, and misleading depictions.",
  "State uncertainty and conflicts explicitly. Do not manufacture citations, URLs, or claims unsupported by the sources you found.",
].join(" ");

const referenceId = (index: number) => `openai-web-source-${index + 1}`;

const citationsFrom = (item: ResponseOutputItem): ProviderResearchReference[] => {
  if (item.type !== "message") return [];

  return item.content.flatMap((content) => {
    if (content.type !== "output_text") return [];
    return content.annotations.flatMap((annotation) => annotation.type === "url_citation"
      ? [{ id: "", title: annotation.title, url: annotation.url, citation: `OpenAI web-search citation: ${annotation.title}` }]
      : []);
  });
};

const referencesFrom = (response: Response): ProviderResearchReference[] => {
  const cited = response.output.flatMap(citationsFrom);
  const searched = response.output.flatMap((item) => item.type === "web_search_call" && item.action.type === "search"
    ? (item.action.sources ?? []).map((source) => ({ id: "", title: source.url, url: source.url, citation: "OpenAI web-search source." }))
    : []);
  const unique = new Map<string, ProviderResearchReference>();

  for (const source of [...cited, ...searched]) {
    if (source.url && !unique.has(source.url)) unique.set(source.url, source);
  }

  return [...unique.values()].map((source, index) => ({ ...source, id: referenceId(index) }));
};

/** Server-only adapter that obtains cited, unstructured research. It does not create domain reports. */
export class OpenAIResearchProvider implements ResearchProvider {
  private readonly client: OpenAI;

  constructor(client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required to run real OpenAI research. Add it to .env.local before running the demo.");
    }
    this.client = client;
  }

  async research(request: ResearchProviderRequest): Promise<ResearchProviderResult> {
    const response = await this.client.responses.create({
      model,
      instructions: researchInstructions,
      input: [
        `Subject: ${request.subject.name}`,
        `Description: ${request.subject.description}`,
        request.instructions?.length ? `Requested scope: ${request.instructions.join("; ")}` : "",
      ].filter(Boolean).join("\n"),
      tools: [{ type: "web_search", search_context_size: "medium" }],
      include: ["web_search_call.action.sources"],
    });

    if (!response.output_text.trim()) {
      throw new Error(`OpenAI research returned no usable text for ${request.subject.name}.`);
    }

    return {
      rawResearch: [response.output_text],
      references: referencesFrom(response),
      metadata: { implementation: "openai", responseId: response.id, model: response.model, subjectId: request.subject.id },
      usage: response.usage ? { inputUnits: response.usage.input_tokens, outputUnits: response.usage.output_tokens, totalUnits: response.usage.total_tokens } : undefined,
    };
  }
}
