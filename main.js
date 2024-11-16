const ID_DEEPL = "ID_DEEPL";
const ID_GOOGLE_TRANSLATE = "ID_GOOGLE_TRANSLATE";
const DESTINATION_LANGUAGE = "ja";

// タイトル中に小文字で出てきても良い単語
const TITLE_EXCEPTION_PATTERN = /^(and|the|of|at|to|on|in|for|by|with|from|before|after|about|near|until|as|during|over|off|through|above|below|against|around|among|between|into|under|along|without|within|inside|beside|vs.)$/;

/**
 * タイトルを検出して改行を入れる
 * @param {string} text 
 */
function convertTitle(text) {
    let lines = text.split("  ");
    let result = "";
    for (let line of lines) {
        // ピリオドがなく，単語が全部大文字始まりの行はタイトルとみなす
        let title = false;
        if (!line.match(/\.$/)) {
            // ピリオドでおわっていない
            title = true;

            // 単語の頭が大文字じゃないかを検査
            // ただし前置詞や the は小文字でもよいとする
            let tokens = line.split(" ");
            for (let t of tokens) {
                if (!t.match(/^[A-Z0-9\(]/) && !t.match(TITLE_EXCEPTION_PATTERN)) {    
                    title = false;
                    break;
                }
            }
        }

        if (title) {
            result = result + "\n" + line + "\n";   // タイトル前にも改行を入れる
        }
        else {
            result = result + line + "  ";
        }
    }
    return result;
}

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
    escaped = convertTitle(escaped);
    escaped = escaped.replaceAll(".  ", ".\n"); // ピリオドで終わっている改行はパラグラフとみなす
    escaped = escaped.replaceAll("-  ", "");    // 行末のハイフネーションを解除
    escaped = escaped.replaceAll("  ", " ");    // PDF では改行がスペース２つになるのを１つに戻す．これは最後にやらないと，上の２つが無意味になる．
    
    const urlEncoded = encodeURIComponent(escaped);

    // URL に埋め込んで新しいタブで開く
    let url = "";
    if (id == ID_DEEPL) {
        url = `https://www.deepl.com/ja/translator?share=generic#${lang}/${DESTINATION_LANGUAGE}/${urlEncoded}`;
        // url = `https://www.deepl.com/translator?share=generic#${lang}/${DESTINATION_LANGUAGE}/${urlEncoded}`;
    }
    else if (id == ID_GOOGLE_TRANSLATE){
        url = `https://translate.google.co.jp/?sl=${lang}&tl=${DESTINATION_LANGUAGE}&text=${urlEncoded}`;
    }
    
    if (url != "") {
        chrome.tabs.create({ url });
    }
    else {
        console.log("Bad id is passed to send().");
    }
}


function main() {
    // コンテクストメニューの追加
    chrome.contextMenus.create({
        "id": ID_DEEPL,
        "title": "DeepL",
        "contexts": ["selection"]
    });
    chrome.contextMenus.create({
        "id": ID_GOOGLE_TRANSLATE,
        "title": "Google翻訳",
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
