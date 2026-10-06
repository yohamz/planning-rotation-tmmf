// Génère les écrans de démarrage iPhone / iPad (dossier demarrage/) : sans eux,
// iOS affiche une page blanche le temps de lancer l'appli installée.
// Même dessin que l'écran de démarrage d'Android et que le voile d'ouverture
// (#ouverture dans index.html) : fond #131517, icône « maskable » de 240 px
// dont seul un disque central de 160 px se voit, au centre de l'écran.
//
// Usage (sharp doit être installé) : node outils/ecrans-demarrage.js
// Affiche ensuite les balises <link> à coller dans index.html.
const sharp = require("sharp");
const path = require("path");

const RACINE = path.join(__dirname, "..");
const FOND = "#131517";

// Largeur × hauteur en points (portrait) et densité de pixels, du plus récent
// au plus ancien.
const ECRANS = [
  // iPhone
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [428, 926, 3],
  [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [414, 736, 3],
  [375, 667, 2], [320, 568, 2],
  // iPad
  [1032, 1376, 2], [1024, 1366, 2], [834, 1210, 2], [834, 1194, 2], [820, 1180, 2],
  [834, 1112, 2], [810, 1080, 2], [768, 1024, 2], [744, 1133, 2],
];

(async () => {
  const liens = [];
  for (const [w, h, d] of ECRANS) {
    const icone = 240 * d, rayon = 80 * d;
    const disque = Buffer.from(
      `<svg width="${icone}" height="${icone}"><circle cx="${icone / 2}" cy="${icone / 2}" r="${rayon}" fill="#fff"/></svg>`
    );
    const logo = await sharp(path.join(RACINE, "icones/icon-512-maskable.png"))
      .resize(icone, icone)
      .composite([{ input: disque, blend: "dest-in" }])
      .png()
      .toBuffer();
    for (const [orientation, lw, lh] of [["portrait", w, h], ["landscape", h, w]]) {
      const fichier = `demarrage/${lw}x${lh}@${d}.png`;
      await sharp({ create: { width: lw * d, height: lh * d, channels: 3, background: FOND } })
        .composite([{ input: logo, gravity: "centre" }])
        .png({ palette: true })
        .toFile(path.join(RACINE, fichier));
      liens.push(
        `<link rel="apple-touch-startup-image" href="${fichier}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${d}) and (orientation: ${orientation})">`
      );
    }
  }
  console.log(liens.join("\n"));
})();
