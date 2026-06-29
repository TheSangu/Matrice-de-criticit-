# Backlog — Matrice de criticité

Suivi des évolutions de l'outil, organisé par **chantier**. Méthode : une modif =
un commit clair sur la branche `claude/focused-fermi-WZh4a` → le site se
redéploie automatiquement (~1 min) sur https://thesangu.github.io/Matrice-de-criticit-/

**Légende :** `[ ]` à faire · `[~]` en cours · `[x]` fait
Chaque tâche pointe vers le(s) fichier(s) concerné(s).

---

## A — Contenu RPS
*Libellés des signaux/contextes, formulation des conseils, ajout/retrait d'items — `data/contenu.json`*

- [x] **Conseils réécrits** : courts, orientés action (v2)
- [x] Signaux **classés en 3 familles de gravité** (santé / relationnel / performance)
- [ ] Relire/valider les **libellés** et la répartition par famille (ex. isolement : santé ou relationnel ?)
- [ ] Identifier d'éventuels **signaux/contextes manquants**

## B — Modèle de criticité
*Matrice gravité × installation + convergence — `data/contenu.json` + `CADRAGE.md`*

- [x] **Nouveau modèle** : matrice gravité × installation (ponctuel/répété/installé) + convergence
- [x] Drapeaux rouges (propos inquiétants, mal-être exprimé) → N4
- [ ] Valider la **matrice** et les règles de **convergence** après tests terrain
- [x] `CADRAGE.md` réaligné sur le modèle par item (v3)

## C — Ressources internes Groupama d'Oc
*Brancher les dispositifs réels — `data/contenu.json`*

- [x] **Catalogue de ressources** créé (`meta.ressources`) : chaque dispositif a un rôle + des champs `contact`/`lien`, rendu en cartes dans « Vers qui orienter »
- [x] Dispositifs **listés** : RH de proximité, référent RPS, médecine du travail, cellule Céla, proche-aidant, process incivilité, EAE/bilan RH, secours, CIT
- [x] **Ressources par niveau** (N1→N4) branchées sur le catalogue (ordre = ordre de mobilisation)
- [~] **Ressources par situation** : incivilité (client/interne) → process incivilité ; vie perso → proche-aidant ; manque de perspective → EAE. *À compléter selon les autres situations.*
- [ ] **Contacts / liens réels** à renseigner (champs `contact`/`lien` aujourd'hui vides, affichés seulement une fois remplis)
- [ ] Préciser **CIT** (rôle, périmètre, situations) et **EAE** (intitulé exact), puis brancher CIT (non rattaché pour l'instant)

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
- [x] v1 — check-list + restitution (signaux pondérés)
- [x] **v2 — refonte complète** : parcours en 3 étapes (sans scroll), modèle matriciel gravité × installation + convergence, restitution orientée action (posture / à faire / à éviter / orientation) + détail repliable, conseils réécrits
- [x] **v3 — logique par item (fin de la pondération)** : chaque signal porte sa criticité propre + son conseil ; niveau d'ensemble = le signal le plus sérieux coché ; plus de matrice, de temporalité ni de convergence ; détail par item visible avec badges de criticité
- [x] 20 signaux + 15 contextes (`data/contenu.json`)
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
- **Conseils & « à faire » ré-arbitrés** (v2.1) : chaque conseil = lecture + réflexe + piège ; démarches par niveau revues
- **N4 (Alerte) réservé** à la souffrance installée ou aux drapeaux rouges ; la convergence relationnel/performance plafonne à N3
- **Recalibrage anti-alarmisme (v2.2)** : un seul drapeau rouge (propos de désespoir) ; « mal-être exprimé » n'est plus une Alerte automatique ; note rappelant que les relais sont un **appui**, pas un report de responsabilité
- **Fin de la pondération (v3)** : criticité par item (chaque signal a son niveau), niveau d'ensemble = le plus sérieux coché. Conséquence assumée : pas d'escalade par cumul (4 signaux faibles restent en Vigilance), le contexte n'augmente pas le niveau. Niveau intrinsèque par signal à valider (N3 pour « mal-être exprimé » et « changement de comportement »)
