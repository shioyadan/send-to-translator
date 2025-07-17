// offscreen.js
// main.js からメッセージパッシングで呼び出される．
// ローカルの PDF を Chrome の PDF ビューアで開くと，tab の id がもらえないため
// 直接クリップボードへコピーすることができない．
// かわりにオフスクリーンドキュメントを使って，そこのテキストエリアからクリップボードへ書き込む．
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "copy" && msg.text) {
        const ta = document.createElement("textarea");
        ta.value = msg.text;
        document.body.appendChild(ta);
        ta.select();
        // execCommand "copy" は非推奨だが、オフスクリーンドキュメントではまだ必要
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#browser
        document.execCommand("copy");
        ta.remove();
    }
});
