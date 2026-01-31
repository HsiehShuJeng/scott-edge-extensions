export const styles = {
    bright_enterprise: {
        label: "Bright Enterprise",
        description: "Clean, professional aesthetic with high contrast and plenty of whitespace. Ideal for corporate presentations and data-heavy reports.",
        previewColors: ["#F6F4EF", "#1A1D21", "#2F6FED", "#16A3A5"],
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Bright Enterprise**
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
        description: "Modern translucent layers with background blur effects. Adds depth and sophistication to any topic.",
        previewColors: ["#000000", "#1A1A1A", "#FFFFFF", "#333333"],
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
        description: "Cozy, minimal, and inviting. Features soft beige tones and simple typography, perfect for lifestyle or educational content.",
        previewColors: ["#FAFAF5", "#37352F", "#EBECED", "#E3E2E0"],
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Warm Cream**
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
        description: "Fresh and innovative. Uses crisp whites and vibrant aqua accents to convey modernity and technological advancement.",
        previewColors: ["#FFFFFF", "#0F172A", "#06B6D4", "#E2E8F0"],
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Clean Tech Aqua**
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
        description: "Elegant dark mode with gold accents. Exudes exclusivity and premium quality, suitable for high-end products.",
        previewColors: ["#121212", "#E0E0E0", "#D4AF37", "#1E1E1E"],
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Luxury Noir**
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
        description: "Dreamy and creative. Combines soft lavender layouts with vibrant violet accents for a unique, artistic vibe.",
        previewColors: ["#EEEAF6", "#221828", "#6D4AFF", "#E255A1"],
        prompt: `* Aesthetic: frugal and uncluttered; no visual noise, every element must feel intentional and functional.
* Color palette:
  * Overall theme: **Twilight Violet**
  * Background: **soft lavender-gray (#EEEAF6)**
  * Panels: **white (#FFFFFF)** with **12–20%** translucency
  * Primary text: **dark plum (#221828)**, Secondary text: **muted purple-gray (#6A5F74)**
  * Accent 1: **violet (#6D4AFF)**
  * Accent 2: **rose (#E255A1)**
  * Borders & grid: **light mauve-gray (#CFC3DA)**
  * Glow rule: **No glow on text; accent glow only on icons**`,
    },
    neon_cyberpunk: {
        label: "Neon Cyberpunk",
        description: "High-contrast dark mode with glowing accents. Perfect for futuristic, tech-heavy, or nightlife themes.",
        previewColors: ["#0B0C15", "#00F3FF", "#FF00AA", "#FAFF00"],
        prompt: `* Aesthetic: high-contrast, futuristic, gritty yet polished; think "Blade Runner 2049" meets high-end UI design.
* Color palette:
  * Overall theme: **Neon Cyberpunk**
  * Background: **deep void black (#0B0C15)**
  * Panels: **semi-transparent dark glass (#1A1B2E)** with neon borders
  * Primary text: **electric white (#FFFFFF)** with slight glow
  * Accent 1: **cyan laser (#00F3FF)**
  * Accent 2: **hot pink (#FF00AA)**
  * Accent 3: **acid yellow (#FAFF00)** for warnings/highlights
  * Typography: **Monospaced headers** paired with clean sans-serif body
  * Glow rule: **Strong bloom/glow on all accent elements and charts**`,
    },
    minimalist_swiss: {
        label: "Minimalist Swiss",
        description: "Bold typography and grid-based layout. Focuses on clarity, negative space, and objective information.",
        previewColors: ["#FFFFFF", "#000000", "#FF4040", "#F0F0F0"],
        prompt: `* Aesthetic: International Typographic Style; grid-based, asymmetric layouts, prioritizing negative space and bold typography.
* Color palette:
  * Overall theme: **Minimalist Swiss**
  * Background: **pure matte white (#FFFFFF)**
  * Panels: **none** (use whitespace and heavy dividers to separate content)
  * Primary text: **stark black (#000000)**
  * Accent 1: **Swiss red (#FF4040)** for key emphasis only
  * Accent 2: **concrete gray (#F0F0F0)** for subtle structure
  * Borders & grid: **thick black lines** for structural definition
  * Typography: **Helvetica/grotesque fonts**, massive headers, tight kerning
  * Glow rule: **Zero glow, flat design only**`,
    },
    cinematic_nature: {
        label: "Cinematic Nature",
        description: "Earthy tones and organic textures. Inspired by high-end travel photography and nature documentaries.",
        previewColors: ["#2C3632", "#E8F1F2", "#D4A373", "#606C38"],
        prompt: `* Aesthetic: organic, calm, and grounded; inspired by National Geographic photography and high-end travel journals.
* Color palette:
  * Overall theme: **Cinematic Nature**
  * Background: **deep slate green (#2C3632)**
  * Panels: **translucent parchment (#E8F1F2)** with 90% opacity
  * Primary text: **charcoal (#1F2421)**
  * Secondary text: **slate gray (#4A5568)**
  * Accent 1: **sandstone gold (#D4A373)**
  * Accent 2: **moss green (#606C38)**
  * Accent 3: **mist blue (#A3B8C2)**
  * Typography: **Elegant serif headers** paired with humanist sans-serif
  * Glow rule: **Soft, diffused shadows only; no harsh neon**`,
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
const INSPIRATION_DATA = {
    "Ghost in the Shell": {
        introContext: "modern Cyberpunk UI and HUD design",
        uiStyleLine: "* UI style inspired by *Ghost in the Shell* HUD: flat, sharp, disciplined, less fantasy ornament and more modern interface design."
    },
    "Final Fantasy VIII": {
        introContext: "modern JRPG UI and HUD design",
        uiStyleLine: "* UI style inspired by *Final Fantasy VIII* HUD: flat, sharp, disciplined, less fantasy ornament and more modern interface design."
    },
    "Neon Genesis Evangelion": {
        introContext: "retro-futuristic industrial UI",
        uiStyleLine: "* UI style inspired by *Neon Genesis Evangelion* MAGI System: high-contrast black/amber/orange palette, hexagonal patterns, bold Mincho typography, scanning lines, warning stripes, and brutalist data density."
    },
    "Studio Ghibli": {
        introContext: "hand-painted artistic presentation",
        uiStyleLine: "* Visual style inspired by *Studio Ghibli* backgrounds: soft watercolor textures, lush natural palettes, hand-painted aesthetic, organic shapes, and warm, inviting lighting. Less digital, more artisanal."
    },
    "Persona 5": {
        introContext: "rebellious punk-pop UI",
        uiStyleLine: "* UI style inspired by *Persona 5*: high-speed, chaotic yet stylish, jagged edges, heavy black/red/white contrast, comic-book aesthetic, dynamic angles, and ransom-note typography."
    },
    "Akira": {
        introContext: "gritty neo-Tokyo cyberpunk",
        uiStyleLine: "* UI style inspired by *Akira*: analog data screens, light trails, gritty CRT effects, clinical green/red readouts, mechanical schematics, and detailed motor-function displays."
    },
    "Demon Slayer": {
        introContext: "Taisho-era Japanese traditional pattern",
        uiStyleLine: "* Visual style inspired by *Demon Slayer (Kimetsu no Yaiba)*: traditional Japanese patterns (Wagara), ink wash effects (Sumi-e), bold calligraphy, and distinct elemental color motifs (checkers, waves, flames)."
    }
};

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
    const inspirationConfig = INSPIRATION_DATA[artReference];

    // 1. Handle UI Style Line injection
    if (inspirationConfig) {
        // Global injection: Prepend the inspired UI style line to ANY style
        styleDescription = `${inspirationConfig.uiStyleLine}\n${styleDescription}`;
    } else if (styleKey === 'frosted_glass' && selectedStyle.baseDescription) {
        // Fallback for Frosted Glass when NO inspiration is selected
        // It needs its default header to make sense
        styleDescription = `* UI style: ${selectedStyle.baseDescription}\n${styleDescription}`;
    }

    // 2. Handle Intro Text
    let promptIntro = "";

    if (inspirationConfig) {
        // Rich Intro with Inspiration
        const introContext = inspirationConfig.introContext;
        const refName = artReference; // Use the exact dropdown value

        let contextPrefix = "";
        if (userText && userText.trim().length > 0) {
            contextPrefix = `${userText.trim()}\n\n`;
            promptIntro = `${contextPrefix}Create a clean, minimalist, enterprise-grade infographic inspired by ${introContext}, similar to '${refName}'. The overall look should feel aesthetic, embodying modernization: visually simple at first glance, but with careful, elegant detail that reflects a professional designer’s touch.`;
        } else {
            // Empty user text case (still uses Rich Intro structure)
            promptIntro = `Create a clean, minimalist, enterprise-grade infographic inspired by ${introContext}, similar to '${refName}'. The overall look should feel aesthetic, embodying modernization: visually simple at first glance, but with careful, elegant detail that reflects a professional designer’s touch.`;
        }

        // Add "about the above information" if context exists
        if (contextPrefix) {
            promptIntro = promptIntro.replace("infographic inspired", "infographic about the above information, inspired");
        }

    } else {
        // Standard Intro (No Inspiration)
        if (userText && userText.trim().length > 0) {
            promptIntro = `${userText.trim()}\n\nCreate a clean, minimalist, enterprise-grade infographic about the above information.`;
        } else {
            promptIntro = "Create a clean, minimalist, enterprise-grade infographic.";
        }
    }

    return `${promptIntro}

${styleDescription}

${LANGUAGE_REQUIREMENT}`;
}
