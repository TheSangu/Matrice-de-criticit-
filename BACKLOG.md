# Backlog — Matrice de criticité

Suivi des évolutions de l'outil, organisé par **chantier**. Méthode : une modif =
un commit clair sur la branche `claude/focused-fermi-WZh4a` → le site se
redéploie automatiquement (~1 min) sur https://thesangu.github.io/Matrice-de-criticit-/

**Légende :** `[ ]` à faire · `[~]` en cours · `[x]` fait
Chaque tâche pointe vers le(s) fichier(s) concerné(s).

---

## A — Contenu RPS
*Libellés des signaux/contextes, formulation des conseils, ajout/retrait d'items — `data/contenu.json`*

- [ ] Relire et valider tous les **libellés** de signaux
- [ ] Relire et valider tous les **conseils** (signaux + contexte)
- [ ] Vérifier les **contextes ajoutés** (manque de soutien hiérarchique, perte de sens / qualité empêchée)
- [ ] Identifier d'éventuels **signaux/contextes manquants**

## B — Modèle de criticité
*Poids, drapeaux rouges, seuils, multiplicateur — `data/contenu.json` + `CADRAGE.md`*

- [ ] Recalibrer les **poids** des signaux après relecture métier
- [ ] Valider les **seuils** N1→N4 après premiers tests terrain
- [ ] Confirmer la liste des **drapeaux rouges**
- [ ] Statuer sur le **multiplicateur de contexte** (base 1, +0,1/facteur, plafond 1,5)

## C — Ressources internes Groupama d'Oc
*Brancher les dispositifs réels — `data/contenu.json`*

- [ ] **Lister** les dispositifs : cellule Céla, référent RPS, médecine du travail, dispositif proche-aidant, process incivilité, CIT, EAE, RH de proximité…
- [ ] Définir les **ressources par niveau** (N1→N4)
- [ ] Associer des **ressources par situation** (ex. incivilité client → process de déclaration ; proche-aidant → dispositif dédié)
- [ ] Ajouter **contacts / liens** (qui, comment, dans quel ordre)

## D — UX & textes
*Parcours, écran d'accueil, restitution — `index.html`, `assets/app.js`*

- [ ] Affiner l'**écran d'accueil** (texte, ton)
- [ ] Revoir les **formulations** de la restitution
- [ ] Collecter les idées d'amélioration du parcours

## E — Design / charte
*Couleurs, logo, densité, accessibilité — `assets/style.css`*

- [ ] Remplacer le logo par une version **HD / SVG** si disponible
- [ ] Ajustements densité / contrastes éventuels

## F — Technique
*Déploiement, perf, accessibilité — divers*

- [ ] Décider de l'**hébergement définitif** (public vs Enterprise privé à accès restreint)
- [ ] Vérifier l'**accessibilité** (contrastes, navigation clavier, lecteurs d'écran)

---

## ✅ Déjà fait
- [x] Cadrage du projet — modèle, théorie (Gollac/Karasek/Siegrist), architecture (`CADRAGE.md`)
- [x] v1 de l'outil — accueil + check-list + restitution (signaux pondérés, drapeaux rouges, multiplicateur)
- [x] 20 signaux + 15 contextes avec conseils (`data/contenu.json`)
- [x] Habillage aux couleurs Groupama d'Oc + intégration du logo
- [x] Déploiement GitHub Pages (mise à jour auto à chaque push)

## 🧭 Décisions actées
- Outil **statique, sans stockage** (RGPD by design)
- **Écran d'accueil** rappelant le cadre : oui
- Bouton **export/impression** : non (pour l'instant)
- **4 signaux ajoutés** conservés (propos inquiétants, pleurs/émotivité, plaintes somatiques/fatigue, surinvestissement)
- **Seuils** N1 1-2 · N2 3-5 · N3 6-9 · N4 ≥10 : base validée (à recalibrer)
- Hébergement : **dépôt public + Pages** (provisoire, le temps de l'aperçu)
- Suivi via **BACKLOG.md**, validation en **direct sur la branche**
