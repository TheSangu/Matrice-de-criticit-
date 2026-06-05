/* Matrice de criticité — logique côté navigateur.
 * Aucune donnée n'est stockée ni transmise : tout vit dans cette page. */

(function () {
  "use strict";

  var data = null;
  var etat = { signaux: {}, contexte: {}, temporalite: "ponctuel" };
  var STEPS = ["accueil", "signaux", "contexte", "resultat"];
  var step = 0;

  function $(s) { return document.querySelector(s); }
  function el(t, c) { var n = document.createElement(t); if (c) n.className = c; return n; }

  /* ---------- Chargement ---------- */
  fetch("data/contenu.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (json) { data = json; init(); })
    .catch(function (err) {
      $("#app").innerHTML =
        '<section class="step"><h2>Chargement impossible</h2><p>Le contenu n\'a pas pu être chargé (' +
        String(err) + ').</p><p class="opt">En local, lancez un petit serveur (voir le README).</p></section>';
    });

  /* ---------- Initialisation ---------- */
  function init() {
    var m = data.meta;
    $("#app-titre").textContent = m.titre;
    document.title = m.titre + " — Aide au manager";
    $("#app-sous-titre").textContent = m.sous_titre || "";
    $("#prudence").textContent = m.prudence || "";

    // Accueil
    $("#accueil-intro").textContent = m.accueil.intro;
    var ul = $("#accueil-points");
    (m.accueil.points || []).forEach(function (p) { var li = el("li"); li.textContent = p; ul.appendChild(li); });

    // Légende des familles
    var leg = $("#legende");
    Object.keys(m.familles).forEach(function (k) {
      var f = m.familles[k];
      var s = el("span", "leg-item");
      s.textContent = f.puce + " " + f.libelle;
      leg.appendChild(s);
    });

    rendreSignaux();
    rendreTemporalite();
    rendreContexte();
    brancher();
    aller(0);
  }

  /* ---------- Étape 1 : signaux (par famille) ---------- */
  function rendreSignaux() {
    var cont = $("#grille-signaux");
    cont.innerHTML = "";
    Object.keys(data.meta.familles).forEach(function (fid) {
      var f = data.meta.familles[fid];
      var sigs = data.signaux.filter(function (s) { return s.famille === fid; });
      if (!sigs.length) return;
      var col = el("div", "famille-col");
      col.style.setProperty("--fc", f.couleur);
      var h = el("p", "famille-titre");
      h.innerHTML = '<span class="puce">' + f.puce + "</span> " + f.libelle;
      col.appendChild(h);
      sigs.forEach(function (s) { col.appendChild(chip(s, "signaux")); });
      cont.appendChild(col);
    });
  }

  /* ---------- Étape 2 : temporalité + contexte ---------- */
  function rendreTemporalite() {
    var cont = $("#choix-temporalite");
    cont.innerHTML = "";
    data.meta.temporalite.forEach(function (t) {
      var b = el("button", "seg");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.dataset.id = t.id;
      b.innerHTML = '<span class="seg-titre">' + t.libelle + "</span><span class=\"seg-aide\">" + t.aide + "</span>";
      b.addEventListener("click", function () {
        etat.temporalite = t.id;
        cont.querySelectorAll(".seg").forEach(function (x) {
          var on = x === b;
          x.classList.toggle("actif", on);
          x.setAttribute("aria-checked", on ? "true" : "false");
        });
      });
      cont.appendChild(b);
    });
    cont.querySelector(".seg").click(); // défaut : ponctuel
  }

  function rendreContexte() {
    var cont = $("#grille-contexte");
    cont.innerHTML = "";
    data.contexte.forEach(function (c) { cont.appendChild(chip(c, "contexte")); });
  }

  /* ---------- Chip réutilisable ---------- */
  function chip(item, type) {
    var b = el("button", "chip");
    b.type = "button";
    b.dataset.id = item.id;
    b.setAttribute("aria-pressed", "false");
    var txt = item.libelle + (item.drapeau_rouge ? " 🚩" : "");
    b.textContent = txt;
    b.addEventListener("click", function () {
      var on = !etat[type][item.id];
      etat[type][item.id] = on;
      b.classList.toggle("actif", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    return b;
  }

  /* ---------- Navigation ---------- */
  function brancher() {
    $("#btn-suivant").addEventListener("click", function () {
      if (step < STEPS.length - 1) {
        if (STEPS[step + 1] === "resultat") calculerEtRendre();
        aller(step + 1);
      } else {
        recommencer();
      }
    });
    $("#btn-retour").addEventListener("click", function () { if (step > 0) aller(step - 1); });
  }

  function aller(i) {
    step = i;
    STEPS.forEach(function (name, idx) { $("#step-" + name).hidden = idx !== i; });

    // Fil d'étapes
    $("#steps").querySelectorAll("li").forEach(function (li) {
      var n = parseInt(li.dataset.step, 10);
      li.classList.toggle("actif", n === i);
      li.classList.toggle("fait", n < i);
    });

    // Boutons
    var suivant = $("#btn-suivant");
    $("#btn-retour").hidden = (i === 0);
    if (i === 0) suivant.textContent = "Commencer";
    else if (STEPS[i] === "contexte") suivant.textContent = "Voir le résultat";
    else if (STEPS[i] === "resultat") suivant.textContent = "Nouvelle situation";
    else suivant.textContent = "Suivant →";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function recommencer() {
    etat = { signaux: {}, contexte: {}, temporalite: "ponctuel" };
    document.querySelectorAll(".chip.actif").forEach(function (c) {
      c.classList.remove("actif"); c.setAttribute("aria-pressed", "false");
    });
    $("#choix-temporalite").querySelector(".seg").click();
    var d = $("#detail"); if (d) d.open = false;
    aller(1);
  }

  /* ---------- Sélections ---------- */
  function selSignaux() { return data.signaux.filter(function (s) { return etat.signaux[s.id]; }); }
  function selContexte() { return data.contexte.filter(function (c) { return etat.contexte[c.id]; }); }

  /* ---------- Calcul de criticité (matrice gravité × installation + convergence) ---------- */
  function evaluer() {
    var sig = selSignaux();
    var ctx = selContexte();
    if (!sig.length) return { niveau: niv("N0"), famille: null, sig: sig, ctx: ctx, redFlag: false };

    // Famille la plus grave parmi les signaux cochés
    var famille = null, gmax = -1;
    sig.forEach(function (s) {
      var g = data.meta.familles[s.famille].gravite;
      if (g > gmax) { gmax = g; famille = s.famille; }
    });

    var redFlag = sig.some(function (s) { return s.drapeau_rouge; });
    if (redFlag) return { niveau: niv("N4"), famille: famille, sig: sig, ctx: ctx, redFlag: true };

    // Niveau de base par la matrice
    var baseId = data.config.matrice[famille][etat.temporalite];
    var rang = niv(baseId).rang;

    // Convergence : faisceau de signaux, ou signaux + contexte
    var cv = data.config.convergence;
    if (sig.length >= cv.signaux_seuil ||
        (sig.length >= cv.signaux_min_avec_contexte && ctx.length >= cv.contexte_seuil)) {
      rang = Math.min(rang + cv.bump, 4);
    }

    // N4 (Alerte) réservé à la souffrance installée ou aux drapeaux rouges :
    // la convergence d'une situation relationnelle/performance ne dépasse pas N3.
    if (data.config.n4_reserve_sante && famille !== "sante") {
      rang = Math.min(rang, 3);
    }

    return { niveau: nivByRang(rang), famille: famille, sig: sig, ctx: ctx, redFlag: false };
  }

  function niv(id) { return data.niveaux.filter(function (n) { return n.id === id; })[0]; }
  function nivByRang(r) { return data.niveaux.filter(function (n) { return n.rang === r; })[0]; }

  /* ---------- Restitution ---------- */
  function calculerEtRendre() {
    var res = evaluer();
    var n = res.niveau;

    var bandeau = $("#bandeau-niveau");
    bandeau.style.background = n.couleur;
    bandeau.innerHTML =
      '<div class="niv-id">Niveau de criticité ' + n.id + "</div>" +
      '<div class="niv-libelle">' + n.libelle + "</div>" +
      '<p class="niv-resume">' + n.resume + "</p>";

    // Lecture de la situation (transparence du modèle)
    var lecture = $("#lecture");
    if (res.famille) {
      var f = data.meta.familles[res.famille];
      var tlib = data.meta.temporalite.filter(function (t) { return t.id === etat.temporalite; })[0].libelle;
      var bits = [f.puce + " " + f.libelle, "Installation : " + tlib,
        res.sig.length + (res.sig.length > 1 ? " signaux" : " signal") +
        (res.ctx.length ? " · " + res.ctx.length + " facteur" + (res.ctx.length > 1 ? "s" : "") + " de contexte" : "")];
      lecture.textContent = "Lecture : " + bits.join("  ·  ");
      lecture.hidden = false;
      if (res.redFlag) lecture.textContent += "  ·  🚩 signal prioritaire";
    } else {
      lecture.hidden = true;
    }

    // Cartes d'action
    var cols = $(".resultat-cols");
    cols.style.display = (n.id === "N0") ? "none" : "";
    $("#detail").style.display = (n.id === "N0") ? "none" : "";

    if (n.id !== "N0") {
      $("#posture").textContent = n.posture;
      remplirListe($("#demarche"), n.demarche);
      remplirListe($("#a-eviter"), data.meta.a_eviter);
      remplirListe($("#ressources"), n.ressources);
      $("#appui-note").textContent = data.meta.appui_note || "";
      rendreDetail(res);
    }
  }

  function remplirListe(node, items) {
    node.innerHTML = "";
    (items || []).forEach(function (t) { var li = el("li"); li.textContent = t; node.appendChild(li); });
  }

  function rendreDetail(res) {
    var box = $("#detail-contenu");
    box.innerHTML = "";
    if (res.sig.length) {
      box.appendChild(sousTitre("Signaux observés"));
      res.sig.forEach(function (s) {
        var f = data.meta.familles[s.famille];
        box.appendChild(ligneConseil(f.puce + " " + s.libelle, s.conseil));
      });
    }
    if (res.ctx.length) {
      box.appendChild(sousTitre("Contexte de travail"));
      res.ctx.forEach(function (c) {
        box.appendChild(ligneConseil(c.libelle + " — " + c.famille_gollac, c.conseil));
      });
    }
  }
  function sousTitre(t) { var p = el("p", "detail-soustitre"); p.textContent = t; return p; }
  function ligneConseil(titre, txt) {
    var d = el("div", "detail-item");
    var b = el("p", "detail-item-titre"); b.textContent = titre;
    var p = el("p"); p.textContent = txt;
    d.appendChild(b); d.appendChild(p);
    return d;
  }
})();
