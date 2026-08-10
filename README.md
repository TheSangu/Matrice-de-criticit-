# Matrice de criticité — aide au manager

Outil web **à destination des managers** : en cas d'inquiétude pour un
collaborateur, il aide à **situer la criticité** d'une situation et à savoir
**quoi faire** (posture, conseils ciblés, ressources vers qui orienter).

- **Page 100 % statique**, accessible par un simple lien.
- **Aucune donnée enregistrée ni transmise** : tout reste dans le navigateur
  (conforme RGPD par conception, voir [`CADRAGE.md`](CADRAGE.md)).
- **Contenu éditable** sans toucher au code, dans [`data/contenu.json`](data/contenu.json).

> Ce n'est **pas** un outil de diagnostic médical ni une évaluation du
> collaborateur. Il ne remplace pas les RH, le référent RPS, la médecine du
> travail ni la cellule d'écoute : il aide à la décision et oriente vers eux.

## Comment ça marche

1. Le manager coche les **signaux d'alerte** observés et le **contexte de travail**.
2. L'outil calcule un **niveau de criticité** (N1 → N4) à partir de signaux
   **pondérés**, d'une **aggravation par le contexte** et de **drapeaux rouges**
   (certains signaux déclenchent directement le niveau maximal).
3. Il affiche la **posture recommandée**, les **conseils ciblés** par élément
   coché et les **ressources** à mobiliser.

Le modèle (cadre théorique, pondérations, seuils) est détaillé dans
[`CADRAGE.md`](CADRAGE.md).

## Structure

```
index.html            Page unique (accueil → check-list → résultat)
assets/style.css      Mise en forme
assets/app.js         Logique (calcul de criticité, restitution)
data/contenu.json     Contenu : signaux, contexte, niveaux, conseils, ressources
CADRAGE.md            Document de cadrage / socle du projet
```

## Modifier le contenu

### Sans code — le Studio (recommandé)

Le **Studio** est un éditeur à formulaires qui permet de modifier toute la matrice
(signaux, conseils, niveaux, ressources, textes de prévention, affiches) **sans
toucher au JSON**, avec un **aperçu en direct** de ce que verront les managers.

- Le travail est **mémorisé automatiquement** dans le navigateur.
- **Enregistrer le projet** : télécharge une sauvegarde (`projet-matrice.json`)
  réouvrable dans le Studio (« Charger un projet »).
- **Importer un PDF / une image** (onglet « Affiches ») : le document est
  **embarqué** dans la page publiée — rien à déposer à côté, il suffit de
  remplacer l'`index.html` sur l'intranet.
- **Publier ▾ → Publier la page** : génère la page finale (`index.html` autonome)
  à déposer sur l'intranet.
- **Aucune donnée ne sort** : tout reste dans le navigateur (comme l'outil public).

**Deux façons de l'ouvrir :**

1. **`studio-autonome.html` — en double-clic, rien à installer** (recommandé pour
   un poste). C'est un **fichier unique** qui embarque tout : téléchargez-le,
   double-cliquez, il s'ouvre dans votre navigateur. Aucun serveur, aucun terminal.
2. **`studio.html`** — la version « source » (pour le dépôt / l'intranet). Elle
   charge ses fichiers via `fetch` : il faut donc un petit serveur local (voir
   « Tester en local »), l'ouverture directe en `file://` ne marche pas.

Le fichier autonome est **généré** à partir des sources. Après une modification du
code ou du contenu par défaut, régénérez-le :

```bash
node build-studio.mjs   # (re)crée studio-autonome.html
```

Le cadrage de ce chantier (Studio → Hub → outils) est dans
[`CADRAGE-BUILDER.md`](CADRAGE-BUILDER.md).

### À la main (JSON)

Tout le contenu vit dans `data/contenu.json` :

- **`signaux`** : libellé, `categorie`, `poids` (1–3), `drapeau_rouge`, `conseil`.
- **`contexte`** : libellé, `famille_gollac`, `conseil`.
- **`niveaux`** : `seuil_min`, `posture`, `ressources`.
- **`config`** : paramètres de calcul du multiplicateur de contexte.

Éditer un conseil ou ajouter un signal = modifier ce fichier, sans toucher au code.

### À compléter (entreprise)
Les **ressources** par niveau sont des libellés génériques à remplacer par les
dispositifs internes (référent RPS, cellule d'écoute Céla, médecine du travail,
dispositif proche-aidant, process d'incivilité, etc.). Voir §9 du cadrage.

## Tester en local

Le contenu est chargé via `fetch`, qui ne fonctionne pas en ouvrant le fichier
directement (`file://`). Lancez un petit serveur local :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Publier (GitHub Pages)

1. Pousser ces fichiers à la racine du dépôt.
2. **Settings → Pages → Build and deployment → Source : _Deploy from a branch_**,
   choisir la branche et le dossier `/ (root)`.
3. L'URL publiée peut être partagée aux managers.
