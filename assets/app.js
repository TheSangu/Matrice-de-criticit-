/* Matrice de criticité — logique côté navigateur.
 * Approche par item : chaque signal porte sa propre criticité et son conseil.
 * Le niveau d'ensemble = le signal le plus sérieux coché (aucune pondération).
 * Aucune donnée n'est stockée ni transmise : tout vit dans cette page. */

(function () {
  "use strict";

  var data = null;
  var etat = { signaux: {}, contexte: {} };
  var STEPS = ["accueil", "signaux", "contexte", "resultat"];
  var step = 0;

  function $(s) { return document.querySelector(s); }
  function el(t, c) { var n = document.createElement(t); if (c) n.className = c; return n; }

  fetch("data/contenu.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (json) { data = json; init(); })
    .catch(function (err) {
      if (window.console && console.error) console.error("Chargement du contenu impossible :", err);
      $("#app").innerHTML =
        '<section class="step" role="alert" tabindex="-1" id="erreur-chargement">' +
        "<h2>Chargement impossible</h2><p>Le contenu n'a pas pu être chargé. Réessayez plus tard ou " +
        'signalez-le au support.</p><p class="opt">En local, lancez un petit serveur (voir le README).</p></section>';
      var box = $("#erreur-chargement"); if (box) box.focus();
    });

  function init() {
    var m = data.meta;
    $("#app-titre").textContent = m.titre;
    document.title = m.titre + " — Aide au manager";
    $("#app-sous-titre").textContent = m.sous_titre || "";
    $("#prudence").textContent = m.prudence || "";

    $("#accueil-intro").textContent = m.accueil.intro;
    var ul = $("#accueil-points");
    (m.accueil.points || []).forEach(function (p) { var li = el("li"); li.textContent = p; ul.appendChild(li); });

    var leg = $("#legende");
    Object.keys(m.familles).forEach(function (k) {
      var f = m.familles[k];
      var s = el("span", "leg-item");
      s.textContent = f.puce + " " + f.libelle;
      leg.appendChild(s);
    });

    rendreSignaux();
    rendreContexte();
    brancher();
    aller(0);
  }

  /* ---------- Étape signaux : colonnes par famille ---------- */
  function rendreSignaux() {
    var cont = $("#grille-signaux");
    cont.innerHTML = "";
    Object.keys(data.meta.familles).forEach(function (fid) {
      var f = data.meta.familles[fid];
      var sigs = data.signaux.filter(function (s) { return s.famille === fid; });
      if (!sigs.length) return;
      var col = el("div", "famille-col");
      col.style.setProperty("--fc", f.couleur);
      col.setAttribute("role", "group");
      col.setAttribute("aria-labelledby", "fam-" + fid);
      var h = el("p", "famille-titre");
      h.id = "fam-" + fid;
      h.innerHTML = '<span class="puce">' + f.puce + "</span> " + f.libelle;
      col.appendChild(h);
      sigs.forEach(function (s) { col.appendChild(chip(s, "signaux")); });
      cont.appendChild(col);
    });
  }

  function rendreContexte() {
    var cont = $("#grille-contexte");
    cont.innerHTML = "";
    data.contexte.forEach(function (c) { cont.appendChild(chip(c, "contexte")); });
  }

  function chip(item, type) {
    var b = el("button", "chip");
    b.type = "button";
    b.dataset.id = item.id;
    b.setAttribute("aria-pressed", "false");
    b.textContent = item.libelle;
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
        if (STEPS[step + 1] === "resultat") rendreResultat();
        aller(step + 1);
      } else { recommencer(); }
    });
    $("#btn-retour").addEventListener("click", function () { if (step > 0) aller(step - 1); });
  }

  function aller(i) {
    step = i;
    STEPS.forEach(function (name, idx) { $("#step-" + name).hidden = idx !== i; });
    $("#steps").querySelectorAll("li").forEach(function (li) {
      var n = parseInt(li.dataset.step, 10);
      li.classList.toggle("actif", n === i);
      li.classList.toggle("fait", n < i);
    });
    var suivant = $("#btn-suivant");
    $("#btn-retour").hidden = (i === 0);
    if (i === 0) suivant.textContent = "Commencer";
    else if (STEPS[i] === "contexte") suivant.textContent = "Voir le résultat";
    else if (STEPS[i] === "resultat") suivant.textContent = "Nouvelle situation";
    else suivant.textContent = "Suivant →";

    // a11y : repère d'étape pour lecteurs d'écran + focus sur la tête de l'étape
    // (annonce le contenu révélé, dont le bandeau role=status du résultat).
    majCompteurEtape(i);
    var cible = (STEPS[i] === "resultat") ? $("#bandeau-niveau") : $("#step-" + STEPS[i] + " h2");
    if (cible) { cible.setAttribute("tabindex", "-1"); cible.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* Compteur d'étape (visible des seuls lecteurs d'écran). */
  function majCompteurEtape(i) {
    var prev = document.querySelector(".sr-step-count");
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (i < 1) return; // accueil : pas de compteur
    var h = $("#step-" + STEPS[i] + " h2");
    if (!h) return;
    var s = el("span", "sr-only sr-step-count");
    s.textContent = " (étape " + i + " sur " + (STEPS.length - 1) + ")";
    h.appendChild(s);
  }

  function recommencer() {
    etat = { signaux: {}, contexte: {} };
    document.querySelectorAll(".chip.actif").forEach(function (c) {
      c.classList.remove("actif"); c.setAttribute("aria-pressed", "false");
    });
    aller(1);
  }

  /* ---------- Sélections ---------- */
  function selSignaux() { return data.signaux.filter(function (s) { return etat.signaux[s.id]; }); }
  function selContexte() { return data.contexte.filter(function (c) { return etat.contexte[c.id]; }); }
  function niv(id) { return data.niveaux.filter(function (n) { return n.id === id; })[0]; }

  /* ---------- Évaluation : le plus sérieux signal coché ---------- */
  function evaluer() {
    var sig = selSignaux();
    var ctx = selContexte();
    if (!sig.length) return { niveau: niv("N0"), sig: sig, ctx: ctx };
    var maxRang = 0;
    sig.forEach(function (s) { var r = niv(s.niveau).rang; if (r > maxRang) maxRang = r; });
    return { niveau: data.niveaux.filter(function (n) { return n.rang === maxRang; })[0], sig: sig, ctx: ctx };
  }

  /* ---------- Restitution ---------- */
  function rendreResultat() {
    var res = evaluer();
    var n = res.niveau;

    var bandeau = $("#bandeau-niveau");
    bandeau.style.background = n.couleur;
    bandeau.innerHTML =
      '<div class="niv-id">Niveau de criticité ' + n.id + "</div>" +
      '<div class="niv-libelle">' + n.libelle + "</div>" +
      '<p class="niv-resume">' + n.resume + "</p>";

    var lecture = $("#lecture");
    if (res.sig.length) {
      lecture.hidden = false;
      lecture.textContent = res.sig.length + (res.sig.length > 1 ? " signaux cochés" : " signal coché") +
        (res.ctx.length ? " · " + res.ctx.length + " élément" + (res.ctx.length > 1 ? "s" : "") + " de contexte" : "") +
        " — la conduite est donnée par le signal le plus sérieux.";
    } else { lecture.hidden = true; }

    var cols = $(".resultat-cols");
    var bloc = $(".bloc-detail");
    var afficher = (n.id !== "N0");
    cols.style.display = afficher ? "" : "none";
    bloc.style.display = afficher ? "" : "none";

    if (afficher) {
      $("#posture").textContent = n.posture;
      remplirListe($("#demarche"), n.demarche);
      remplirListe($("#a-eviter"), data.meta.a_eviter);
      rendreRessources($("#ressources"), n.ressources);
      $("#appui-note").textContent = data.meta.appui_note || "";
      rendreDetail(res);
    }
    // Les communications sont contextuelles : elles peuvent dépendre d'un
    // contexte coché seul (donc même en N0). rendreAffichages gère son propre
    // état d'affichage selon les ressources actives.
    rendreAffichages(res, n);
  }

  /* ---------- Résultat : communications à diffuser, filtrées sur la situation ---------- */
  function rendreAffichages(res, n) {
    var box = $("#affichages");
    var aff = data.meta.affichages;
    if (!aff || !aff.items) { box.hidden = true; return; }

    // Ressources « actives » = celles du niveau + celles des contextes cochés
    var actives = {};
    (n.ressources || []).forEach(function (r) { actives[r] = true; });
    res.ctx.forEach(function (c) { if (c.ressource) actives[c.ressource] = true; });

    var items = aff.items.filter(function (it) {
      return (it.ressources || []).some(function (r) { return actives[r]; });
    });
    if (!items.length) { box.hidden = true; return; }

    box.hidden = false;
    $("#affichages-titre").textContent = aff.titre || "Communications à diffuser";
    $("#affichages-intro").textContent = aff.intro || "";

    var cont = $("#affichages-themes");
    cont.innerHTML = "";
    var themes = [];
    items.forEach(function (it) {
      var t = it.theme || "";
      var grp = themes.filter(function (g) { return g.titre === t; })[0];
      if (!grp) { grp = { titre: t, items: [] }; themes.push(grp); }
      grp.items.push(it);
    });
    themes.forEach(function (g) {
      if (g.titre) { var h = el("p", "affichages-theme"); h.textContent = g.titre; cont.appendChild(h); }
      var ul = el("ul", "affichages-liste");
      g.items.forEach(function (it) {
        var li = el("li");
        var a = el("a"); a.href = it.fichier; a.target = "_blank"; a.rel = "noopener";
        a.textContent = it.titre;
        var hint = el("span", "sr-only"); hint.textContent = " (PDF, nouvel onglet)";
        a.appendChild(hint);
        li.appendChild(a);
        ul.appendChild(li);
      });
      cont.appendChild(ul);
    });
  }

  function remplirListe(node, items) {
    node.innerHTML = "";
    (items || []).forEach(function (t) { var li = el("li"); li.textContent = t; node.appendChild(li); });
  }

  /* Catalogue des dispositifs internes (meta.ressources). */
  function ressource(id) { return (data.meta.ressources || {})[id] || null; }

  /* Rend la liste « Vers qui orienter » en cartes (libellé + rôle + contact/lien). */
  function rendreRessources(node, ids) {
    node.innerHTML = "";
    (ids || []).forEach(function (id) {
      var r = ressource(id);
      var li = el("li", "ressource-item");
      if (!r) { li.textContent = id; node.appendChild(li); return; } // tolérance : ancien libellé brut
      var nom = el("span", "ressource-nom"); nom.textContent = r.libelle;
      li.appendChild(nom);
      if (r.role) { var role = el("span", "ressource-role"); role.textContent = r.role; li.appendChild(role); }
      var coord = ligneContact(r);
      if (coord) li.appendChild(coord);
      node.appendChild(li);
    });
  }

  /* Ligne contact + lien, affichée seulement si renseignée. */
  function ligneContact(r) {
    if (!r.contact && !r.lien) return null;
    var c = el("span", "ressource-contact");
    if (r.contact) c.appendChild(document.createTextNode(r.contact));
    if (r.lien) {
      if (r.contact) c.appendChild(document.createTextNode(" · "));
      var a = el("a"); a.href = r.lien; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "en savoir plus";
      var hint = el("span", "sr-only"); hint.textContent = " (" + r.libelle + ", nouvel onglet)";
      a.appendChild(hint);
      c.appendChild(a);
    }
    return c;
  }

  function rendreDetail(res) {
    var box = $("#detail-contenu");
    box.innerHTML = "";

    if (res.sig.length) {
      // Signaux triés du plus sérieux au moins sérieux
      var sig = res.sig.slice().sort(function (a, b) { return niv(b.niveau).rang - niv(a.niveau).rang; });
      sig.forEach(function (s) {
        var nv = niv(s.niveau);
        var item = el("div", "detail-item");
        var titre = el("p", "detail-item-titre");
        var tag = el("span", "tag-niveau");
        tag.style.background = nv.couleur;
        tag.textContent = nv.libelle;
        titre.appendChild(tag);
        titre.appendChild(document.createTextNode(" " + s.libelle));
        var p = el("p"); p.textContent = s.conseil;
        item.appendChild(titre); item.appendChild(p);
        box.appendChild(item);
      });
    }

    if (res.ctx.length) {
      box.appendChild(sousTitre("Contexte de travail — leviers d'action"));
      res.ctx.forEach(function (c) {
        var item = el("div", "detail-item");
        var titre = el("p", "detail-item-titre");
        titre.textContent = c.libelle + " — " + c.famille_gollac;
        var p = el("p"); p.textContent = c.conseil;
        item.appendChild(titre); item.appendChild(p);
        var r = c.ressource && ressource(c.ressource);
        if (r) {
          var lien = el("p", "detail-ressource");
          lien.appendChild(document.createTextNode("→ Ressource : "));
          var nom = el("strong"); nom.textContent = r.libelle; lien.appendChild(nom);
          if (r.contact) lien.appendChild(document.createTextNode(" — " + r.contact));
          item.appendChild(lien);
        }
        box.appendChild(item);
      });
    }
  }
  function sousTitre(t) { var p = el("p", "detail-soustitre"); p.textContent = t; return p; }
})();
