export const styles = {
    bright_enterprise: {
        label: "Bright Enterprise",
        previewColors: ["#F6F4EF", "#1A1D21", "#2F6FED", "#16A3A5"],
        prompt: `* Overall theme: **Bright Enterprise**
* Background: **warm off-white (#F6F4EF)**
* Panels: **soft light gray (#FFFFFF / #F1F2F4)** with **8–14%** translucency
* Primary text: **near-black (#1A1D21)**, Secondary text: **cool gray (#5B6472)**
* Accent 1: **azure blue (#2F6FED)**
* Accent 2: **teal (#16A3A5)**
* Borders & grid: **light graphite (#C9CED6)**
* Glow rule: **No glow on text; micro-glow only on accent lines/icons**`,
    },
    frosted_glass: {
        label: "Frosted Glass",
        previewColors: ["#ECEFF3", "#22252B", "#39B5E0", "#7C6EE6"],
        // Prompt template with placeholder or split parts could be used, 
        // but here we will handle the dynamic first line in generatePrompt
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Frosted Glass**
  * Background: **mist gray (#ECEFF3)**
  * Panels: **frosted white (#FFFFFF)** with **18–28%** translucency, subtle blur *only inside panels*
  * Primary text: **ink gray (#22252B)**, Secondary text: **slate (#667085)**
  * Accent 1: **cool cyan (#39B5E0)**
  * Accent 2: **soft violet (#7C6EE6)**
  * Borders & grid: **silver (#B8C0CC)**
  * Glow rule: **Very restrained; thin accent glow around key connectors only**

* Use thin-line frames, subtle grid hints, and very restrained glow only on key elements (title, important connectors, or icons).

**Iconography and typography:**
* Use simple, glyph-like icons`,
        baseDescription: "flat, sharp, disciplined, less fantasy ornament and more modern interface design."
    },
    warm_cream: {
        label: "Warm Cream",
        previewColors: ["#F3EFE6", "#2A221C", "#D77A2B", "#6FA37A"],
        prompt: `* Overall theme: **Warm Cream**
* Background: **cream (#F3EFE6)**
* Panels: **ivory (#FFF9EF)** with **10–16%** translucency
* Primary text: **espresso (#2A221C)**, Secondary text: **warm gray (#6E625A)**
* Accent 1: **burnt orange (#D77A2B)**
* Accent 2: **sage green (#6FA37A)**
* Borders & grid: **linen gray (#CFC6B8)**
* Glow rule: **No neon; use subtle highlight strokes instead**`,
    },
    clean_tech_aqua: {
        label: "Clean Tech Aqua",
        previewColors: ["#EAF7F7", "#0B1F33", "#00A6A6", "#2D7FF9"],
        prompt: `* Overall theme: **Clean Tech Aqua**
* Background: **very light aqua (#EAF7F7)**
* Panels: **white (#FFFFFF)** with **8–12%** translucency
* Primary text: **deep navy (#0B1F33)**, Secondary text: **steel (#4F6272)**
* Accent 1: **aqua (#00A6A6)**
* Accent 2: **electric blue (#2D7FF9)**
* Borders & grid: **pale blue-gray (#BFD4DA)**
* Glow rule: **Tiny glow on accent icons only; keep lines crisp**`,
    },
    luxury_noir: {
        label: "Luxury Noir",
        previewColors: ["#0B0D12", "#F2F4F7", "#D6B25E", "#67D7E5"],
        prompt: `* Overall theme: **Luxury Noir**
* Background: **deep ink (#0B0D12)** with subtle gradient
* Panels: **charcoal glass (#151A22)** with **12–18%** translucency
* Primary text: **off-white (#F2F4F7)**, Secondary text: **cool gray (#A7B0BE)**
* Accent 1: **champagne gold (#D6B25E)**
* Accent 2: **icy cyan (#67D7E5)**
* Borders & grid: **graphite (#2B3442)**
* Glow rule: **Gold glow only on title + one focal connector**`,
    },
    twilight_violet: {
        label: "Twilight Violet",
        previewColors: ["#EEEAF6", "#221828", "#6D4AFF", "#E255A1"],
        prompt: `* Overall theme: **Twilight Violet**
* Background: **soft lavender-gray (#EEEAF6)**
* Panels: **white (#FFFFFF)** with **12–20%** translucency
* Primary text: **dark plum (#221828)**, Secondary text: **muted purple-gray (#6A5F74)**
* Accent 1: **violet (#6D4AFF)**
* Accent 2: **rose (#E255A1)**
* Borders & grid: **light mauve-gray (#CFC3DA)**
* Glow rule: **No glow on text; accent glow only on icons**`,
    },
};

const LANGUAGE_REQUIREMENT = `
**Language requirement:**

* All visible text in the infographic (titles, headings, labels, short descriptions) must be presented in **Traditional Chinese**, localized with phrasing and tone that feel natural to readers in Taiwan and appropriate for a professional, modern tech context.
`;

/**
 * Generates a prompt string based on the selected style and user input.
 * @param {string} styleKey - The key of the selected style.
 * @param {string} userText - The text content provided by the user.
 * @param {string} [artReference] - Optional artistic reference (e.g., "Ghost in the Shell").
 * @returns {string} The formatted prompt string.
 */
export function generatePrompt(styleKey, userText, artReference) {
    const selectedStyle = styles[styleKey];

    if (!selectedStyle) {
        return userText;
    }

    let styleDescription = selectedStyle.prompt;

    // Special handling for Frosted Glass dynamic header
    if (styleKey === 'frosted_glass' && selectedStyle.baseDescription) {
        let referencePart = "";
        if (artReference && artReference !== "none") {
            referencePart = ` inspired by *${artReference}* HUD`;
        }

        const header = `* UI style${referencePart}: ${selectedStyle.baseDescription}`;
        styleDescription = `${header}\n${styleDescription}`;
    }

    let promptIntro = "";
    if (userText && userText.trim().length > 0) {
        promptIntro = `${userText.trim()}\n\nCreate a clean, minimalist, enterprise-grade infographic about the above information.`;
    } else {
        promptIntro = "Create a clean, minimalist, enterprise-grade infographic.";
    }

    return `${promptIntro}

${styleDescription}

${LANGUAGE_REQUIREMENT}`;
}
