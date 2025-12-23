
import { limitLine } from '../data/rules.ts';

function getSpecificRuleForPath(path: string, fieldRules: any): string {
    const parts = path.split('.');
    const level = parts[0];
    const domain = parts[1];
    const field = parts[parts.length - 1];

    const { 
        RULES_L2_OVERVIEW_FIELDS, 
        RULE_L2_CHARACTERS_CARD, 
        RULE_L2_LOCATIONS_CARD 
    } = fieldRules;

    if (level === 'L2') {
        if (domain === 'OVERVIEW' && RULES_L2_OVERVIEW_FIELDS?.[field]) {
            const ruleSet = RULES_L2_OVERVIEW_FIELDS[field];
            // Use the imported limitLine function with the rule's limit data
            return `Rule: ${ruleSet.rule} ${limitLine(ruleSet.limit)}`;
        }
        if (domain === 'CHARACTERS' && RULE_L2_CHARACTERS_CARD) {
            return RULE_L2_CHARACTERS_CARD;
        }
        if (domain === 'WORLD' && path.includes('Locations') && RULE_L2_LOCATIONS_CARD) {
            return RULE_L2_LOCATIONS_CARD;
        }
    }
    
    return `Generate a concise and clear entry for the field '${field}'.`;
}

export function buildFieldPrompt(fieldPath: string, documentText: string, execContractText: string, fieldRules: any): string {
    const specificRule = getSpecificRuleForPath(fieldPath, fieldRules);

    return `
${execContractText}

**TASK:**
You will generate the content for a single field in a canon bible: "${fieldPath}".
Your response must be ONLY the text content for this field. Do not add labels, titles, or markdown.

**SOURCE OF TRUTH (Hard Canon):**
---
${documentText.substring(0, 100000)}
---
(Note: Text may be truncated for brevity)

**SPECIFIC INSTRUCTIONS FOR THIS FIELD:**
---
${specificRule}
---

Based on the source document and the specific instructions, generate the content for the "${fieldPath}" field now. Remember, if no information is found, output an empty string.
`.trim();
}
