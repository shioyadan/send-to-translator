const ID_DEEPL = "ID_DEEPL";
const ID_GOOGLE_TRANSLATE = "ID_GOOGLE_TRANSLATE";
const DESTINATION_LANGUAGE = "ja";

/**
 * @param {string|number} id 
 * @param {string} lang
 * @param {string} text
 */
function send(id, lang, text) {

    // テキストのエスケープ処理
    let escaped = text;
    escaped = 
        escaped.replaceAll("/", "\\/").
                replaceAll("|", "\\|");
    escaped = escaped.replaceAll(".  ", ".\n"); // ピリオドで終わっている改行はパラグラフとみなす
    escaped = escaped.replaceAll("-  ", "");    // 行末のハイフネーションを解除
    escaped = escaped.replaceAll("  ", " ");    // PDF では改行がスペース２つになるのを１つに戻す．これは最後にやらないと，上の２つが無意味になる．
    
    const urlEncoded = encodeURIComponent(escaped);

    let url = "";
    if (id == ID_DEEPL) {
        url = `https://www.deepl.com/translator#${lang}/${DESTINATION_LANGUAGE}/${urlEncoded}`;
    }
    else if (id == ID_GOOGLE_TRANSLATE){
        url = `https://translate.google.co.jp/?sl=${lang}&tl=${DESTINATION_LANGUAGE}&text=${urlEncoded}`;
    }
    
    if (url != "") {
        chrome.tabs.create({ url });
    }
    else {
        console.log("Bad id is passed to send()");
    }
}


function main() {
    // コンテクストメニューの追加
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

    // クリックハンドラの登録
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId == ID_DEEPL || info.menuItemId == ID_GOOGLE_TRANSLATE) {
            const text = info.selectionText;
            // 言語の判定
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
