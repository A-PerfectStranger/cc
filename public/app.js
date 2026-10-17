const $ = (s) => document.querySelector(s);
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const definitions = {
  FAU_ARP:
    "Respond automatically when a possible security violation is detected.",
  FAU_GEN: "Record security events and connect them to the users responsible.",
  FAU_SAA: "Analyze activity and audit records to spot suspicious behavior.",
  FAU_SAR: "Let authorized people read and investigate audit records.",
  FAU_SEL: "Choose which security events should be recorded.",
  FAU_STG: "Keep audit records safe, available, and protected against loss.",
  FCO_NRO:
    "Provide evidence of who sent information, so the sender cannot deny it.",
  FCO_NRR:
    "Provide evidence of who received information, so receipt cannot be denied.",
  FCS_CKM:
    "Control how cryptographic keys are created, shared, used, and destroyed.",
  FCS_COP:
    "Perform cryptographic operations using specified algorithms and key sizes.",
  FCS_RBG: "Generate random bits for cryptographic use.",
  FCS_RNG: "Generate random numbers with specified security properties.",
  FDP_ACC:
    "Define which subjects, objects, and operations an access policy covers.",
  FDP_ACF:
    "Enforce access decisions using defined rules and security attributes.",
  FDP_DAU: "Provide evidence that data is authentic.",
  FDP_ETC: "Control how user data leaves the evaluated product.",
  FDP_IFC: "Define which information flows are governed by a security policy.",
  FDP_IFF:
    "Enforce rules for how information can move between subjects and objects.",
  FDP_IRC: "Control how long information is retained and when it is deleted.",
  FDP_ITC: "Control how external user data enters the evaluated product.",
  FDP_ITT: "Protect user data moving between parts of the product.",
  FDP_RIP: "Prevent old data from being exposed when resources are reused.",
  FDP_ROL: "Undo specified operations and restore an earlier state.",
  FDP_SDC: "Keep stored user data confidential.",
  FDP_SDI: "Detect or prevent unauthorized changes to stored user data.",
  FDP_UCT:
    "Protect user data from disclosure during exchanges with another trusted product.",
  FDP_UIT:
    "Protect user data from unauthorized changes during exchanges with another trusted product.",
  FIA_AFL: "Detect failed authentication attempts and respond to them.",
  FIA_API: "Allow the product to prove its identity.",
  FIA_ATD: "Define the security attributes associated with each user.",
  FIA_SOS:
    "Check or generate secrets, such as passwords, to meet quality rules.",
  FIA_UAU: "Verify that users are who they claim to be.",
  FIA_UID: "Establish a user’s identity before allowing specified actions.",
  FIA_USB: "Associate a user’s identity and attributes with acting processes.",
  FMT_LIM: "Limit capabilities and availability to prevent prohibited use.",
  FMT_MOF: "Control who can manage the behavior of security functions.",
  FMT_MSA:
    "Control who can manage security attributes and their default values.",
  FMT_MTD: "Control who can manage data used by the security functions.",
  FMT_REV: "Remove security attributes or permissions when they are revoked.",
  FMT_SAE: "Enforce time limits on security attributes.",
  FMT_SMF: "Specify the security management functions the product provides.",
  FMT_SMR: "Define security roles and associate users with them.",
  FPR_ANO:
    "Allow users to act without revealing their identity to specified parties.",
  FPR_PSE: "Allow users to act under a substitute identity.",
  FPR_UNL: "Prevent observers from linking separate actions to the same user.",
  FPR_UNO:
    "Prevent observers from discovering that a resource or service is being used.",
  FPT_EMS: "Limit information leaks through physical emissions or interfaces.",
  FPT_FLS: "Maintain a secure state when specified failures occur.",
  FPT_INI: "Start the security functions in a controlled, secure state.",
  FPT_ITA: "Keep exported security-function data available.",
  FPT_ITC: "Keep exported security-function data confidential.",
  FPT_ITI: "Detect or prevent changes to exported security-function data.",
  FPT_ITT: "Protect security-function data moving inside the product.",
  FPT_PHP: "Detect or resist physical tampering.",
  FPT_RCV: "Return to a secure state after a failure or interruption.",
  FPT_RPL: "Detect and respond to replayed information or actions.",
  FPT_SSP:
    "Keep security-relevant states synchronized across distributed parts.",
  FPT_STM: "Provide reliable time stamps for security functions.",
  FPT_TDC:
    "Interpret shared security-function data consistently between products.",
  FPT_TEE: "Test external entities on which the security functions depend.",
  FPT_TRC:
    "Keep replicated security-function data consistent inside the product.",
  FPT_TST: "Test the security functions and check their integrity.",
  FRU_FLT: "Continue specified operations when faults occur.",
  FRU_PRS: "Prioritize access to resources so important work can proceed.",
  FRU_RSA: "Control resource use through quotas and allocation rules.",
  FTA_LSA: "Restrict the security attributes a user may select for a session.",
  FTA_MCS: "Limit how many sessions a user can have at the same time.",
  FTA_SSL: "Lock or end sessions under specified conditions.",
  FTA_TAB: "Display notices before users access the product.",
  FTA_TAH: "Show users information about their previous access attempts.",
  FTA_TSE: "Control whether a user is allowed to establish a session.",
  FTP_ITC:
    "Provide a protected communication channel between trusted products.",
  FTP_PRO: "Specify how protocols establish and maintain trusted channels.",
  FTP_TRP:
    "Provide a protected communication path between users and security functions.",
};
const classDefinitions = {
  FAU: "Record, analyze, review, and protect the evidence of security activity.",
  FCO: "Make the origin and receipt of exchanged information provable.",
  FCS: "Manage the cryptographic tools that protect information.",
  FDP: "Control access to user data and protect it throughout its lifecycle.",
  FIA: "Identify users and verify their identities.",
  FMT: "Define who can configure and administer security.",
  FPR: "Protect users’ identities and the privacy of their activities.",
  FPT: "Protect the security mechanisms themselves.",
  FRU: "Keep resources available and allocate them predictably.",
  FTA: "Control access, sessions, and user-facing security notices.",
  FTP: "Protect communication between users, products, and security functions.",
};
const icons = {
  FAU: "◷",
  FCO: "⇄",
  FCS: "◇",
  FDP: "▱",
  FIA: "◎",
  FMT: "⚙",
  FPR: "◌",
  FPT: "⬡",
  FRU: "▦",
  FTA: "↳",
  FTP: "⇆",
};
const M = ProjectModel;
let catalogue = [],
  idx,
  state = { projects: [], activeId: null },
  active = "all",
  query = "",
  savedOnly = false,
  saved = new Set(),
  view = "catalogue",
  scopeOnly = true,
  pendingImport = null,
  editingId = null,
  lastRemoval = null;
const expanded = new Map(),
  searchExpanded = new Map();
let storageBlocked = false;
const project = () => state.projects.find((p) => p.id === state.activeId);
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
function storageError(message) {
  storageBlocked = true;
  const el = $("#storage-error");
  el.hidden = false;
  el.replaceChildren(
    document.createTextNode(
      message +
        " Changes remain in memory; export a backup before closing this page. ",
    ),
  );
  const button = document.createElement("button");
  button.textContent = "Download recovery backup";
  button.id = "recovery";
  el.append(button);
}
function persist() {
  try {
    if (storageBlocked) return false;
    M.save(localStorage, state);
    return true;
  } catch {
    storageError("Browser storage could not save your projects.");
    return false;
  }
}
function saveMessage(message) {
  const ok = persist();
  notify(message + (ok ? " Saved in this browser." : " Kept in memory only."));
}
function highlight(s) {
  s = String(s);
  if (!query) return escapeHTML(s);
  let out = "",
    from = 0,
    pos;
  while ((pos = s.toLowerCase().indexOf(query, from)) !== -1) {
    out +=
      escapeHTML(s.slice(from, pos)) +
      "<mark>" +
      escapeHTML(s.slice(pos, pos + query.length)) +
      "</mark>";
    from = pos + query.length;
  }
  return out + escapeHTML(s.slice(from));
}
function simple(text) {
  return text
    .replace(
      /The TSF shall be able to/g,
      "The security functions must be able to",
    )
    .replace(/The TSF shall/g, "The security functions must")
    .replace(/The TOE shall/g, "The product must")
    .replace(/\bTSF\b/g, "security functions")
    .replace(/\bTOE\b/g, "evaluated product");
}
function matches(...values) {
  return values.filter(Boolean).join(" ").toLowerCase().includes(query);
}
function detail(key, defaultOpen = false) {
  return `data-detail="${key}" ${((query ? searchExpanded : expanded).get(key) ?? defaultOpen) ? "open" : ""}`;
}
function buildNav() {
  $("#classes").innerHTML =
    `<button data-class="all"><span class="nav-code">▦</span><span class="nav-name">All families</span><span class="nav-total">${catalogue.flatMap((c) => c.families).length}</span></button>` +
    catalogue
      .map(
        (c) =>
          `<button data-class="${c.id}"><span class="nav-code">${c.id}</span><span class="nav-name">${escapeHTML(c.name.replace(" of the TSF", ""))}</span><span class="nav-total">${c.families.length}</span></button>`,
      )
      .join("");
  $("#mobile-class").innerHTML =
    '<option value="all">All security classes</option>' +
    catalogue
      .map(
        (c) =>
          `<option value="${c.id}">${c.id} · ${escapeHTML(c.name)}</option>`,
      )
      .join("");
}
function syncNav() {
  document.querySelectorAll("[data-class]").forEach((el) => {
    el.classList.toggle("active", el.dataset.class === active);
    el.setAttribute("aria-pressed", String(el.dataset.class === active));
  });
  $("#mobile-class").value = active;
  $("#catalogue-tab").setAttribute(
    "aria-current",
    view === "catalogue" ? "page" : "false",
  );
  $("#projects-tab").setAttribute(
    "aria-current",
    view !== "catalogue" ? "page" : "false",
  );
}
function projectOptions() {
  return (
    '<option value="">Choose a project</option>' +
    state.projects
      .map(
        (p) =>
          `<option value="${escapeHTML(p.id)}" ${p.id === state.activeId ? "selected" : ""}>${escapeHTML(p.name)}</option>`,
      )
      .join("")
  );
}
function renderToolbar() {
  const p = project();
  $("#project-toolbar").innerHTML =
    `<div><strong>${view === "project" ? "PROJECT SCOPE" : "ADD TO A PROJECT"}</strong><label class="sr-only" for="active-project">Active project</label><select id="active-project">${projectOptions()}</select></div><div class="actions"><a href="#projects">Manage projects</a>${p ? `<a class="button" href="#project/${encodeURIComponent(p.id)}">Open project</a>` : "<button data-new>New project</button>"}</div>`;
}
function projectCards() {
  return `<div class="section-heading"><div><div class="eyebrow">YOUR WORKSPACE</div><h1>Projects</h1><p>Build a requirement scope for each product you evaluate.</p></div><div class="actions"><button data-import>Import JSON</button><button class="primary" data-new>New project</button></div></div><p class="local-note">Projects are stored in this browser on this site. Export backups to move or protect your work. Bookmarks remain separate reading references.</p><div class="project-grid">${
    state.projects
      .map((p) => {
        const m = M.metrics(p, idx);
        return `<article class="project-card"><span class="eyebrow">${escapeHTML(p.edition)}</span><h2><a href="#project/${encodeURIComponent(p.id)}">${escapeHTML(p.name)}</a></h2><p>${escapeHTML(p.description || "No description yet.")}</p><div class="project-card-count">${m.families} families · ${m.components} components · ${m.elements} elements</div><p>${m.verified} verified · ${m.operations} operation reviews pending</p><a class="button primary" href="#project/${encodeURIComponent(p.id)}">Open project →</a></article>`;
      })
      .join("") ||
    '<div class="empty"><h2>Your first project starts here.</h2><p>Create a project, then browse the catalogue to add components.</p><button class="primary" data-new>Create project</button></div>'
  }</div>`;
}
function metricHTML(p) {
  const m = M.metrics(p, idx);
  return `<div class="project-metrics">${[
    [m.families, "Families"],
    [m.components, "Components"],
    [m.elements, "Elements"],
    [m.verified + "/" + m.elements, "Verified"],
  ]
    .map(([n, l]) => `<div><strong>${n}</strong><span>${l}</span></div>`)
    .join(
      "",
    )}</div><div class="review-summary">${m.dependencies} dependency reviews pending · ${m.operations} operation reviews pending${m.deprecated ? ` · ${m.deprecated} deprecated component(s): remove and use FCS_CKM.6` : ""}</div>`;
}
function refreshMetrics() {
  if (view === "project" && project())
    $("#project-metrics").innerHTML = metricHTML(project());
}
function renderProjectArea() {
  const area = $("#project-area");
  area.hidden = view === "catalogue";
  if (view === "catalogue") return;
  if (view === "projects") {
    area.innerHTML = projectCards();
    return;
  }
  const p = project();
  area.innerHTML = `<div class="section-heading compact"><div><a class="back-link" href="#projects">← All projects</a><h1>${escapeHTML(p.name)}</h1><p>${escapeHTML(p.description)}</p></div><div class="actions"><button data-edit>Edit details</button><button data-export="json">Export JSON</button><button data-export="md">Export Markdown</button><button data-import>Import</button></div></div><p class="toe-scope"><strong>TOE scope:</strong> ${escapeHTML(p.scope || "Not defined yet. Edit project details to describe the evaluated product.")}</p><div id="project-metrics">${metricHTML(p)}</div><p class="local-note">${escapeHTML(p.edition)} · Stored in this browser. Progress is self-reported; it does not establish certification. Dependency satisfaction is not automatically validated.</p><div class="scope-controls"><button id="scope-toggle" aria-pressed="${scopeOnly}">${scopeOnly ? "Show full catalogue" : "Show selected scope only"}</button><span>${scopeOnly ? "Showing complete selected components." : "Browse and add requirements to this project."}</span><button id="undo-removal" ${lastRemoval?.projectId === p.id ? "" : "hidden"}>Undo last removal</button></div>`;
}
function annotationsHTML(p, e) {
  const a = M.annotation(p, e.id);
  return `<div class="element-editor"><label>Status<select data-annotation="status" data-element="${e.id}">${M.STATUSES.map((s) => `<option ${a.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label><label>Notes<textarea maxlength="20000" data-annotation="notes" data-element="${e.id}">${escapeHTML(a.notes)}</textarea></label><label>Evidence links / references<textarea maxlength="20000" data-annotation="evidence" data-element="${e.id}" placeholder="Record evidence locations; links are stored as text">${escapeHTML(a.evidence)}</textarea></label>${e.text.includes("[") ? `<div class="operation-editor"><strong>Assignments & selections</strong><p>Use the bracketed prompts in the original wording above. Record your choices here; the original requirement stays unchanged.</p><label>Project-specific completions<textarea maxlength="20000" data-annotation="operations" data-element="${e.id}">${escapeHTML(a.operations)}</textarea></label><label class="check-label"><input type="checkbox" data-annotation="operationsReviewed" data-element="${e.id}" ${a.operationsReviewed ? "checked" : ""}> I reviewed all assignments and selections for this element</label>${!a.operationsReviewed ? '<span class="pending">Operation review pending</span>' : ""}</div>` : ""}</div>`;
}
function renderResults() {
  const p = project(),
    projectView = view === "project";
  const focus = document.activeElement?.dataset?.focus;
  const current = catalogue.find((c) => c.id === active);
  syncNav();
  $("#saved-count").textContent = saved.size;
  $("#saved").setAttribute("aria-pressed", String(savedOnly));
  $("#class-code").textContent = projectView
    ? "PROJECT REQUIREMENTS"
    : current
      ? current.id + " / SECURITY FUNCTIONAL CLASS"
      : "EXPLORE THE CATALOGUE";
  $("#view-title").textContent = query
    ? "Search results"
    : savedOnly
      ? "Saved reading bookmarks"
      : projectView
        ? scopeOnly
          ? "Selected scope"
          : "Choose requirements"
        : current?.name || "All security families";
  $("#active-description").textContent = current
    ? classDefinitions[current.id]
    : "";
  let count = 0,
    componentCount = 0,
    elementCount = 0;
  const html = catalogue
    .filter((c) => active === "all" || active === c.id)
    .map((c) => {
      const families = c.families
        .map((f) => {
          const selected = f.components.filter((co) =>
            p?.components.includes(co.id),
          );
          const selectable = f.components.filter((co) => co.elements.length);
          const full = selectable.every((co) => p?.components.includes(co.id));
          const components = f.components
            .map((co) => {
              const included = p?.components.includes(co.id);
              if (projectView && scopeOnly && !included) return "";
              const parentMatch = matches(
                f.id,
                f.name,
                definitions[f.id],
                co.id,
                co.name,
              );
              const elements = co.elements.filter(
                (e) =>
                  (!savedOnly || saved.has(e.id)) &&
                  (!query || parentMatch || matches(e.id, e.text)),
              );
              if (savedOnly && !elements.length) return "";
              if (query && !parentMatch && !elements.length) return "";
              componentCount++;
              elementCount += elements.length;
              const deprecated = !co.elements.length;
              return `<details class="component" ${detail(co.id, !!query || (projectView && scopeOnly))}><summary><span class="tag">${highlight(co.id)}</span><strong>${highlight(co.name)}</strong><span class="component-count">${deprecated ? "Deprecated" : co.elements.length + " elements"} <span class="chevron">›</span></span></summary><div class="component-body"><p class="component-intro">${deprecated ? "Deprecated in CC:2022. Use FCS_CKM.6 for timing and event of cryptographic key destruction." : `Focus: ${highlight(co.name)}. ${escapeHTML(definitions[f.id])}`}</p><div class="component-actions">${p ? `<button data-component="${co.id}" data-focus="component-${co.id}" ${deprecated && !included ? "disabled" : ""} class="${included ? "selected" : "primary"}">${included ? "Remove from project" : deprecated ? "Deprecated — unavailable" : "Add component to project"}</button><span>${included ? "Complete component included" : escapeHTML(p.name)}</span>` : '<a href="#projects">Create or choose a project to select requirements →</a>'}</div>${elements.map((e) => `<article class="element" id="${e.id}"><div class="element-head"><code>${highlight(e.id)}</code><div class="actions">${p && !included ? `<button data-use="${co.id}" data-focus="use-${e.id}">Use in project</button>` : ""}<button class="bookmark" data-save="${e.id}" data-focus="save-${e.id}" aria-pressed="${saved.has(e.id)}" aria-label="${saved.has(e.id) ? "Unsave" : "Save"} ${e.id}">${saved.has(e.id) ? "★" : "☆"}</button></div></div><p>${highlight(simple(e.text))}</p><details class="original" ${detail("original-" + e.id, projectView && included && e.text.includes("["))}><summary>Original requirement & operation prompts</summary><p>${highlight(e.text)}</p></details>${p && included && projectView ? annotationsHTML(p, e) : ""}</article>`).join("")}<details class="relationships" ${detail("dependencies-" + co.id, projectView && included)}><summary>Dependencies & component relationships</summary><p>${escapeHTML(co.relationships.replace("Component relationships", "").trim())}</p>${p && included && projectView ? `<div class="dependency-editor"><p>Manual review only. Alternatives and hierarchical substitutions are not automatically resolved.</p><label>Review notes<textarea maxlength="20000" data-review="notes" data-component-id="${co.id}">${escapeHTML(p.reviews[co.id]?.notes || "")}</textarea></label><label class="check-label"><input type="checkbox" data-review="reviewed" data-component-id="${co.id}" ${p.reviews[co.id]?.reviewed ? "checked" : ""}> I reviewed the dependencies and documented my decisions</label></div>` : ""}</details><a class="source" target="_blank" rel="noopener" href="common-criteria-2022-part2.pdf#page=${co.page}">View source · page ${co.page} ↗</a></div></details>`;
            })
            .join("");
          if (!components) return "";
          count++;
          return `<details class="family" ${detail(f.id, !!query || (projectView && scopeOnly))}><summary><div class="family-badge" aria-hidden="true">${icons[c.id]}</div><div class="family-title"><span class="code">${highlight(f.id)} / ${c.id}</span><h3>${highlight(f.name)}</h3><p>${highlight(definitions[f.id])}</p></div><span class="family-meta">${p ? `${selected.length}/${selectable.length} selected · ${full ? "All" : selected.length ? "Partial" : "None"}` : f.components.length + " components"}</span><span class="chevron">›</span></summary><div class="family-content">${p ? `<div class="family-selection"><button data-family="${f.id}" data-focus="family-${f.id}" ${full ? "disabled" : ""}>${full ? "All active components selected" : "Add all active components"}</button><p><strong>${selected.length}/${selectable.length} selected · ${full ? "All" : selected.length ? "Partial" : "None"}.</strong> A family groups components. Add only those your project needs, or select all ${selectable.length} active components.</p></div>` : ""}${components}<details class="original" ${detail("family-original-" + f.id)}><summary>Original family definition</summary><p>${escapeHTML(f.description)}</p></details><a class="source" href="common-criteria-2022-part2.pdf#page=${f.page}" target="_blank" rel="noopener">Family source · page ${f.page} ↗</a></div></details>`;
        })
        .join("");
      return families
        ? `<section class="class-group">${projectView ? `<h3 class="class-group-title">${c.id} · ${escapeHTML(c.name)}</h3>` : ""}${families}</section>`
        : "";
    })
    .join("");
  const counts = `${count} families · ${componentCount} components · ${elementCount} elements`;
  $("#result-count").textContent = counts;
  $("#search-status").textContent =
    counts + (query ? " matching " + query : "");
  $("#results").innerHTML =
    html ||
    `<div class="empty"><h3>${projectView && scopeOnly ? "No requirements in this view." : savedOnly ? "No saved requirements in this view." : "No matching requirements."}</h3><p>${projectView && scopeOnly ? "Browse the catalogue to add complete components to this project." : "Try another keyword or reset the filters."}</p><button id="reset">Reset filters${projectView ? " and browse catalogue" : ""}</button></div>`;
  if (focus) {
    const el = [...document.querySelectorAll("[data-focus]")].find(
      (el) => el.dataset.focus === focus,
    );
    if (el && !el.disabled) el.focus({ preventScroll: true });
    else $("#active-project")?.focus({ preventScroll: true });
  }
}
function render() {
  const focusId = document.activeElement?.id;
  syncNav();
  $("#catalogue-hero").hidden = view !== "catalogue";
  renderProjectArea();
  $("#project-toolbar").hidden = view === "projects";
  document.querySelector(".tools").hidden = view === "projects";
  document.querySelector(".catalogue-heading").hidden = view === "projects";
  $("#active-description").hidden = view === "projects";
  $("#results").hidden = view === "projects";
  if (view !== "projects") {
    renderToolbar();
    renderResults();
  }
  if (focusId && document.getElementById(focusId))
    document.getElementById(focusId).focus({ preventScroll: true });
}
function route() {
  const hash = location.hash.slice(1);
  let id = null;
  try {
    id = hash.startsWith("project/") ? decodeURIComponent(hash.slice(8)) : null;
  } catch {
    notify("Invalid project link.");
  }
  view = hash === "projects" ? "projects" : id ? "project" : "catalogue";
  if (id) {
    if (state.projects.some((p) => p.id === id)) {
      state.activeId = id;
      persist();
    } else {
      view = "projects";
      notify("Project not found in this browser.");
    }
  }
  active = "all";
  query = "";
  savedOnly = false;
  $("#search").value = "";
  scopeOnly = true;
  render();
}
function download(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportProject(format) {
  const p = project();
  if (!p) return;
  const base = p.name.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80) || "project";
  download(
    base + (format === "md" ? ".md" : ".json"),
    format === "md"
      ? M.markdown(p, idx)
      : JSON.stringify(M.backup(p, idx), null, 2),
    format === "md" ? "text/markdown" : "application/json",
  );
}
function openForm(edit = false) {
  editingId = edit ? state.activeId : null;
  const p = edit ? project() : { name: "", description: "", scope: "" };
  $("#project-form-title").textContent = edit ? "Edit project" : "New project";
  for (const key of ["name", "description", "scope"])
    $("#project-form").elements[key].value = p[key];
  $("#project-dialog").showModal();
}
function selectComponents(ids, fromElement = false) {
  const p = project();
  if (!p) return;
  M.select(p, ids, idx);
  saveMessage(
    fromElement
      ? "Included the complete parent component and all its elements."
      : "Project scope updated.",
  );
  render();
}
document.addEventListener("click", (e) => {
  const summary = e.target.closest("summary");
  if (summary?.parentElement.dataset.detail) {
    const d = summary.parentElement;
    (query ? searchExpanded : expanded).set(d.dataset.detail, !d.open);
  }
  const nav = e.target.closest("[data-class]");
  if (nav) {
    active = nav.dataset.class;
    renderResults();
    return;
  }
  if (e.target.closest("[data-new]")) {
    openForm();
    return;
  }
  if (e.target.closest("[data-edit]")) {
    openForm(true);
    return;
  }
  const close = e.target.closest("[data-close]");
  if (close) {
    $("#" + close.dataset.close).close();
    return;
  }
  if (e.target.closest("[data-import]")) {
    $("#import-file").value = "";
    $("#import-file").click();
    return;
  }
  const ex = e.target.closest("[data-export]");
  if (ex) {
    exportProject(ex.dataset.export);
    return;
  }
  if (e.target.closest("#recovery")) {
    const p = project() || state.projects[0];
    if (!p) {
      notify(
        "No projects to export yet. Create a project or restore your existing backup.",
      );
      return;
    }
    download(
      "project-recovery.json",
      JSON.stringify(M.backup(p, idx), null, 2),
      "application/json",
    );
    notify(
      "Exported " +
        p.name +
        ". Export other projects individually from their project pages.",
    );
    return;
  }
  const family = e.target.closest("[data-family]");
  if (family) {
    const f = catalogue
      .flatMap((c) => c.families)
      .find((f) => f.id === family.dataset.family);
    selectComponents(
      f.components.filter((c) => c.elements.length).map((c) => c.id),
    );
    return;
  }
  const use = e.target.closest("[data-use]");
  if (use) {
    selectComponents([use.dataset.use], true);
    return;
  }
  const co = e.target.closest("[data-component]");
  if (co) {
    const p = project(),
      id = co.dataset.component;
    if (p.components.includes(id)) {
      lastRemoval = { projectId: p.id, component: id };
      M.remove(p, id);
      saveMessage(
        "Component removed. Notes are retained; use Undo to restore it.",
      );
      render();
    } else selectComponents([id]);
    return;
  }
  if (e.target.closest("#undo-removal")) {
    if (lastRemoval?.projectId === project()?.id) {
      const id = lastRemoval.component;
      if (idx.components.get(id).elements.length)
        M.select(project(), [id], idx);
      else project().components.push(id);
      lastRemoval = null;
      saveMessage("Component restored with its notes.");
      render();
    }
    return;
  }
  if (e.target.closest("#scope-toggle")) {
    scopeOnly = !scopeOnly;
    render();
    return;
  }
  const save = e.target.closest("[data-save]");
  if (save) {
    const id = save.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    try {
      if (storageBlocked) throw Error("Storage is protected");
      localStorage.setItem("cc-saved", JSON.stringify([...saved]));
      notify(
        saved.has(id) ? "Reading bookmark saved." : "Reading bookmark removed.",
      );
    } catch {
      storageError("Browser storage could not save bookmarks.");
      notify("Bookmark changed in memory only.");
    }
    if (savedOnly) renderResults();
    else {
      save.setAttribute("aria-pressed", String(saved.has(id)));
      save.setAttribute(
        "aria-label",
        (saved.has(id) ? "Unsave " : "Save ") + id,
      );
      save.textContent = saved.has(id) ? "★" : "☆";
      $("#saved-count").textContent = saved.size;
    }
    return;
  }
  if (e.target.closest("#reset")) {
    active = "all";
    query = "";
    savedOnly = false;
    scopeOnly = false;
    $("#search").value = "";
    render();
  }
});
$("#search").addEventListener("input", (e) => {
  query = e.target.value.trim().toLowerCase();
  searchExpanded.clear();
  renderResults();
});
$("#saved").addEventListener("click", () => {
  savedOnly = !savedOnly;
  renderResults();
});
$("#mobile-class").addEventListener("change", (e) => {
  active = e.target.value;
  renderResults();
});
document.addEventListener("change", (e) => {
  if (e.target.id === "active-project") {
    state.activeId = e.target.value || null;
    persist();
    if (view === "project" && state.activeId)
      location.hash = "project/" + encodeURIComponent(state.activeId);
    else if (view === "project") location.hash = "catalogue";
    else render();
    return;
  }
  const p = project();
  if (!p) return;
  if (e.target.dataset.annotation) {
    const id = e.target.dataset.element,
      field = e.target.dataset.annotation;
    p.annotations[id] = {
      ...M.annotation(p, id),
      [field]:
        field === "operationsReviewed" ? e.target.checked : e.target.value,
    };
    if (field === "operations") p.annotations[id].operationsReviewed = false;
    M.touch(p);
    const ok = persist();
    refreshMetrics();
    if (field === "operationsReviewed" || field === "operations") {
      const op = e.target.closest(".operation-editor");
      const checkbox = op.querySelector(
        '[data-annotation="operationsReviewed"]',
      );
      checkbox.checked = p.annotations[id].operationsReviewed;
      let pending = op.querySelector(".pending");
      if (p.annotations[id].operationsReviewed) pending?.remove();
      else if (!pending) {
        pending = document.createElement("span");
        pending.className = "pending";
        pending.textContent = "Operation review pending";
        op.append(pending);
      }
    }
    if (ok && !e.detail?.quiet) notify("Project changes saved.");
  }
  if (e.target.dataset.review) {
    const id = e.target.dataset.componentId,
      field = e.target.dataset.review;
    p.reviews[id] = {
      reviewed: false,
      notes: "",
      ...p.reviews[id],
      [field]: field === "reviewed" ? e.target.checked : e.target.value,
    };
    M.touch(p);
    persist();
    refreshMetrics();
  }
});
// Save text as it is typed, including before navigation or export.
document.addEventListener("input", (e) => {
  if (
    (e.target.dataset.annotation || e.target.dataset.review) &&
    e.target.type !== "checkbox" &&
    e.target.tagName !== "SELECT"
  )
    e.target.dispatchEvent(
      new CustomEvent("change", { bubbles: true, detail: { quiet: true } }),
    );
});
$("#project-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target,
    name = form.elements.name.value.trim();
  if (!name) {
    form.elements.name.setCustomValidity("Enter a project name.");
    form.elements.name.reportValidity();
    return;
  }
  const data = {
    name,
    description: form.elements.description.value,
    scope: form.elements.scope.value,
  };
  if (editingId) {
    Object.assign(project(), data);
    M.touch(project());
  } else {
    if (state.projects.length >= 100) {
      notify("Maximum 100 projects. Export backups before creating more.");
      return;
    }
    const p = M.create(data.name, data.description, data.scope);
    state.projects.push(p);
    state.activeId = p.id;
  }
  saveMessage(editingId ? "Project updated." : "Project created.");
  $("#project-dialog").close();
  if (location.hash === "#project/" + state.activeId) render();
  else location.hash = "project/" + encodeURIComponent(state.activeId);
});
$("#project-form").elements.name.addEventListener("input", (e) =>
  e.target.setCustomValidity(""),
);
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > M.MAX_BYTES)
      throw Error("Import is too large (maximum 2 MB).");
    pendingImport = M.parseBackup(await file.text(), idx);
    const m = M.metrics(pendingImport, idx);
    $("#import-preview").textContent =
      `${pendingImport.name} — ${m.families} families, ${m.components} components, ${m.elements} elements.${m.deprecated ? " Warning: includes deprecated FCS_CKM.4; remove it and consider FCS_CKM.6." : ""}`;
    $("#import-dialog").showModal();
  } catch (err) {
    pendingImport = null;
    notify("Import rejected: " + err.message);
  }
});
$("#confirm-import").addEventListener("click", () => {
  if (!pendingImport) return;
  if (state.projects.length >= 100) {
    notify("Maximum 100 projects.");
    return;
  }
  const p = M.copy(pendingImport);
  state.projects.push(p);
  state.activeId = p.id;
  pendingImport = null;
  saveMessage("Imported as a new project.");
  $("#import-dialog").close();
  location.hash = "project/" + encodeURIComponent(p.id);
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !document.querySelector("dialog[open]") &&
    view !== "projects"
  ) {
    e.preventDefault();
    $("#search").focus();
  }
  if (e.key === "Escape" && document.activeElement === $("#search")) {
    $("#search").value = "";
    query = "";
    renderResults();
  }
});
window.addEventListener("hashchange", () => {
  route();
  $("#main").setAttribute("tabindex", "-1");
  $("#main").focus({ preventScroll: true });
});
fetch("catalogue.json")
  .then((r) => {
    if (!r.ok) throw Error("Unable to load catalogue");
    return r.json();
  })
  .then((data) => {
    catalogue = data;
    idx = M.index(data);
    try {
      state = M.load(localStorage, idx);
    } catch {
      storageError(
        "Stored projects could not be read safely. Existing storage has been left unchanged.",
      );
    }
    try {
      const bookmarks = JSON.parse(localStorage.getItem("cc-saved") || "[]");
      if (
        !Array.isArray(bookmarks) ||
        bookmarks.some((id) => typeof id !== "string" || !idx.elements.has(id))
      )
        throw Error();
      saved = new Set(bookmarks);
    } catch {
      storageError(
        "Stored bookmarks could not be read safely. Existing storage has been left unchanged.",
      );
    }
    const families = data.flatMap((c) => c.families),
      components = families.flatMap((f) => f.components);
    $("#stats").innerHTML = [
      [data.length, "Security classes"],
      [families.length, "Families"],
      [components.filter((c) => c.elements.length).length, "Active components"],
      [components.flatMap((c) => c.elements).length, "Functional elements"],
    ]
      .map(
        ([n, t]) =>
          `<div class="stat"><strong>${n}</strong><span>${t}</span></div>`,
      )
      .join("");
    buildNav();
    route();
  })
  .catch((err) => {
    $("#results").innerHTML =
      '<div class="empty"><h3>The guide could not be loaded.</h3><p>Please reload to try again.</p></div>';
    console.error(err);
  });
