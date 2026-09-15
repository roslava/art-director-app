import { projectSchema, type Project } from "@/domain/schemas";

const now = "2026-09-15T09:00:00.000Z";
const base = { shotPlanId: "plan-chrysoberyl", generatedAssets: [] };

const shot = (id: string, title: string, purpose: string, shotType: string, lighting: string, composition: string, prompt: string, status: "draft" | "ready" | "review") => ({
  ...base, id, title, purpose, shotType, lighting, composition, generationPrompt: prompt, status,
  subjectState: "Natural chrysoberyl specimen, preserving believable mineral structure.",
  background: "Quiet neutral studio sweep.", cameraNotes: "Close catalog framing with factual material detail.",
  emphasize: ["crystal geometry", "olive-to-honey color", "natural surface variation"],
  avoid: ["neon green", "perfect glass", "generic luxury jewelry styling"],
});

export const samotsvetyProject: Project = projectSchema.parse({
  id: "project-samotsvety", name: "Samotsvety", description: "A visual catalog of mineral specimens, built for close observation.", createdAt: now, updatedAt: now,
  exportTargets: [{ id: "export-web", projectId: "project-samotsvety", name: "Catalog web image", format: "WebP", dimensions: "2400 × 3000 px", colorSpace: "sRGB", status: "draft" }],
  subjects: [{
    id: "subject-chrysoberyl", projectId: "project-samotsvety", name: "Chrysoberyl", description: "A hard beryllium aluminium oxide mineral valued for distinct crystal forms and optical presence.", createdAt: now, updatedAt: now,
    research: {
      id: "research-chrysoberyl", subjectId: "subject-chrysoberyl", summary: "A factual reference for depicting chrysoberyl as a mineral specimen rather than a generalized green gemstone.", identity: "Chrysoberyl", materialType: "Beryllium aluminium oxide mineral", dominantColors: ["yellow-green", "olive", "honey", "warm brown"], transparency: "Transparent to translucent; often uneven through a natural specimen.", crystalHabit: "Prismatic or tabular, with crisp faces and striations; twinning may occur.", opticalCharacteristics: ["Vitreous luster on clean crystal faces", "Translucent zones glow warmly when backlit", "Subtle color zoning"], structuralCharacteristics: ["Well-defined orthorhombic geometry", "Natural joins and matrix can interrupt clean faces"], visualRisks: ["Avoid saturated emerald-green generic gem imagery.", "Do not make every surface perfectly polished or transparent.", "Avoid glassy, melted crystal forms."], visualFacts: [{ id: "fact-luster", label: "Luster", detail: "Vitreous on fresh crystal faces.", confidence: "verified", source: "Mock catalog research" }], createdAt: now, updatedAt: now,
    },
    shotPlans: [{ id: "plan-chrysoberyl", subjectId: "subject-chrysoberyl", title: "Chrysoberyl catalog study", creativeDirection: "Quiet, precise specimen photography that makes material truth feel collectible.", createdAt: now, updatedAt: now, shots: [
      shot("shot-raw-crystal", "Raw crystal", "Establish the specimen’s natural form and scale.", "hero specimen portrait", "Large soft key from upper left with restrained fill.", "Centered vertical portrait with ample negative space.", "Museum-grade mineral catalog photograph of a single natural chrysoberyl crystal, upright on warm off-white seamless paper, yellow-green to honey tones, crisp prismatic faces and subtle surface striations, soft upper-left studio light, quiet negative space, highly factual material rendering.", "ready"),
      shot("shot-aggregate", "Crystal aggregate", "Show how multiple crystals relate in a natural cluster.", "contextual specimen study", "Soft side light with a gentle rim to separate forms.", "Three-quarter view, cluster low and slightly right of center.", "Natural chrysoberyl crystal aggregate photographed as a mineral catalog specimen, multiple intergrown yellow-green and honey prismatic crystals with subtle matrix traces, three-quarter view on a muted stone-gray sweep, soft side light, authentic irregular contact points.", "draft"),
      shot("shot-translucency", "Backlit translucency", "Reveal warmth and uneven translucency inside the material.", "material behavior study", "Diffused backlight with minimal frontal fill.", "Tight horizontal crop with the brightest area offset from center.", "Macro mineral photograph of a natural chrysoberyl crystal’s translucent zone, diffused backlight creating a restrained warm honey and yellow-green internal glow, crisp prismatic edges, visible uneven color zoning, charcoal-to-black background, scientific catalog precision.", "ready"),
      shot("shot-structure", "Structural detail", "Document face striations, joins, and natural texture.", "macro structural detail", "Low-angle grazing side light.", "Diagonal facet lines traverse the frame.", "High-magnification macro photograph of chrysoberyl crystal structure: natural prismatic face striations, crisp facet transitions, a small irregular contact edge, olive-honey mineral color, low-angle grazing studio light, restrained neutral gray bokeh.", "review"),
      shot("shot-faceted", "Faceted specimen", "Contrast a cut stone’s clarity with the raw material study.", "cut material portrait", "Controlled broad highlights with soft shadow definition.", "Low three-quarter angle with a modest reflection beneath.", "Refined catalog portrait of a single faceted chrysoberyl specimen on pale warm gray acrylic, yellow-green body color with honey undertones, precise facet geometry and controlled broad studio highlights, mineral-study sensibility rather than luxury jewelry advertising.", "draft"),
    ] }],
  }],
});
