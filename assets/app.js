/* Matrice de criticité — logique côté navigateur.
 * Aucune donnée n'est stockée ni transmise : tout vit dans cette page. */

(function () {
  "use strict";

  var data = null;
  var etat = { signaux: {}, contexte: {} }; // id -> true/false

  /* ---------- Utilitaires DOM ---------- */
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function montrer(id) {
    ["ecran-accueil", "ecran-checklist", "ecran-resultat"].forEach(function (e) {
      $("#" + e).hidden = (e !== id);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Chargement des données ---------- */
  function charger() {
    return fetch("data/contenu.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
  }

  /* ---------- Accueil ---------- */
  function rendreAccueil() {
    var m = data.meta;
    $("#app-titre").textContent = m.titre;
    document.title = m.titre + " — Aide au manager";
    $("#app-sous-titre").textContent = m.sous_titre || "";
    $("#accueil-intro").textContent = m.accueil.intro;
    var ul = $("#accueil-points");
    ul.innerHTML = "";
    (m.accueil.points || []).forEach(function (p) {
      var li = el("li");
      li.textContent = p;
      ul.appendChild(li);
    });
    $("#btn-commencer").textContent = m.accueil.cta || "Commencer";
    $("#prudence").textContent = m.prudence || "";
  }

  /* ---------- Check-list ---------- */
  function rendreItem(item, type, dansCategorie) {
    var label = el("label", "item");
    label.setAttribute("data-id", item.id);

    var input = el("input");
    input.type = "checkbox";
    input.checked = !!etat[type][item.id];
    input.addEventListener("change", function () {
      etat[type][item.id] = input.checked;
      label.classList.toggle("coche", input.checked);
      majCompteurs();
    });

    var span = el("span", "libelle");
    span.textContent = item.libelle;

    if (item.drapeau_rouge) {
      var flag = el("span", "pastille-rouge");
      flag.textContent = "🚩 prioritaire";
      span.appendChild(flag);
    }
    if (!dansCategorie && item.famille_gollac) {
      var fam = el("span", "famille");
      fam.textContent = item.famille_gollac;
      span.appendChild(fam);
    }

    label.classList.toggle("coche", input.checked);
    label.appendChild(input);
    label.appendChild(span);
    return label;
  }

  function rendreListeSignaux() {
    var cont = $("#liste-signaux");
    cont.innerHTML = "";
    // Regrouper par catégorie en conservant l'ordre d'apparition.
    var ordre = [];
    var groupes = {};
    data.signaux.forEach(function (s) {
      var c = s.categorie || "Autres";
      if (!groupes[c]) { groupes[c] = []; ordre.push(c); }
      groupes[c].push(s);
    });
    ordre.forEach(function (cat) {
      var titre = el("p", "cat-titre");
      titre.textContent = cat;
      cont.appendChild(titre);
      groupes[cat].forEach(function (s) {
        cont.appendChild(rendreItem(s, "signaux", true));
      });
    });
  }

  function rendreListeContexte() {
    var cont = $("#liste-contexte");
    cont.innerHTML = "";
    data.contexte.forEach(function (c) {
      cont.appendChild(rendreItem(c, "contexte", false));
    });
  }

  function majCompteurs() {
    $("#compteur-signaux").textContent = compter("signaux");
    $("#compteur-contexte").textContent = compter("contexte");
  }
  function compter(type) {
    return Object.keys(etat[type]).filter(function (k) { return etat[type][k]; }).length;
  }
  function selectionnes(type, source) {
    return source.filter(function (it) { return etat[type][it.id]; });
  }

  /* ---------- Calcul de la criticité ---------- */
  function calculer() {
    var sigSel = selectionnes("signaux", data.signaux);
    var ctxSel = selectionnes("contexte", data.contexte);

    var scoreSignaux = sigSel.reduce(function (acc, s) { return acc + (s.poids || 0); }, 0);

    var cfg = data.config || {};
    var base = cfg.multiplicateur_base != null ? cfg.multiplicateur_base : 1;
    var pas = cfg.multiplicateur_par_contexte != null ? cfg.multiplicateur_par_contexte : 0.1;
    var plafond = cfg.multiplicateur_max != null ? cfg.multiplicateur_max : 1.5;
    var multiplicateur = Math.min(base + pas * ctxSel.length, plafond);

    var score = scoreSignaux * multiplicateur;
    var drapeauRouge = sigSel.some(function (s) { return s.drapeau_rouge; });

    var niveau = determinerNiveau(score, drapeauRouge, sigSel.length);

    return {
      niveau: niveau,
      score: score,
      drapeauRouge: drapeauRouge,
      signaux: sigSel,
      contexte: ctxSel
    };
  }

  function determinerNiveau(score, drapeauRouge, nbSignaux) {
    if (nbSignaux === 0) return trouverNiveau("N0");
    if (drapeauRouge) return trouverNiveau("N4");
    // Niveaux avec seuil > 0, du plus haut au plus bas.
    var paliers = data.niveaux
      .filter(function (n) { return n.seuil_min > 0; })
      .sort(function (a, b) { return b.seuil_min - a.seuil_min; });
    for (var i = 0; i < paliers.length; i++) {
      if (score >= paliers[i].seuil_min) return paliers[i];
    }
    return trouverNiveau("N1");
  }
  function trouverNiveau(id) {
    return data.niveaux.filter(function (n) { return n.id === id; })[0] || data.niveaux[0];
  }

  /* ---------- Restitution ---------- */
  function rendreResultat(res) {
    var n = res.niveau;

    var bandeau = $("#bandeau-niveau");
    bandeau.style.background = n.couleur || "#2c5282";
    bandeau.innerHTML = "";
    var idSpan = el("div", "niveau-id");
    idSpan.textContent = "Niveau de criticité " + n.id;
    var libSpan = el("div", "niveau-libelle");
    libSpan.textContent = n.libelle;
    bandeau.appendChild(idSpan);
    bandeau.appendChild(libSpan);

    var posture = $("#bloc-posture");
    posture.innerHTML = "";
    var hP = el("h3"); hP.textContent = "Posture recommandée";
    var pP = el("p", "posture-txt"); pP.textContent = n.posture || "";
    posture.appendChild(hP);
    posture.appendChild(pP);
    if (res.drapeauRouge) {
      var alerte = el("p", "posture-txt");
      alerte.style.borderLeftColor = "#c53030";
      alerte.style.background = "#fff5f5";
      alerte.innerHTML = "<strong>Un signal prioritaire a été coché.</strong> La situation est traitée au niveau le plus élevé par précaution.";
      posture.appendChild(alerte);
    }

    rendreConseils($("#bloc-conseils-signaux"), "Conseils sur les signaux observés", res.signaux, false);
    rendreConseils($("#bloc-conseils-contexte"), "Conseils sur le contexte de travail", res.contexte, true);

    var rb = $("#bloc-ressources");
    rb.innerHTML = "";
    var hR = el("h3"); hR.textContent = "Ressources à mobiliser";
    rb.appendChild(hR);
    if (n.ressources && n.ressources.length) {
      var ul = el("ul", "ressources-liste");
      n.ressources.forEach(function (r) {
        var li = el("li"); li.textContent = r;
        ul.appendChild(li);
      });
      rb.appendChild(ul);
    } else {
      var v = el("p", "vide"); v.textContent = "Aucune ressource spécifique à ce niveau.";
      rb.appendChild(v);
    }
  }

  function rendreConseils(bloc, titre, items, avecFamille) {
    bloc.innerHTML = "";
    var h = el("h3"); h.textContent = titre;
    bloc.appendChild(h);
    if (!items.length) {
      var v = el("p", "vide"); v.textContent = "Aucun élément coché.";
      bloc.appendChild(v);
      return;
    }
    items.forEach(function (it) {
      var card = el("div", "conseil-item");
      var t = el("div", "titre");
      var lib = document.createElement("span");
      lib.textContent = it.libelle;
      t.appendChild(lib);
      if (avecFamille && it.famille_gollac) {
        var fam = el("span", "famille");
        fam.textContent = "· " + it.famille_gollac;
        t.appendChild(fam);
      }
      var p = el("p"); p.textContent = it.conseil || "";
      card.appendChild(t);
      card.appendChild(p);
      bloc.appendChild(card);
    });
  }

  /* ---------- Réinitialisation ---------- */
  function toutDecocher() {
    etat = { signaux: {}, contexte: {} };
    document.querySelectorAll(".item input").forEach(function (i) {
      i.checked = false;
      i.closest(".item").classList.remove("coche");
    });
    majCompteurs();
  }

  /* ---------- Évènements ---------- */
  function brancher() {
    $("#btn-commencer").addEventListener("click", function () { montrer("ecran-checklist"); });
    $("#btn-evaluer").addEventListener("click", function () {
      rendreResultat(calculer());
      montrer("ecran-resultat");
    });
    $("#btn-reset").addEventListener("click", toutDecocher);
    $("#btn-modifier").addEventListener("click", function () { montrer("ecran-checklist"); });
    $("#btn-recommencer").addEventListener("click", function () {
      toutDecocher();
      montrer("ecran-checklist");
    });
  }

  /* ---------- Démarrage ---------- */
  charger()
    .then(function (json) {
      data = json;
      rendreAccueil();
      rendreListeSignaux();
      rendreListeContexte();
      majCompteurs();
      brancher();
      montrer("ecran-accueil");
    })
    .catch(function (err) {
      $("#main").innerHTML =
        '<div class="ecran"><h2>Chargement impossible</h2><p>Le contenu n\'a pas pu être chargé (' +
        String(err) +
        ').</p><p class="vide">Si vous ouvrez le fichier directement depuis le disque, lancez plutôt un petit serveur local (voir le README).</p></div>';
    });
})();
