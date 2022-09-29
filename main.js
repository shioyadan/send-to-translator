const ID_DEEPL = "ID_DEEPL";
const ID_GOOGLE_TRANSLATE = "ID_GOOGLE_TRANSLATE";
const DESTINATION_LANGUAGE = "ja";

/**
 * @param {string|number} id 
 * @param {string} lang
 * @param {string} text
 */
function send(id, lang, text) {
    const escaped = 
        text.
        replaceAll("/", "\\/").
        replaceAll("|", "\\|").
        replaceAll("  ", " ");
    const urlEncode = encodeURIComponent(escaped);
    if (id == ID_DEEPL) {
        const url = `https://www.deepl.com/translator#${lang}/${DESTINATION_LANGUAGE}/${urlEncode}`;
        chrome.tabs.create({ url });
    }
    else if (id == ID_GOOGLE_TRANSLATE){
        const url = `https://translate.google.co.jp/?sl=${lang}&tl=${DESTINATION_LANGUAGE}&text=${urlEncode}`;
        chrome.tabs.create({ url });
    }
}

function main() {
    chrome.contextMenus.create({
        "id": ID_DEEPL,
        "title": "DeepLに送る",
        "contexts": ["selection"]
    });
    chrome.contextMenus.create({
        "id": ID_GOOGLE_TRANSLATE,
        "title": "Google翻訳に送る",
        "contexts": ["selection"]
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
        console.log("test");
        if (info.menuItemId == ID_DEEPL || info.menuItemId == ID_GOOGLE_TRANSLATE) {
            const text = info.selectionText;
            chrome.i18n.detectLanguage(text, (result) => {
                let fromLang = "en";
                if (result.languages.length >= 1 && result.isReliable) {
                    fromLang = result.languages[0].language;
                }
                send(info.menuItemId, fromLang, text);
            });
        }
    });

}

main();
