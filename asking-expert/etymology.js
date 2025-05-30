// etymology.js
export async function fetchEtymologyExplanation(word) {
    const response = await fetch(`https://www.etymonline.com/search?q=${word}`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const searchDiv = doc.querySelector('div.ant-col-xs-24.ant-col-sm-24.ant-col-md-24.ant-col-lg-17');
    if (searchDiv) {
        const anchors = searchDiv.querySelectorAll(`a[title^="Origin and meaning of"]`);
        for (const anchor of anchors) {
            const parentDiv = anchor.closest('div[class*="word"]');
            if (!parentDiv) continue;
            const explanationElement = parentDiv.querySelector('p');
            if (explanationElement && explanationElement.innerText.trim()) {
                const explanationText = explanationElement.innerText.trim();
                if (!explanationText.startsWith('see ') && !explanationElement.querySelector('a.crossreference.notranslate')) {
                    return explanationText;
                }
            }
        }
    }
    return 'No etymology explanation found.';
}
