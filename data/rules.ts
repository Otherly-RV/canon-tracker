
// This file contains the complete schema, completeness logic, and per-field rules.

// -----------------------------
// Types & Structure
// -----------------------------
export type Level = "L1" | "L2" | "L3";
export type Domain = "OVERVIEW" | "CHARACTERS" | "WORLD" | "LORE" | "STYLE" | "STORY";
export type ChecklistLeaf = readonly string[];
export type ChecklistNode = { readonly [k: string]: ChecklistLeaf | ChecklistNode };

export const COMPLETENESS_FIELD_CHECKLIST = {
  L1: { 
    OVERVIEW: ["KeyArtPoster"],
    CHARACTERS: ["KeyArtPoster"],
    WORLD: ["KeyArtPoster"],
    LORE: ["KeyArtPoster"],
    STYLE: ["KeyArtPoster"],
    STORY: ["KeyArtPoster"],
  },
  L2: {
    OVERVIEW: ["IPTitle", "Logline", "NarrativeEngine", "Tone", "MainCharacter", "Antagonist", "TheWorld"],
    CHARACTERS: { Character: { Name: ["Name"], Aliases: ["Aliases"], StoryFunctionTags: ["StoryFunctionTags"], Headline: ["Headline"] } },
    WORLD: { Locations: { Location: { Name: ["Name"], Setting: ["Setting"], Position: ["Position"], ShortDescription: ["ShortDescription"] } } },
    LORE: { LorePremise: ["Text"], HistoryTimeline: ["Text"], TechMagicPhysicsRules: ["Text"], PowerStructuresFactions: ["Text"], CultureEverydayLife: ["Text"], MythsLegends: ["Text"] },
    STYLE: {
      VisualStyle: ["StyleSummary", "KeyCharacteristics", "StyleElements"],
      ColorPalette: ["PaletteSummary", "ColorRules", "UsageExamples"],
      TextureMaterialLanguage: ["MaterialSummary", "SurfaceRules"],
      Composition: ["FramingGrid", "DepthStacking", "FocusSubjectHierarchy"],
    },
    STORY: {
      CanonTimelineTable: { Beat: ["TimeMarker", "EventTitle", "Summary"] },
      ArcMap: { Arc: ["ArcName", "StartState", "EndState"] },
      POVStructureRules: ["POVStrategy", "TimelinePattern", "AccessRules"],
      CharacterArcsGridLeads: { Row: ["Character", "StartState", "EndState"] },
    },
  },
  L3: {
    OVERVIEW: { Note: ["L3 has no specific OVERVIEW fields; it builds on L2."] },
    CHARACTERS: { Character: { SummaryBox: ["ProfileText"], Visual: ["AgeRange", "BodyType", "KeyFacialPhysicalTraits"], BehaviourRules: ["CoreMotivations", "CoreFearsVulnerabilities"] } },
    WORLD: { Locations: { Location: { SummaryBox: ["Summary"] } } },
    LORE: {
      Timeline: ["Timeline"],
      Factions: { Faction: { SummaryBox: ["ProfileText"], IngredientChecklist: ["IdentityMyth", "PowerMethods"] } },
    },
    STYLE: {
      VisualIconography: ["IconSummary", "MotifList", "ShapeLanguage"],
      CameraAngle: ["DefaultShotLanguage", "NamedAngles", "MovementTendencies"],
      Lighting: ["BaseLightingMood", "ContrastShadowRules", "LightSourceLogic"],
    },
    STORY: {
      OverallIPNarrative: ["Text"],
      MasterTimeline: { Beat: ["TimeMarker", "EventTitle", "Summary", "Dependencies"] },
      FormatNarrative: ["FormatType", "EpisodeCountOrLength", "StructureRules"],
      EpisodePack: { Episode: ["EpisodeId", "Title", "Logline", "BeatSheet"] },
    },
  },
} as const;

// -----------------------------
// Initial Data for Detailed Rules & Limits
// This data will be loaded into state and become editable.
// -----------------------------
export type LimitSpec = { wordLimit?: number; tokenLimit?: number; };

export const INITIAL_LIMITS = {
  L2_TINY: { wordLimit: 8, tokenLimit: 24 },
  L2_SHORT: { wordLimit: 20, tokenLimit: 60 },
  L2_MED: { wordLimit: 45, tokenLimit: 120 },
  L2_LONG: { wordLimit: 90, tokenLimit: 220 },
};

export const INITIAL_RULES_L2_OVERVIEW_FIELDS = {
  IPTitle: { rule: "Short; memorable; genre-fit; no spoilers.", limit: INITIAL_LIMITS.L2_TINY },
  Logline: { rule: "Hero + goal + opposition + stakes + hook.", limit: INITIAL_LIMITS.L2_MED },
  NarrativeEngine: { rule: "Repeatable conflict loop + escalation rule + what sustains it.", limit: INITIAL_LIMITS.L2_MED },
  Tone: { rule: "Plain words; consistent; 2–3 comps max; no mixed signals.", limit: INITIAL_LIMITS.L2_SHORT },
  MainCharacter: { rule: "Macro only: role + contradiction + drive/need/ghost.", limit: INITIAL_LIMITS.L2_LONG },
  Antagonist: { rule: "Macro only: motivation + method + escalation; pressure on hero.", limit: INITIAL_LIMITS.L2_LONG },
  TheWorld: { rule: "Macro only: vibe + logic; what’s normal; what’s impossible.", limit: INITIAL_LIMITS.L2_MED },
};

export const INITIAL_RULE_L2_CHARACTERS_CARD = `AI Instruction: For the character's Headline, provide a short, punchy summary of their core identity. ${limitLine(INITIAL_LIMITS.L2_SHORT)}`;
export const INITIAL_RULE_L2_LOCATIONS_CARD = `AI Instruction: For the location's ShortDescription, provide a vivid, concise summary. ${limitLine(INITIAL_LIMITS.L2_MED)}`;

// This object contains all the editable data parts of the rules.
export const INITIAL_FIELD_RULES = {
    LIMITS: INITIAL_LIMITS,
    RULES_L2_OVERVIEW_FIELDS: INITIAL_RULES_L2_OVERVIEW_FIELDS,
    RULE_L2_CHARACTERS_CARD: INITIAL_RULE_L2_CHARACTERS_CARD,
    RULE_L2_LOCATIONS_CARD: INITIAL_RULE_L2_LOCATIONS_CARD,
};

// -----------------------------
// Static Helper Functions (Not editable in UI)
// -----------------------------
export function limitLine(l: LimitSpec): string {
  const parts: string[] = [];
  if (typeof l.wordLimit === "number") parts.push(`Max ${l.wordLimit} words`);
  return parts.length ? `(${parts.join(" / ")})` : "";
}

export function getStaticChecklist(node: ChecklistNode | ChecklistLeaf, prefix = ""): string[] {
  const out: string[] = [];
  if (Array.isArray(node)) {
    for (const field of node) out.push(`${prefix}.${field}`);
    return out;
  }
  for (const [k, v] of Object.entries(node)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (k === 'Character' || k === 'Location') continue;
    if (Array.isArray(v)) {
      for (const field of v) out.push(`${next}.${field}`);
    } else {
      out.push(...getStaticChecklist(v as ChecklistNode, next));
    }
  }
  return out;
}
