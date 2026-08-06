# Cadrage — Studio & Hub (éditeur modulable)

> Document de cadrage du **chantier « éditeur »**. Objectif : rendre l'outil
> **modifiable sans code et sans Claude**, par un profil non-technique, une fois
> son concepteur parti. Il complète [`CADRAGE.md`](CADRAGE.md) (qui, lui, fixe le
> *contenu* RPS de la matrice). Rien n'est figé : tout ici est fait pour être amendé.

---

## 1. Le besoin (pourquoi ce chantier)

Aujourd'hui, mettre l'outil à jour = éditer `data/contenu.json` **à la main** (du
JSON) et déposer des PDF dans `assets/`. Cela suppose quelqu'un à l'aise avec le
code. **Le vrai enjeu est l'autonomie de l'équipe après le départ du concepteur** :
pouvoir faire évoluer l'outil — corriger un conseil, ajouter un signal, changer un
contact, **mettre la doc et la prévention à jour**, importer une affiche — sans
toucher au code et sans Claude.

---

## 2. La cible : Studio → Hub → Outils

Trois couches, toutes **100 % navigateur** (aucune donnée ne sort, cohérent avec
le RGPD by design de la matrice) :

```
┌────────────────────────────────────────────────────────────┐
│  LE STUDIO  (studio.html)  — l'atelier, pour le mainteneur   │
│  • formulaires, aucune ligne de code                         │
│  • crée / édite des outils, agence le hub                    │
│  • prévisualisation live · autosave · « Publier »            │
└───────────────────────────┬────────────────────────────────┘
                            │  Publier
                            ▼
┌────────────────────────────────────────────────────────────┐
│  LE HUB  (le site final, s'ouvre dans le navigateur)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Matrice  │  │ Affiche  │  │ Annuaire │   … cartes         │
│  │ RPS      │  │ promo    │  │ ressources│    cliquables     │
│  └──────────┘  └──────────┘  └──────────┘                    │
│      chaque carte ouvre UN outil, lisible et fini            │
└────────────────────────────────────────────────────────────┘
```

- **Deux publics distincts** : le *mainteneur* utilise le **Studio** ; les
  *managers / collaborateurs* utilisent le **Hub publié**. Le Studio n'est jamais
  montré aux utilisateurs finaux.
- **Sortie** : « Publier » génère une page **autonome** qui s'ouvre directement
  dans le navigateur (le contenu est **embarqué dans la page**, pas de fichier de
  données à charger à part → fonctionne aussi bien déposé sur Coll'OC qu'en local).

---

## 3. Principe directeur : des *archétypes* bornés, pas des blocs libres à l'infini

Un builder « on fabrique n'importe quoi » deviendrait un mini-CMS ingérable pour un
profil non-technique. La clé de la **durabilité** : un **petit nombre de gabarits
solides** (archétypes). Le mainteneur **choisit un archétype, remplit, agence,
publie** — il ne code jamais. Ajouter un *nouveau type* d'archétype reste un geste
de développeur (rare) ; créer autant d'*outils* qu'on veut à partir des archétypes
existants est 100 % non-technique.

**Archétypes prévus**
1. **Évaluation guidée** — *la matrice actuelle* : on coche → résultat orienté
   action + ressources. (déjà développé, on le « rentre » dans le Studio)
2. **Affiche / communication à blocs** — titre, texte, image, PDF, cartes-contacts,
   bouton. → couvre les **affiches de promotions** et communications internes.
3. *(plus tard, si besoin)* **Annuaire de ressources**, **Procédure / checklist**.

---

## 4. Modèle de sauvegarde & publication (sans serveur)

Comme tout vit dans le navigateur, il n'y a pas de base de données :

- **Autosave** : le travail est mémorisé automatiquement dans le navigateur
  (localStorage) — on ne perd pas son travail en rechargeant.
- **Enregistrer le projet** : télécharge un fichier `projet.json` (sauvegarde,
  transfert vers un autre poste, archivage). On le rouvre dans le Studio pour
  reprendre.
- **Publier** : génère la page finale à déposer sur Coll'OC. **Rien ne part
  automatiquement** : aucune donnée ne quitte le poste sans un clic explicite.

---

## 5. Contraintes non-négociables

| Contrainte | Traduction |
|---|---|
| **RGPD by design** | 100 % navigateur, aucune donnée transmise. « Importer un doc » = le fichier reste sur le poste et part dans l'export. |
| **Hébergement** | Inchangé : intranet Coll'OC (dépôt téléchargé puis publié). |
| **Non-technique** | Formulaires guidés, garde-fous, validations, messages clairs. Ids/clés techniques protégés (non modifiables une fois créés). |
| **Survivre sans Claude** | Peu de concepts, bornés, documentés. Un guide du mainteneur accompagne l'outil. |
| **Ne rien casser** | La matrice actuelle continue de tourner pendant la construction du Studio, à côté. |

---

## 6. Plan par étapes (chacune livre quelque chose d'utilisable)

| Étape | Livrable | Valeur |
|---|---|---|
| **1. Socle Studio + archétype Évaluation** | `studio.html` édite la matrice par formulaires + prévisu live + « Publier » | L'édition JSON à la main **disparaît** ⬅️ **on démarre ici** |
| **2. Le Hub multi-outils** | Plusieurs outils dans un projet, page d'accueil à cartes, identité (logo/couleurs) | Le vrai « hub » prend forme |
| **3. Archétype Affiche à blocs + import de docs** | Blocs bornés, import PDF/images embarqués dans l'export | Les **affiches promo** sortent du builder |
| **4. Autonomie & garde-fous** | Autosave, fichier-projet, validations, **guide du mainteneur** | Ça survit sans le concepteur et sans Claude |
| **5. (option) Autres archétypes** | Annuaire, procédure/checklist | Si le besoin se confirme |

---

## 7. Architecture technique

- **Un seul socle de rendu** : la page publiée, la prévisualisation du Studio et
  l'`index.html` actuel utilisent **le même `assets/app.js`**. Celui-ci lit le
  contenu depuis `window.__CONTENU__` (embarqué) s'il existe, sinon depuis
  `data/contenu.json` (mode dépôt). → pas de code dupliqué, la prévisu = le rendu réel.
- **Le Studio** (`studio.html` + `assets/studio.css` + `assets/studio.js`) :
  formulaires ↔ objet `projet` (même forme que `contenu.json`), prévisu dans une
  `iframe`, export. Aucune dépendance externe.
- **Génération** : « Publier » et la prévisu partagent le **même générateur**
  (gabarit `index.html` + CSS + JS inlinés + `window.__CONTENU__`).

### Fichiers du chantier
```
studio.html            L'atelier (éditeur) — n'est pas montré aux utilisateurs finaux
assets/studio.css      Mise en forme du Studio
assets/studio.js       Logique du Studio (formulaires, prévisu, export)
assets/app.js          Socle de rendu partagé (lit window.__CONTENU__ ou data/contenu.json)
index.html             Page publique actuelle (inchangée, toujours fonctionnelle)
CADRAGE-BUILDER.md     Ce document
```

---

## 8. État d'avancement

- [~] **Étape 1** — Socle du Studio + archétype Évaluation (matrice éditable,
      prévisu live, enregistrer/publier). *En cours.*
- [ ] Étape 2 — Hub multi-outils
- [ ] Étape 3 — Archétype Affiche à blocs + import de documents
- [ ] Étape 4 — Autonomie & garde-fous + guide du mainteneur
- [ ] Étape 5 — Autres archétypes (option)
