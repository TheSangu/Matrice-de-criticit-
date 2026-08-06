/* Studio — éditeur de la matrice (Étape 1 : archétype « évaluation guidée »).
 *
 * Principe : les formulaires éditent un objet `projet` qui a EXACTEMENT la même
 * forme que data/contenu.json. La prévisualisation et la publication réutilisent
 * le moteur de rendu réel (assets/app.js) : ce qu'on voit = ce qui sera publié.
 *
 * Aucune donnée n'est transmise : tout vit dans le navigateur (localStorage),
 * rien ne part sans un clic explicite (Enregistrer / Publier). */

(function () {
  "use strict";

  var LS_KEY = "studio.matrice.projet.v1";
  var projet = null;   // contenu édité (même forme que contenu.json)
  var gabarit = null;  // { html, css, js, logo } pour générer la page publiée
  var tabActif = "identite";
  var previewTimer = null, saveTimer = null;

  /* ---------- utilitaires DOM ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function ce(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }
  function set(obj, key) { return function (v) { obj[key] = v; }; }
  function deplacer(arr, i, dir) { var j = i + dir; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function normaliserCouleur(v) { return /^#[0-9a-fA-F]{6}$/.test(v || "") ? v : "#888888"; }

  /* ---------- démarrage : charge le gabarit de rendu + le projet ---------- */
  Promise.all([
    fetch("index.html").then(function (r) { return r.text(); }),
    fetch("assets/style.css").then(function (r) { return r.text(); }),
    fetch("assets/app.js").then(function (r) { return r.text(); }),
    fetch("assets/logo.png").then(function (r) { return r.ok ? r.blob() : null; }).then(blobToDataURL).catch(function () { return null; })
  ]).then(function (parts) {
    gabarit = { html: parts[0], css: parts[1], js: parts[2], logo: parts[3] };
    return chargerProjet();
  }).then(function (p) {
    projet = p;
    demarrer();
  }).catch(function (err) {
    $("#panels").innerHTML = "<div class='panel-loading'>Impossible de charger le Studio.<br>" +
      "Lancez un petit serveur local (voir le README), puis rechargez la page.<br>" +
      "<small>" + (err && err.message || err) + "</small></div>";
  });

  function blobToDataURL(blob) {
    if (!blob) return Promise.resolve(null);
    return new Promise(function (res) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = function () { res(null); };
      fr.readAsDataURL(blob);
    });
  }

  function chargerProjet() {
    var saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { /* localStorage indispo */ }
    if (saved) { try { return Promise.resolve(JSON.parse(saved)); } catch (e) { /* brouillon corrompu */ } }
    return fetch("data/contenu.json", { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  function demarrer() {
    $("#tabs").addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (!b) return;
      tabActif = b.dataset.tab;
      $$(".tab").forEach(function (t) { t.classList.toggle("actif", t === b); });
      renderPanel(true);
    });

    $("#btn-enregistrer").addEventListener("click", enregistrerProjet);
    $("#btn-reinit").addEventListener("click", reinitialiser);
    $("#import-projet").addEventListener("change", importerProjet);

    var menu = $("#menu-publier");
    $("#btn-publier").addEventListener("click", function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener("click", function () { menu.hidden = true; });
    menu.addEventListener("click", function (e) {
      e.stopPropagation();
      var b = e.target.closest("button"); if (!b) return;
      menu.hidden = true; actionPublier(b.dataset.action);
    });

    renderPanel(true);
    updatePreview();
    marquerStatut("Prêt");
  }

  /* ---------- état / sauvegarde ---------- */
  function marquerStatut(t, saving) { var s = $("#statut"); if (!s) return; s.textContent = t; s.classList.toggle("saving", !!saving); }
  function sauverLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(projet)); } catch (e) { /* quota / indispo */ } }

  // Modification d'un champ : autosave + prévisu (tous deux temporisés).
  function commit() {
    marquerStatut("Enregistrement…", true);
    clearTimeout(saveTimer); saveTimer = setTimeout(function () { sauverLocal(); marquerStatut("Enregistré ✓"); }, 400);
    clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 300);
  }
  // Modification de structure (ajout / suppression / déplacement) : idem + reconstruit le panneau.
  function majStructure() { commit(); renderPanel(false); }

  /* ---------- constructeurs de champs ---------- */
  function champ(labelHTML, control) {
    var wrap = ce("div", "champ");
    var id = "f" + (champ._n = (champ._n || 0) + 1);
    control.id = id;
    var lab = ce("label"); lab.setAttribute("for", id); lab.innerHTML = labelHTML;
    wrap.appendChild(lab); wrap.appendChild(control);
    return wrap;
  }
  function inputText(value, oninput, type) {
    var i = ce("input"); i.type = type || "text"; i.value = value == null ? "" : value;
    i.addEventListener("input", function () { oninput(i.value); commit(); });
    return i;
  }
  function inputArea(value, oninput) {
    var t = ce("textarea"); t.value = value == null ? "" : value;
    t.addEventListener("input", function () { oninput(t.value); commit(); });
    return t;
  }
  function inputColor(value, oninput) {
    var i = ce("input"); i.type = "color"; i.value = normaliserCouleur(value);
    i.addEventListener("input", function () { oninput(i.value); commit(); });
    return i;
  }
  function selectOne(value, opts, oninput) {
    var s = ce("select");
    opts.forEach(function (o) { var op = ce("option"); op.value = o.value; op.textContent = o.label; if (o.value === value) op.selected = true; s.appendChild(op); });
    s.addEventListener("change", function () { oninput(s.value); commit(); });
    return s;
  }

  function miniBtn(label, titre, disabled, onclick, extra) {
    var b = ce("button", "mini-btn" + (extra ? " " + extra : "")); b.type = "button";
    b.textContent = label; b.title = titre; b.setAttribute("aria-label", titre);
    if (disabled) b.disabled = true; else b.addEventListener("click", onclick);
    return b;
  }
  function ajouterBouton(host, label, onclick) {
    var b = ce("button", "btn-ajouter"); b.type = "button"; b.textContent = label;
    b.addEventListener("click", onclick); host.appendChild(b);
  }
  function titrePanneau(host, titre, intro) {
    var h = ce("h2", "panel-titre"); h.textContent = titre; host.appendChild(h);
    if (intro) { var p = ce("p", "panel-intro"); p.textContent = intro; host.appendChild(p); }
  }
  function sousSection(host, t) { var d = ce("div", "sous-section"); d.textContent = t; host.appendChild(d); }
  function noteInfo(host, t) { var d = ce("div", "note-info"); d.textContent = t; host.appendChild(d); }
  function champLabelBloc(parent, labelText, node) {
    var w = ce("div", "champ"); var l = ce("div", "champ-label"); l.innerHTML = labelText;
    w.appendChild(l); w.appendChild(node); parent.appendChild(w);
  }

  // Carte d'un élément de liste, avec entête (numéro, titre, monter/descendre/supprimer).
  function carteListe(arr, i, titre) {
    var c = ce("div", "liste-carte");
    var tete = ce("div", "liste-carte-tete");
    var num = ce("span", "liste-carte-num"); num.textContent = "#" + (i + 1);
    var t = ce("span", "liste-carte-titre"); t.textContent = titre;
    var acts = ce("div", "mini-actions");
    acts.appendChild(miniBtn("↑", "Monter", i === 0, function () { deplacer(arr, i, -1); majStructure(); }));
    acts.appendChild(miniBtn("↓", "Descendre", i === arr.length - 1, function () { deplacer(arr, i, 1); majStructure(); }));
    acts.appendChild(miniBtn("✕", "Supprimer", false, function () { if (window.confirm("Supprimer « " + titre + " » ?")) { arr.splice(i, 1); majStructure(); } }, "suppr"));
    tete.appendChild(num); tete.appendChild(t); tete.appendChild(acts);
    c.appendChild(tete);
    return c;
  }

  // Liste de lignes de texte (points d'accueil, démarche, « à éviter »…).
  function listeTexte(arr, opts) {
    opts = opts || {};
    var wrap = ce("div");
    arr.forEach(function (val, i) {
      var row = ce("div", "champ-inline"); row.style.alignItems = "flex-start"; row.style.marginBottom = "0.4rem";
      var c = ce("div", "champ"); c.style.flex = "1"; c.style.marginBottom = "0";
      c.appendChild(opts.multiligne ? inputArea(val, function (v) { arr[i] = v; }) : inputText(val, function (v) { arr[i] = v; }));
      var acts = ce("div", "mini-actions");
      acts.appendChild(miniBtn("↑", "Monter", i === 0, function () { deplacer(arr, i, -1); majStructure(); }));
      acts.appendChild(miniBtn("↓", "Descendre", i === arr.length - 1, function () { deplacer(arr, i, 1); majStructure(); }));
      acts.appendChild(miniBtn("✕", "Supprimer", false, function () { arr.splice(i, 1); majStructure(); }, "suppr"));
      row.appendChild(c); row.appendChild(acts);
      wrap.appendChild(row);
    });
    var add = ce("button", "btn-ajouter"); add.type = "button"; add.textContent = opts.ajouterLabel || "+ Ajouter une ligne";
    add.addEventListener("click", function () { arr.push(""); majStructure(); });
    wrap.appendChild(add);
    return wrap;
  }

  // Liste ordonnée d'identifiants de ressources (ordre = ordre d'affichage).
  function listeIds(arr, opts) {
    var wrap = ce("div");
    arr.forEach(function (id, i) {
      var row = ce("div", "champ-inline"); row.style.alignItems = "center"; row.style.marginBottom = "0.35rem";
      var nom = ce("div", "champ"); nom.style.flex = "1"; nom.style.marginBottom = "0";
      var lab = ce("div"); lab.style.fontSize = "0.88rem";
      var libelle = opts.libelleDe(id);
      if (libelle) { lab.textContent = libelle; } else { lab.textContent = id + " (introuvable)"; lab.style.color = "#b4232a"; }
      nom.appendChild(lab);
      var acts = ce("div", "mini-actions");
      acts.appendChild(miniBtn("↑", "Monter", i === 0, function () { deplacer(arr, i, -1); majStructure(); }));
      acts.appendChild(miniBtn("↓", "Descendre", i === arr.length - 1, function () { deplacer(arr, i, 1); majStructure(); }));
      acts.appendChild(miniBtn("✕", "Retirer", false, function () { arr.splice(i, 1); majStructure(); }, "suppr"));
      row.appendChild(nom); row.appendChild(acts);
      wrap.appendChild(row);
    });
    var dispo = opts.disponibles().filter(function (o) { return arr.indexOf(o.value) < 0; });
    if (dispo.length) {
      var sel = ce("select");
      var op0 = ce("option"); op0.value = ""; op0.textContent = opts.ajoutLabel || "+ Ajouter…"; sel.appendChild(op0);
      dispo.forEach(function (o) { var op = ce("option"); op.value = o.value; op.textContent = o.label; sel.appendChild(op); });
      sel.addEventListener("change", function () { if (sel.value) { arr.push(sel.value); majStructure(); } });
      var c = ce("div", "champ"); c.style.marginBottom = "0"; c.style.marginTop = "0.2rem"; c.appendChild(sel);
      wrap.appendChild(c);
    }
    return wrap;
  }

  /* ---------- options partagées ---------- */
  function optionsFamilles() { return Object.keys(projet.meta.familles).map(function (k) { return { value: k, label: projet.meta.familles[k].libelle }; }); }
  function optionsNiveaux() { return projet.niveaux.filter(function (n) { return n.rang > 0; }).map(function (n) { return { value: n.id, label: n.id + " — " + n.libelle }; }); }
  function optionsRessources(inclureVide) {
    var arr = Object.keys(projet.meta.ressources || {}).map(function (k) { return { value: k, label: projet.meta.ressources[k].libelle }; });
    if (inclureVide) arr.unshift({ value: "", label: "— aucune —" });
    return arr;
  }
  function libelleRessource(id) { var r = (projet.meta.ressources || {})[id]; return r ? r.libelle : null; }
  function nouvelId(prefixe, arr) { var exist = {}; (arr || []).forEach(function (x) { if (x.id) exist[x.id] = true; }); var n = 1, id; do { id = prefixe + "_" + n; n++; } while (exist[id]); return id; }
  function nouvelIdMap(prefixe, map) { var n = 1, id; do { id = prefixe + "_" + n; n++; } while (map[id]); return id; }

  /* ---------- rendu du panneau actif ---------- */
  function renderPanel(resetScroll) {
    var host = $("#panels");
    var sc = resetScroll ? 0 : host.scrollTop;
    host.innerHTML = "";
    var rendus = { identite: panelIdentite, signaux: panelSignaux, contexte: panelContexte, niveaux: panelNiveaux, ressources: panelRessources, affiches: panelAffiches };
    (rendus[tabActif] || panelIdentite)(host);
    host.scrollTop = sc;
  }

  function panelIdentite(host) {
    var m = projet.meta;
    titrePanneau(host, "Identité & prévention", "Les textes vus par le manager : accroche d'accueil, rappels de prudence, « à éviter ». C'est ici qu'on met la doc et la prévention à jour.");
    host.appendChild(champ("Titre de l'outil", inputText(m.titre, set(m, "titre"))));
    host.appendChild(champ("Sous-titre", inputText(m.sous_titre, set(m, "sous_titre"))));

    sousSection(host, "Écran d'accueil");
    m.accueil = m.accueil || {};
    host.appendChild(champ("Phrase d'accroche", inputArea(m.accueil.intro, set(m.accueil, "intro"))));
    m.accueil.points = m.accueil.points || [];
    champLabelBloc(host, "Points clés de l'accueil", listeTexte(m.accueil.points, { ajouterLabel: "+ Ajouter un point", multiligne: true }));
    host.appendChild(champ("Texte du bouton « commencer »", inputText(m.accueil.cta, set(m.accueil, "cta"))));

    sousSection(host, "Prévention & prudence");
    noteInfo(host, "Ce rappel de prudence est affiché en permanence, en bas de l'outil.");
    host.appendChild(champ("Rappel de prudence", inputArea(m.prudence, set(m, "prudence"))));
    host.appendChild(champ("Note « appui » (rôle des relais)", inputArea(m.appui_note, set(m, "appui_note"))));
    m.a_eviter = m.a_eviter || [];
    champLabelBloc(host, "À éviter (liste affichée dans le résultat)", listeTexte(m.a_eviter, { ajouterLabel: "+ Ajouter un « à éviter »", multiligne: true }));
  }

  function panelSignaux(host) {
    titrePanneau(host, "Signaux d'alerte", "Ce que le manager peut cocher. Chaque signal porte son niveau de criticité et son conseil ; le niveau d'ensemble = le signal le plus sérieux coché.");

    sousSection(host, "Familles (colonnes de signaux)");
    Object.keys(projet.meta.familles).forEach(function (fid) {
      var f = projet.meta.familles[fid];
      var carte = ce("div", "liste-carte");
      var row = ce("div", "champ-inline");
      row.appendChild(champ("Libellé <span class='verrou'>(" + fid + ")</span>", inputText(f.libelle, set(f, "libelle"))));
      var pc = champ("Puce", inputText(f.puce, set(f, "puce"))); pc.style.flex = "0 0 90px"; row.appendChild(pc);
      var cc = champ("Couleur", inputColor(f.couleur, set(f, "couleur"))); cc.style.flex = "0 0 auto"; row.appendChild(cc);
      carte.appendChild(row);
      host.appendChild(carte);
    });

    sousSection(host, "Liste des signaux");
    var arr = projet.signaux;
    arr.forEach(function (s, i) {
      var carte = carteListe(arr, i, s.libelle || "(sans libellé)");
      carte.appendChild(champ("Libellé", inputText(s.libelle, set(s, "libelle"))));
      var row = ce("div", "champ-inline");
      row.appendChild(champ("Famille", selectOne(s.famille, optionsFamilles(), set(s, "famille"))));
      row.appendChild(champ("Niveau de criticité", selectOne(s.niveau, optionsNiveaux(), set(s, "niveau"))));
      carte.appendChild(row);
      carte.appendChild(champ("Conseil au manager", inputArea(s.conseil, set(s, "conseil"))));
      host.appendChild(carte);
    });
    ajouterBouton(host, "+ Ajouter un signal", function () {
      arr.push({ id: nouvelId("signal", arr), libelle: "Nouveau signal", famille: Object.keys(projet.meta.familles)[0], niveau: "N1", conseil: "" });
      majStructure();
    });
  }

  function panelContexte(host) {
    titrePanneau(host, "Contexte de travail", "Facteurs qui éclairent les causes et donnent des leviers d'action. Le contexte n'augmente pas le niveau.");
    var arr = projet.contexte;
    arr.forEach(function (c, i) {
      var carte = carteListe(arr, i, c.libelle || "(sans libellé)");
      carte.appendChild(champ("Libellé", inputText(c.libelle, set(c, "libelle"))));
      carte.appendChild(champ("Famille Gollac <span class='aide'>(texte affiché)</span>", inputText(c.famille_gollac, set(c, "famille_gollac"))));
      carte.appendChild(champ("Conseil / levier d'action", inputArea(c.conseil, set(c, "conseil"))));
      carte.appendChild(champ("Ressource associée <span class='aide'>(facultatif)</span>",
        selectOne(c.ressource || "", optionsRessources(true), function (v) { if (v) c.ressource = v; else delete c.ressource; })));
      host.appendChild(carte);
    });
    ajouterBouton(host, "+ Ajouter un facteur de contexte", function () {
      arr.push({ id: nouvelId("contexte", arr), libelle: "Nouveau facteur", famille_gollac: "", conseil: "" });
      majStructure();
    });
  }

  function panelNiveaux(host) {
    titrePanneau(host, "Niveaux de criticité", "La conduite d'ensemble selon le signal le plus sérieux coché. N0 = aucun signal.");
    noteInfo(host, "Les niveaux (N0→N4) sont la charpente de l'outil : on peut les reformuler, mais évitez d'en supprimer.");
    projet.niveaux.forEach(function (n) {
      var carte = ce("div", "liste-carte");
      var tete = ce("div", "liste-carte-tete");
      var num = ce("span", "liste-carte-num"); num.textContent = n.id;
      var t = ce("span", "liste-carte-titre"); t.textContent = n.libelle;
      tete.appendChild(num); tete.appendChild(t); carte.appendChild(tete);
      var row = ce("div", "champ-inline");
      row.appendChild(champ("Libellé", inputText(n.libelle, set(n, "libelle"))));
      var cc = champ("Couleur", inputColor(n.couleur, set(n, "couleur"))); cc.style.flex = "0 0 auto"; row.appendChild(cc);
      carte.appendChild(row);
      carte.appendChild(champ("Résumé", inputArea(n.resume, set(n, "resume"))));
      if (n.rang > 0) {
        carte.appendChild(champ("Posture", inputArea(n.posture, set(n, "posture"))));
        n.demarche = n.demarche || [];
        champLabelBloc(carte, "À faire maintenant (démarche)", listeTexte(n.demarche, { ajouterLabel: "+ Ajouter une action", multiligne: true }));
        n.ressources = n.ressources || [];
        champLabelBloc(carte, "Vers qui orienter <span class='aide'>(ordre = ordre de mobilisation)</span>",
          listeIds(n.ressources, { libelleDe: libelleRessource, disponibles: function () { return optionsRessources(false); }, ajoutLabel: "+ Ajouter une ressource" }));
      }
      host.appendChild(carte);
    });
  }

  function panelRessources(host) {
    titrePanneau(host, "Ressources (catalogue des dispositifs)", "Les dispositifs internes vers qui orienter. Ils sont réutilisés par les niveaux, les contextes et l'annuaire.");
    var res = projet.meta.ressources = projet.meta.ressources || {};
    Object.keys(res).forEach(function (id) {
      var r = res[id];
      var carte = ce("div", "liste-carte");
      var tete = ce("div", "liste-carte-tete");
      var num = ce("span", "liste-carte-num"); num.textContent = "id : " + id;
      var t = ce("span", "liste-carte-titre"); t.textContent = r.libelle || "(sans nom)";
      var acts = ce("div", "mini-actions");
      acts.appendChild(miniBtn("✕", "Supprimer", false, function () { supprimerRessource(id); }, "suppr"));
      tete.appendChild(num); tete.appendChild(t); tete.appendChild(acts); carte.appendChild(tete);
      carte.appendChild(champ("Nom affiché", inputText(r.libelle, set(r, "libelle"))));
      carte.appendChild(champ("Rôle / description", inputArea(r.role, set(r, "role"))));
      var row = ce("div", "champ-inline");
      row.appendChild(champ("Contact <span class='aide'>(tél, email, chemin…)</span>", inputText(r.contact, set(r, "contact"))));
      row.appendChild(champ("Lien <span class='aide'>(URL, facultatif)</span>", inputText(r.lien, set(r, "lien"), "url")));
      carte.appendChild(row);
      host.appendChild(carte);
    });
    ajouterBouton(host, "+ Ajouter une ressource", function () {
      var id = nouvelIdMap("ressource", res);
      res[id] = { libelle: "Nouvelle ressource", role: "", contact: "", lien: "" };
      majStructure();
    });
  }

  function ressourceReferencee(id) {
    var out = [];
    projet.niveaux.forEach(function (n) { if ((n.ressources || []).indexOf(id) >= 0) out.push("niveau " + n.id); });
    projet.contexte.forEach(function (c) { if (c.ressource === id) out.push("contexte « " + c.libelle + " »"); });
    if (projet.meta.ressources_utiles && (projet.meta.ressources_utiles.ids || []).indexOf(id) >= 0) out.push("annuaire");
    ((projet.meta.affichages && projet.meta.affichages.items) || []).forEach(function (it) { if ((it.ressources || []).indexOf(id) >= 0) out.push("affiche « " + it.titre + " »"); });
    return out;
  }
  function supprimerRessource(id) {
    var r = projet.meta.ressources[id];
    var refs = ressourceReferencee(id);
    var msg = refs.length
      ? "La ressource « " + (r.libelle || id) + " » est utilisée par : " + refs.join(", ") + ".\n\nLa supprimer quand même ? Elle sera retirée de ces endroits."
      : "Supprimer « " + (r.libelle || id) + " » ?";
    if (!window.confirm(msg)) return;
    projet.niveaux.forEach(function (n) { if (n.ressources) n.ressources = n.ressources.filter(function (x) { return x !== id; }); });
    projet.contexte.forEach(function (c) { if (c.ressource === id) delete c.ressource; });
    if (projet.meta.ressources_utiles && projet.meta.ressources_utiles.ids) projet.meta.ressources_utiles.ids = projet.meta.ressources_utiles.ids.filter(function (x) { return x !== id; });
    ((projet.meta.affichages && projet.meta.affichages.items) || []).forEach(function (it) { if (it.ressources) it.ressources = it.ressources.filter(function (x) { return x !== id; }); });
    delete projet.meta.ressources[id];
    majStructure();
  }

  function panelAffiches(host) {
    titrePanneau(host, "Affiches & annuaire", "Les communications officielles (PDF) filtrées selon la situation, et l'annuaire permanent affiché en bas du résultat.");

    sousSection(host, "Communications à diffuser");
    var aff = projet.meta.affichages = projet.meta.affichages || { titre: "", intro: "", items: [] };
    host.appendChild(champ("Titre du bloc", inputText(aff.titre, set(aff, "titre"))));
    host.appendChild(champ("Introduction", inputArea(aff.intro, set(aff, "intro"))));
    noteInfo(host, "Le champ « Fichier » pointe vers un PDF déjà présent dans assets/affichages/. L'import de nouveaux documents depuis le Studio arrive à l'étape 3.");
    aff.items = aff.items || [];
    aff.items.forEach(function (it, i) {
      var carte = carteListe(aff.items, i, it.titre || "(sans titre)");
      carte.appendChild(champ("Titre affiché", inputText(it.titre, set(it, "titre"))));
      var row = ce("div", "champ-inline");
      row.appendChild(champ("Fichier <span class='aide'>(chemin du PDF)</span>", inputText(it.fichier, set(it, "fichier"))));
      row.appendChild(champ("Thème <span class='aide'>(regroupement)</span>", inputText(it.theme, set(it, "theme"))));
      carte.appendChild(row);
      it.ressources = it.ressources || [];
      champLabelBloc(carte, "Affichée quand ces ressources sont actives",
        listeIds(it.ressources, { libelleDe: libelleRessource, disponibles: function () { return optionsRessources(false); }, ajoutLabel: "+ Lier une ressource" }));
      host.appendChild(carte);
    });
    ajouterBouton(host, "+ Ajouter une affiche", function () {
      aff.items.push({ titre: "Nouvelle affiche", fichier: "assets/affichages/", theme: "", ressources: [] });
      majStructure();
    });

    sousSection(host, "Annuaire permanent (ressources utiles)");
    var ru = projet.meta.ressources_utiles = projet.meta.ressources_utiles || { titre: "", intro: "", ids: [] };
    host.appendChild(champ("Titre", inputText(ru.titre, set(ru, "titre"))));
    host.appendChild(champ("Introduction", inputArea(ru.intro, set(ru, "intro"))));
    ru.ids = ru.ids || [];
    champLabelBloc(host, "Dispositifs listés <span class='aide'>(ordre = ordre d'affichage)</span>",
      listeIds(ru.ids, { libelleDe: libelleRessource, disponibles: function () { return optionsRessources(false); }, ajoutLabel: "+ Ajouter à l'annuaire" }));
  }

  /* ---------- génération de la page publiée (= prévisualisation) ---------- */
  // Le gabarit index.html avec CSS + données + app.js inlinés : une page autonome,
  // qui s'ouvre dans le navigateur sans accès réseau (même en file://).
  function buildStandalone(contenu) {
    var html = gabarit.html;
    html = html.replace('<link rel="stylesheet" href="assets/style.css" />', "<style>\n" + gabarit.css + "\n</style>");
    if (gabarit.logo) { html = html.split("assets/logo.png").join(gabarit.logo); }
    var donnees = "<scr" + "ipt>window.__CONTENU__ = " + jsonSafe(contenu) + ";</scr" + "ipt>";
    html = html.replace('<script src="assets/app.js"></script>', donnees + "\n<scr" + "ipt>\n" + gabarit.js + "\n</scr" + "ipt>");
    return html;
  }
  // JSON sûr à injecter dans une balise <script> (neutralise « </script> » éventuel).
  function jsonSafe(obj) { return JSON.stringify(obj).replace(/</g, "\\u003c"); }

  function updatePreview() {
    if (!gabarit) return;
    try { $("#preview").srcdoc = buildStandalone(projet); }
    catch (e) { if (window.console && console.error) console.error("Prévisualisation impossible :", e); }
  }

  /* ---------- actions de la barre d'outils ---------- */
  function telecharger(nom, contenu, mime) {
    var blob = new Blob([contenu], { type: mime + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = ce("a"); a.href = url; a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }
  function enregistrerProjet() { telecharger("projet-matrice.json", JSON.stringify(projet, null, 2), "application/json"); marquerStatut("Projet enregistré ✓"); }
  function actionPublier(action) {
    if (action === "publier-html") { telecharger("index.html", buildStandalone(projet), "text/html"); marquerStatut("Page publiée ✓"); }
    else if (action === "export-json") { telecharger("contenu.json", JSON.stringify(projet, null, 2), "application/json"); marquerStatut("contenu.json exporté ✓"); }
    else if (action === "apercu-onglet") {
      var blob = new Blob([buildStandalone(projet)], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    }
  }
  function importerProjet(e) {
    var file = e.target.files && e.target.files[0]; if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var obj = JSON.parse(fr.result);
        if (!obj.meta || !obj.signaux || !obj.niveaux) throw new Error("Fichier non reconnu (il manque meta / signaux / niveaux).");
        projet = obj; renderPanel(true); updatePreview(); sauverLocal(); marquerStatut("Projet chargé ✓");
      } catch (err) { window.alert("Impossible de charger ce fichier : " + (err.message || err)); }
    };
    fr.readAsText(file);
    e.target.value = "";
  }
  function reinitialiser() {
    if (!window.confirm("Réinitialiser à partir du contenu actuellement publié (data/contenu.json) ?\nVos modifications non enregistrées seront perdues.")) return;
    fetch("data/contenu.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (json) {
      projet = json; renderPanel(true); updatePreview(); sauverLocal(); marquerStatut("Réinitialisé ✓");
    }).catch(function () { window.alert("Impossible de recharger data/contenu.json."); });
  }
})();
