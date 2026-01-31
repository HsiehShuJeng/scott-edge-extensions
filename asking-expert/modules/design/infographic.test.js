import { describe, it, expect } from "vitest";
import { generatePrompt, styles } from "./infographic";

describe("Infographic Prompt Generator", () => {
    it("should generate a prompt with the bright_enterprise style", () => {
        const styleKey = "bright_enterprise";
        const userText = "Quarterly Results";
        const result = generatePrompt(styleKey, userText);

        expect(result).toContain('Create a clean, minimalist, enterprise-grade infographic about: "Quarterly Results"');
        expect(result).toContain("Overall theme: **Bright Enterprise**");
        expect(result).toContain("Language requirement:");
        expect(result).toContain("Traditional Chinese");
    });

    it("should generate a prompt with the frosted_glass style", () => {
        const styleKey = "frosted_glass";
        const userText = "AI Architecture";
        const result = generatePrompt(styleKey, userText);

        expect(result).toContain('Create a clean, minimalist, enterprise-grade infographic about: "AI Architecture"');
        expect(result).toContain("UI style inspired by *Ghost in the Shell* HUD");
        expect(result).toContain("Overall theme: **Frosted Glass**");
    });

    it("should fall back to user text only if style is not found", () => {
        const styleKey = "non_existent_style";
        const userText = "Just some text";
        const result = generatePrompt(styleKey, userText);

        expect(result).toBe("Just some text");
    });

    it("should include the language requirement in all valid generated prompts", () => {
        const styleKey = "luxury_noir";
        const userText = "Premium Service";
        const result = generatePrompt(styleKey, userText);

        expect(result).toContain("**Language requirement:**");
        expect(result).toContain("Traditional Chinese");
    });
});
