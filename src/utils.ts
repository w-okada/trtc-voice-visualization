// export const loadFont = async () => {
//     const exampleFontFamilyName = "Noto Serif JP";
//     const urlFamilyName = exampleFontFamilyName.replace(/ /g, "+");
//     const googleApiUrl = `https://fonts.googleapis.com/css?family=${urlFamilyName}`;

//     const response = await fetch(googleApiUrl);
//     if (response.ok) {
//         // url()の中身のURLだけ抽出
//         const cssFontFace = await response.text();
//         const matchUrls = cssFontFace.match(/url\(.+?\)/g);
//         if (!matchUrls) throw new Error("フォントが見つかりませんでした");

//         for (const url of matchUrls) {
//             // 後は普通にFontFaceを追加
//             const font = new FontFace(exampleFontFamilyName, url);
//             await font.load();
//             //@ts-ignore
//             document.fonts.add(font);
//         }
//     }
// }

export const loadFont = async () => {
    const font = new FontFace("Chalk", "url(./Chalk-S-JP.otf)");
    await font.load();
    //@ts-ignore
    document.fonts.add(font);
}