import { OpenAIResearchAgent } from "../src/domain/agents/openai/research-agent";
import { OpenAIResearchProvider } from "../src/domain/providers/openai/research-provider";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const subjectName = process.argv.slice(2).join(" ").trim() || "Mookaite";
const subjectId = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "research-subject";

const printList = (title: string, entries: string[]) => {
  console.log(`\n${title}`);
  if (!entries.length) console.log("None returned.");
  else entries.forEach((entry) => console.log(`- ${entry}`));
};

const run = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Create .env.local from .env.example and add your server-side key.");
  }

  const provider = new OpenAIResearchProvider();
  const agent = new OpenAIResearchAgent(provider);
  const result = await agent.research({
    subject: { id: subjectId, name: subjectName, description: `Visual research subject: ${subjectName}.` },
  }, { requestId: `openai-research-${subjectId}` });
  const report = result.data;

  console.log(`Subject: ${subjectName}`);
  console.log(`\nClaims: ${report.claims.length}`);
  console.log(`Visual properties: ${report.visualProperties.length}`);
  console.log(`Opportunities: ${report.opportunities.length}`);
  console.log(`Risks: ${report.risks.length}`);
  console.log(`Sources: ${report.sources.length}`);
  printList("VISUAL PROPERTIES", report.visualProperties.map((property) => `${property.name}: ${property.description}`));
  printList("OPPORTUNITIES", report.opportunities.map((opportunity) => opportunity.description));
  printList("RISKS", report.risks.map((risk) => `${risk.description} — ${risk.reason}`));
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "OpenAI research demo failed.");
  process.exitCode = 1;
});
