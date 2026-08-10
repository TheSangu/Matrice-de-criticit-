/* Génère `studio-autonome.html` : le Studio en UN SEUL FICHIER, ouvrable en
 * double-clic (sans serveur, sans rien installer).
 *
 * Il embarque, à l'instant de la génération : le gabarit de rendu (index.html,
 * style.css, app.js), le logo, et le contenu de départ (data/contenu.json).
 * Le fichier obtenu ne fait AUCUN accès réseau (window.__STUDIO_EMBED__).
 *
 * À relancer si le code ou le contenu par défaut changent :
 *     node build-studio.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const html      = readFileSync("studio.html", "utf8");
const studioCss = readFileSync("assets/studio.css", "utf8");
// Neutralise TOUTE balise script littérale présente dans le source (studio.js
// contient « <script src=…></script> » comme chaîne de remplacement) : sinon
// l'analyseur HTML ferme prématurément la balise <script> qui l'inline.
// « <\script » et « <\/script> » valent, en chaîne/regex JS, « <script » et
// « </script> » : la valeur exécutée est identique, mais le HTML n'y voit plus de balise.
const studioJs  = readFileSync("assets/studio.js", "utf8")
  .replace(/<\/script>/gi, "<\\/script>")
  .replace(/<script/gi, "<\\script");

const embed = {
  html: readFileSync("index.html", "utf8"),
  css: readFileSync("assets/style.css", "utf8"),
  js: readFileSync("assets/app.js", "utf8"),
  logo: "data:image/png;base64," + readFileSync("assets/logo.png").toString("base64"),
  contenu: JSON.parse(readFileSync("data/contenu.json", "utf8")),
};
// « < » échappé en < : rend le JSON sûr à l'intérieur d'une balise <script>
// (index.html embarqué contient « </script> »).
const embedScript = "window.__STUDIO_EMBED__ = " + JSON.stringify(embed).replace(/</g, "\\u003c") + ";";

// Remplacements en FORME FONCTION : la chaîne retournée est insérée littéralement.
// Sinon un « $$ » présent dans le code inliné (ex. le helper $$) ou dans le contenu
// serait interprété comme motif spécial ($$ → $, $& …) et corromprait le fichier.
const styleTag = "<style>\n" + studioCss + "\n</style>";
const scripts = "<script>" + embedScript + "</script>\n<script>\n" + studioJs + "\n</script>";
let out = html;
out = out.replace('<link rel="stylesheet" href="assets/studio.css" />', () => styleTag);
out = out.split("assets/logo.png").join(embed.logo); // favicon en data URI
out = out.replace('<title>Studio — Éditeur de la matrice</title>', () => "<title>Studio — Éditeur de la matrice (autonome)</title>");
out = out.replace('<script src="assets/studio.js"></script>', () => scripts);

writeFileSync("studio-autonome.html", out);
console.log("studio-autonome.html généré — " + Math.round(out.length / 1024) + " Ko");
