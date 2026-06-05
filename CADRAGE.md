# Cadrage — Matrice de criticité (outil d'aide aux managers)

> Document de cadrage. C'est le **socle** du projet : il fixe l'objectif, le modèle
> de criticité, la pondération des signaux et l'architecture **avant** le
> développement. Rien n'est figé : tout ici est fait pour être discuté et amendé.

---

## 1. Objectif

Donner au manager **un réflexe structuré** quand il s'inquiète pour un
collaborateur :

1. **Nommer** ce qu'il observe (signaux d'alerte) et le **contexte** de travail.
2. **Situer** la criticité de la situation (de la simple vigilance à l'alerte).
3. **Savoir quoi faire** : posture à adopter, actions concrètes, et **vers quelles
   ressources** orienter — y compris les dispositifs propres à l'entreprise.

L'outil est un **lien web** (page statique) que chaque manager peut ouvrir, sans
installation et **sans qu'aucune donnée ne soit enregistrée**.

### Ce que l'outil **n'est pas**
- Ce **n'est pas un outil de diagnostic médical ou psychologique**.
- Ce **n'est pas un outil d'évaluation du collaborateur** ni un dossier RH.
- Il **ne remplace pas** les RH, le référent RPS, la médecine du travail ni la
  cellule d'écoute. Il **aide à la décision** et **oriente** vers eux.
- En cas de **danger immédiat** (propos suicidaires, détresse aiguë), la conduite
  est **l'alerte immédiate**, pas l'outil.

---

## 2. Principes directeurs

| Principe | Traduction concrète |
|---|---|
| **Prudence RPS** | Les conseils protègent : on ne demande jamais les raisons médicales, on ne pose pas de diagnostic, on ne réagit pas à chaud. |
| **Non-stigmatisation** | On parle de *situation* et de *signaux observables*, pas de « profil » du collaborateur. |
| **RGPD by design** | Aucune saisie n'est stockée ni transmise. Tout vit dans le navigateur, rien ne part sur un serveur. Pas de nom de collaborateur demandé. |
| **Gradation & juste mesure** | Un signal isolé n'est pas une alerte. On évite la sur-réaction comme la minimisation. |
| **Orientation, pas substitution** | À chaque niveau, l'outil renvoie vers la bonne ressource humaine. |
| **Évolutif** | Le contenu (signaux, conseils, ressources) est éditable sans toucher au code. |

---

## 3. Cadre théorique (sur quoi la criticité s'appuie)

Pour ne pas inventer une pondération arbitraire, le modèle s'ancre sur les
références reconnues en santé au travail :

- **Rapport Gollac (2011)** — la référence française des RPS, qui structure les
  facteurs de risque en **6 familles**. C'est la grille qui sert à classer le
  **contexte de travail**.
- **Modèle de Karasek** (demande psychologique × latitude décisionnelle ×
  soutien social) : une charge forte devient un risque quand l'autonomie et le
  soutien sont faibles. → justifie le rôle **aggravant** du contexte.
- **Modèle de Siegrist** (déséquilibre effort / récompense) : un effort élevé mal
  reconnu use. → justifie le poids de la **faible valorisation** et du **manque
  de perspective**.

### Les 6 familles Gollac (grille de lecture du contexte)
1. **Intensité et temps de travail** (charge, délais, surcharge)
2. **Exigences émotionnelles** (incivilités, contact public difficile)
3. **Manque d'autonomie / marges de manœuvre**
4. **Rapports sociaux dégradés** (conflits, manque de soutien, reconnaissance)
5. **Conflits de valeurs** (perte de sens, qualité empêchée)
6. **Insécurité de la situation de travail** (réorganisations, changements, avenir)

---

## 4. Le modèle de criticité

### 4.1 Principe général

La criticité **ne se résume pas à un comptage**. Elle combine 3 ingrédients :

```
Criticité = ƒ( signaux pondérés  +  aggravation par le contexte  +  drapeaux rouges )
```

- **Signaux pondérés** : chaque signal a un poids (1 à 3) selon sa valeur
  d'alerte en santé au travail.
- **Aggravation par le contexte** : les facteurs de contexte ne créent pas
  l'alerte seuls, mais **augmentent** le niveau (un même signal est plus
  préoccupant si le contexte est défavorable) et surtout **expliquent la cause**
  pour orienter la bonne réponse.
- **Drapeaux rouges** : certains signaux de souffrance déclenchent **directement
  le niveau maximal**, quel que soit le total (principe de précaution).

### 4.2 Les niveaux de réponse

| Niveau | Intitulé | Lecture | Posture managériale |
|---|---|---|---|
| **N1** | **Vigilance** | Signal faible / isolé | Observer, rester disponible, échange informel, ne rien dramatiser. |
| **N2** | **Attention** | Plusieurs signaux ou un signal modéré + contexte défavorable | Initier un **échange dédié** et bienveillant, ajuster ce qui peut l'être, reprendre un point à court terme. |
| **N3** | **Situation dégradée** | Accumulation de signaux ou signaux forts | Échange structuré, **plan de suivi renforcé**, **associer / informer les RH**. |
| **N4** | **Alerte** | Drapeau rouge ou cumul majeur | **Orientation sans délai** : référent RPS, médecine du travail, cellule d'écoute. Soutien, informer les RH. |

> Le passage d'un niveau à l'autre se fait par **seuils sur un score**, **plus**
> la règle des drapeaux rouges. Les seuils ci-dessous sont une **proposition de
> départ** à calibrer ensemble.

### 4.3 Calcul du score (proposition à calibrer)

```
score_signaux  = Σ (poids des signaux cochés)
multiplicateur = 1 + 0,1 × (nombre de facteurs de contexte cochés)   [plafonné à 1,5]
score          = score_signaux × multiplicateur

Si un drapeau rouge est coché          → N4 (quel que soit le score)
Sinon, selon le score :
   score 1–2     → N1   (Vigilance)
   score 3–5     → N2   (Attention)
   score 6–9     → N3   (Situation dégradée)
   score ≥ 10    → N4   (Alerte)
```

Ces nombres sont des **paramètres**, pas du dur : ils vivront dans le fichier de
configuration et seront ajustés après tes retours.

---

## 5. Taxonomie des **signaux d'alerte** (pondérés)

Poids : **1** = signal faible / fréquent / peu spécifique · **2** = signal
significatif · **3** = signal fort. 🚩 = drapeau rouge (déclenche N4).

### Souffrance & santé psychique
| Signal | Poids | Note |
|---|---|---|
| Propos inquiétants / désespoir exprimé *(ajout)* | 🚩 | Précaution maximale : orientation immédiate, ne jamais laisser seul. |
| Mal-être exprimé ouvertement | 🚩 / 3 | Verbalisation directe d'une souffrance → orientation. |
| Changement de comportement (surtout brutal) | 3 | Retrait, agitation, silence inhabituel : alerte forte. |
| Isolement / repli | 2 | Distinguer retrait **subi** ou **volontaire**. |
| Irritabilité | 2 | Surtout si nouvelle ou récurrente. |
| Pleurs / émotivité inhabituelle *(ajout)* | 2 | Signe d'épuisement émotionnel possible. |
| Plaintes somatiques / fatigue visible *(ajout)* | 2 | Fatigue chronique, troubles du sommeil évoqués. |
| Esprit négatif | 1 | Pessimisme diffus ; vérifier les tensions d'équipe. |

### Engagement & motivation
| Signal | Poids | Note |
|---|---|---|
| Désengagement | 2 | Retrait de l'implication, des initiatives. |
| Baisse de motivation | 1 | Revenir sur le sens, les aspirations. |
| Feedback négatif (du collaborateur) | 1 | Plaintes, insatisfaction exprimée. |
| Surinvestissement / hyperprésentéisme *(ajout)* | 2 | Incapacité à décrocher : risque d'épuisement. |

### Performance & comportement professionnel
| Signal | Poids | Note |
|---|---|---|
| Absentéisme | 2 | Ne jamais interroger les raisons médicales. |
| Baisse des performances | 2 | Chercher la cause avant le disciplinaire. |
| Non-respect des délais | 1 | Peut signaler surcharge ou décrochage. |
| Erreurs professionnelles | 1 | Reprendre avec pédagogie. |
| Inattention | 1 | Fatigue, stress, surcharge cognitive ? |
| Manque d'autonomie | 1 | Manque de compétence, de confiance, ou excès de contrôle ? |

### Relationnel & comportement
| Signal | Poids | Note |
|---|---|---|
| Conflits interpersonnels | 2 | Ne pas laisser s'installer. |
| Comportements négatifs | 2 | Creuser les causes (frustration, injustice ressentie). |

> **Ajouts proposés** : *propos inquiétants/désespoir*, *pleurs/émotivité*,
> *plaintes somatiques/fatigue*, *surinvestissement/hyperprésentéisme*. Ils
> comblent un angle « santé/épuisement » peu couvert par le brouillon. À
> valider / retirer selon ta préférence.

---

## 6. Taxonomie du **contexte de travail** (facteurs aggravants / explicatifs)

Chaque facteur est rattaché à une famille Gollac. Il **n'augmente pas le score à
lui seul** mais module la criticité et **oriente la recommandation**.

| Facteur de contexte | Famille Gollac |
|---|---|
| Forte charge de travail | 1 — Intensité |
| Objectifs de performance (flous ou élevés) | 1 — Intensité |
| Vie pro qui empiète sur la vie perso | 1 — Intensité |
| Incivilité client récente | 2 — Exigences émotionnelles |
| Incivilité interne (d'un collègue) | 2 — Exigences émotionnelles |
| Évolution dans les tâches / le poste | 3 — Autonomie |
| Faible valorisation / reconnaissance | 4 — Rapports sociaux |
| Distorsion / tensions dans l'équipe | 4 — Rapports sociaux |
| Manque de soutien hiérarchique *(ajout)* | 4 — Rapports sociaux |
| Perte de sens / qualité empêchée *(ajout)* | 5 — Conflits de valeurs |
| Réorganisation récente du travail | 6 — Insécurité |
| Manque de perspective d'évolution | 6 — Insécurité |
| Réintégration suite à une absence | 6 — Insécurité |
| Vie perso qui empiète sur la vie pro (événement de vie, proche-aidant) | Transverse |

> À chaque facteur on associe un **conseil d'ajustement** (déjà largement rédigé
> dans le brouillon) : alléger la charge, cadrer la réorganisation, valoriser,
> réguler l'équipe, organiser une reprise progressive, etc.

---

## 7. Restitution au manager

Pour une situation donnée, l'outil affiche :

1. **Le niveau de criticité** (N1→N4) avec un libellé clair et une couleur sobre.
2. **La posture recommandée** (le « quoi faire » d'ensemble).
3. **Les conseils ciblés**, un par élément coché (signal + contexte).
4. **Les ressources à mobiliser** selon le niveau — **bloc à compléter avec les
   dispositifs de l'entreprise** (voir §9).
5. Un **rappel de prudence** permanent (confidentialité, non-diagnostic, alerte
   immédiate si danger).

Option envisagée (à confirmer) : un bouton **« Imprimer / exporter »** pour que le
manager garde une synthèse pour préparer son échange — **sans aucun stockage**.

---

## 8. Architecture technique

- **Type** : page web **100 % statique** (HTML / CSS / JavaScript), hébergée sur
  **GitHub Pages** → un simple lien à partager.
- **Aucun backend, aucune base, aucun cookie de suivi.** Toute la logique tourne
  dans le navigateur. Rien n'est envoyé ni conservé.
- **Contenu piloté par les données** : signaux, contextes, conseils, niveaux,
  seuils et ressources vivent dans des fichiers **JSON** séparés. Mettre à jour
  un conseil = éditer le JSON, sans toucher au code.
- **Léger et accessible** : pas de dépendance lourde, lisible sur mobile,
  respect des contrastes (accessibilité).

### Structure de données envisagée
```jsonc
// data/signaux.json (extrait)
{
  "signaux": [
    {
      "id": "mal_etre_exprime",
      "libelle": "Mal-être exprimé ouvertement",
      "categorie": "souffrance",
      "poids": 3,
      "drapeau_rouge": true,
      "conseil": "Orienter sans délai vers les ressources internes …"
    }
  ],
  "contexte": [
    {
      "id": "forte_charge",
      "libelle": "Forte charge de travail",
      "famille_gollac": "intensite",
      "conseil": "Réévaluer la répartition des tâches, prioriser, alléger …"
    }
  ],
  "niveaux": [
    { "id": "N3", "libelle": "Situation dégradée", "seuil_min": 6, "posture": "…", "ressources": ["RH", "…"] }
  ]
}
```

### Arborescence cible (à la mise en œuvre)
```
/
├── index.html
├── assets/        (css, js, éventuel logo)
├── data/          (signaux.json, niveaux.json, ressources.json)
├── CADRAGE.md     (ce document)
└── README.md
```

---

## 9. À compléter par toi (entreprise)

Emplacements prévus pour brancher tes dispositifs internes :

- [ ] **Ressources par niveau** : référent RPS, **cellule d'écoute Céla**,
      médecine du travail, RH de proximité, dispositif proche-aidant (Camille),
      process d'alerte, process de déclaration d'incivilité, dispositif CIT…
- [ ] **Liens / contacts** (qui contacter, comment, dans quel ordre).
- [ ] **Renvois aux process** : EAE, bilan RH, entretien de reprise, volet
      disciplinaire (à manier avec précaution, jamais en première intention).
- [ ] **Validation** des poids, des seuils et des ajouts de signaux.
- [ ] **Identité visuelle** (logo, couleurs de l'entreprise).

---

## 10. Étapes proposées

1. **Valider ce cadrage** (modèle, pondérations, ajouts, niveaux). ⬅️ on en est là
2. Figer le **contenu** dans les fichiers `data/*.json` (signaux + conseils + contextes).
3. Développer la **page statique** (sélection → score → restitution).
4. Brancher les **ressources entreprise** (§9).
5. **Tester** avec quelques managers, ajuster les seuils et les libellés.
6. **Publier** sur GitHub Pages et partager le lien.

---

## 11. Points tranchés

- **Seuils** de §4.3 : validés comme base (à recalibrer après tests terrain).
- **4 ajouts de signaux** (§5) : conservés.
- Bouton **« imprimer / exporter »** : non retenu.
- **Écran d'accueil** : oui — bref rappel de ce que fait l'outil + cadre /
  confidentialité avant la check-list.

> Mise en œuvre : la première version de l'outil (page statique + `data/contenu.json`)
> est en place. Reste à brancher les **ressources internes** (§9) et à recalibrer
> les seuils après les premiers retours managers.
