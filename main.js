function main() {
    let id = chrome.contextMenus.create({
        "id": "send-to-deepl",
        "title": "DeepL に送る",
        "contexts": ["selection"]
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
        console.log("test");
        if (info.menuItemId == "send-to-deepl") {
            const text = info.selectionText;
            chrome.i18n.detectLanguage(text, (result) => {
                let fromLang = "en";
                if (result.languages.length >= 1 && result.isReliable) {
                    fromLang = result.languages[0].language;
                }
                const escaped = text.replaceAll("/", "\\/").replaceAll("|", "\\|");
                const url = `https://www.deepl.com/translator#${fromLang}/ja/${encodeURIComponent(escaped)}`;
                chrome.tabs.create({ url });
            });
        }
    });

}

main();
