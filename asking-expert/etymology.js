// etymology.js
export async function fetchEtymologyExplanation(word) {
    const response = await fetch(`https://www.etymonline.com/search?q=${word}`);
    const html = await response.text();

    // Extract all etymology blocks and their part of speech
    const blockRegex = new RegExp(
        `<span[^>]*>${word}</span>\\s*<span[^>]*>\\(([^)]+)\\)</span>[\\s\\S]*?<section class="prose[^>]*>([\\s\\S]*?)<\\/section>`,
        "gi"
    );
    let blocks = [];
    let match;
    while ((match = blockRegex.exec(html)) !== null) {
        blocks.push({ pos: match[1], content: match[2] });
    }

    // Preferred order: noun, verb, adjective, else first
    const preferredOrder = ["n.", "v.", "adj."];
    let chosen = null;
    for (const pos of preferredOrder) {
        chosen = blocks.find(b => b.pos.replace(/\s/g, '') === pos.replace(/\s/g, ''));
        if (chosen) break;
    }
    if (!chosen && blocks.length > 0) {
        chosen = blocks[0];
    }

    // If no blocks found, fallback to the first etymology block
    if (!chosen) {
        const fallback = html.match(/<section class="prose[^>]*>([\s\S]*?)<\/section>/);
        if (fallback) {
            chosen = { pos: "unknown", content: fallback[1] };
        }
    }

    if (chosen) {
        // Extract all <p> and <blockquote> content within the section
        const sectionHtml = chosen.content;
        const pMatches = Array.from(sectionHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
        const blockquoteMatches = Array.from(sectionHtml.matchAll(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi));
        let text = '';
        for (const m of pMatches) {
            text += m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() + '\n';
        }
        for (const m of blockquoteMatches) {
            text += m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() + '\n';
        }
        text = text
            .replace(/"/g, '"')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/\s+\n/g, '\n')
            .trim();
        return {
            pos: chosen.pos,
            text: text.length > 0 ? text : 'No etymology explanation found.'
        };
    }
    return { pos: '', text: 'No etymology explanation found.' };
}
