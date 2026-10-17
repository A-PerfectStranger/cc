(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ProjectModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";
  const EDITION = "CC:2022 Part 2 Revision 1",
    STATUSES = ["Not started", "In progress", "Implemented", "Verified"],
    MAX_BYTES = 2000000;
  const id = () =>
    globalThis.crypto?.randomUUID?.() ||
    "project-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2);
  function index(data) {
    const components = new Map(),
      elements = new Map();
    for (const c of data)
      for (const f of c.families)
        for (const co of f.components) {
          components.set(co.id, { ...co, family: f.id, class: c.id });
          for (const e of co.elements)
            elements.set(e.id, { ...e, component: co.id });
        }
    return { components, elements };
  }
  function create(name, description = "", scope = "") {
    return {
      id: id(),
      name: name.trim() || "Untitled project",
      description,
      scope,
      edition: EDITION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [],
      annotations: {},
      reviews: {},
    };
  }
  function text(v, max = 20000) {
    if (typeof v !== "string" || v.length > max)
      throw Error("Invalid or oversized text field.");
    return v;
  }
  function validate(p, idx) {
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw Error("Invalid project record.");
    text(p.id, 100);
    if (!p.id || !p.name?.trim())
      throw Error("A project needs an ID and name.");
    text(p.name, 160);
    text(p.description);
    text(p.scope);
    if (p.edition !== EDITION) throw Error("Unsupported catalogue edition.");
    for (const key of ["createdAt", "updatedAt"])
      if (typeof p[key] !== "string" || !Number.isFinite(Date.parse(p[key])))
        throw Error("Invalid project timestamp.");
    if (
      !Array.isArray(p.components) ||
      p.components.length > idx.components.size ||
      new Set(p.components).size !== p.components.length
    )
      throw Error("Invalid component selection.");
    for (const co of p.components)
      if (!idx.components.has(co)) throw Error("Unknown component: " + co);
    const annotations = {},
      reviews = {};
    if (
      !p.annotations ||
      Array.isArray(p.annotations) ||
      typeof p.annotations !== "object" ||
      !p.reviews ||
      Array.isArray(p.reviews) ||
      typeof p.reviews !== "object"
    )
      throw Error("Invalid project annotations.");
    for (const [key, a] of Object.entries(p.annotations)) {
      if (
        !idx.elements.has(key) ||
        !a ||
        typeof a !== "object" ||
        !STATUSES.includes(a.status) ||
        typeof a.operationsReviewed !== "boolean"
      )
        throw Error("Invalid element annotation: " + key);
      annotations[key] = {
        status: a.status,
        notes: text(a.notes),
        operations: text(a.operations),
        operationsReviewed: a.operationsReviewed,
        evidence: text(a.evidence),
      };
    }
    for (const [key, r] of Object.entries(p.reviews)) {
      if (!idx.components.has(key) || !r || typeof r.reviewed !== "boolean")
        throw Error("Invalid dependency review.");
      reviews[key] = { reviewed: r.reviewed, notes: text(r.notes) };
    }
    return {
      ...create(p.name),
      id: p.id,
      name: p.name,
      description: p.description,
      scope: p.scope,
      edition: p.edition,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      components: [...p.components],
      annotations,
      reviews,
    };
  }
  function annotation(p, id) {
    return (
      p.annotations[id] || {
        status: "Not started",
        notes: "",
        operations: "",
        operationsReviewed: false,
        evidence: "",
      }
    );
  }
  function select(p, ids, idx) {
    const next = new Set(p.components);
    for (const co of ids) {
      if (!idx.components.has(co) || !idx.components.get(co).elements.length)
        throw Error("Deprecated or unknown components cannot be selected.");
      next.add(co);
    }
    p.components = [...next];
    touch(p);
    return p;
  }
  function touch(p) {
    p.updatedAt = new Date().toISOString();
  }
  function remove(p, co) {
    p.components = p.components.filter((x) => x !== co);
    touch(p);
  }
  function metrics(p, idx) {
    const components = p.components.map((id) => idx.components.get(id));
    const elements = components.flatMap((c) => c.elements);
    return {
      families: new Set(components.map((c) => c.family)).size,
      components: components.length,
      elements: elements.length,
      verified: elements.filter(
        (e) => annotation(p, e.id).status === "Verified",
      ).length,
      operations: elements.filter(
        (e) => e.text.includes("[") && !annotation(p, e.id).operationsReviewed,
      ).length,
      dependencies: components.filter((c) => !p.reviews[c.id]?.reviewed).length,
      deprecated: components.filter((c) => !c.elements.length).length,
    };
  }
  function backup(p, idx) {
    return {
      schemaVersion: 1,
      project: p,
      requirements: p.components.map((id) => {
        const c = idx.components.get(id);
        return {
          id: c.id,
          class: c.class,
          family: c.family,
          name: c.name,
          page: c.page,
          relationships: c.relationships,
          elements: c.elements.map((e) => ({ id: e.id, text: e.text })),
        };
      }),
    };
  }
  function parseBackup(raw, idx) {
    if (new TextEncoder().encode(raw).length > MAX_BYTES)
      throw Error("Import is too large (maximum 2 MB).");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw Error("The file is not valid JSON.");
    }
    if (data.schemaVersion !== 1) throw Error("Unsupported backup version.");
    return validate(data.project, idx);
  }
  function copy(p) {
    return {
      ...JSON.parse(JSON.stringify(p)),
      id: id(),
      name: p.name.slice(0, 149) + " (imported)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  function markdown(p, idx) {
    const lines = [
      `# ${p.name}`,
      `Catalogue: ${p.edition}`,
      "",
      p.description,
      "",
      `${p.components.length} components selected`,
      "",
    ];
    let family = "";
    for (const id of p.components) {
      const c = idx.components.get(id);
      if (c.family !== family) {
        family = c.family;
        lines.push(`## ${c.class} / ${family}`, "");
      }
      lines.push(
        `- [x] ${c.id} — ${c.name}${c.elements.length ? "" : " (deprecated; use FCS_CKM.6)"}`,
        `  Source: CCMB-2022-11-002, page ${c.page}`,
      );
    }
    return lines.join("\n");
  }
  function load(storage, idx) {
    const raw = storage.getItem("cc-projects-v1");
    if (!raw) return { projects: [], activeId: null };
    const d = JSON.parse(raw);
    if (
      d.schemaVersion !== 1 ||
      !Array.isArray(d.projects) ||
      d.projects.length > 100
    )
      throw Error("Invalid project storage.");
    const projects = d.projects.map((p) => validate(p, idx));
    if (new Set(projects.map((p) => p.id)).size !== projects.length)
      throw Error("Duplicate project IDs.");
    return {
      projects,
      activeId: projects.some((p) => p.id === d.activeId)
        ? d.activeId
        : projects[0]?.id || null,
    };
  }
  function save(storage, state) {
    storage.setItem(
      "cc-projects-v1",
      JSON.stringify({ schemaVersion: 1, ...state }),
    );
  }
  return {
    EDITION,
    STATUSES,
    MAX_BYTES,
    index,
    create,
    validate,
    annotation,
    select,
    remove,
    touch,
    metrics,
    backup,
    parseBackup,
    copy,
    markdown,
    load,
    save,
  };
});
