const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const M = require("../public/project-model");
const data = require("../public/catalogue.json");
const idx = M.index(data);
test("component selection includes all elements and deduplicates family bulk selection", () => {
  const p = M.create("A");
  M.select(p, ["FAU_GEN.1", "FAU_GEN.1", "FAU_GEN.2"], idx);
  assert.equal(p.components.length, 2);
  assert.equal(
    M.metrics(p, idx).elements,
    idx.components.get("FAU_GEN.1").elements.length + 1,
  );
  assert.throws(() => M.select(p, ["FCS_CKM.4"], idx));
});
test("project state is isolated and removal retains element notes", () => {
  const a = M.create("A"),
    b = M.create("B");
  M.select(a, ["FAU_GEN.1"], idx);
  a.annotations["FAU_GEN.1.1"] = {
    ...M.annotation(a, "FAU_GEN.1.1"),
    notes: "Evidence retained",
  };
  M.remove(a, "FAU_GEN.1");
  assert.equal(M.metrics(a, idx).elements, 0);
  assert.deepEqual(b.components, []);
  M.select(a, ["FAU_GEN.1"], idx);
  assert.equal(a.annotations["FAU_GEN.1.1"].notes, "Evidence retained");
});
test("backup round trip preserves operations, status, notes, and manual review", () => {
  const p = M.create("<script>hello</script>");
  M.select(p, ["FAU_GEN.1"], idx);
  p.annotations["FAU_GEN.1.1"] = {
    ...M.annotation(p, "FAU_GEN.1.1"),
    notes: "N",
    operations: "choice",
    operationsReviewed: true,
    status: "In progress",
    evidence: "E",
  };
  p.reviews["FAU_GEN.1"] = { notes: "Reviewed alternatives", reviewed: true };
  const b = M.backup(p, idx),
    q = M.parseBackup(JSON.stringify(b), idx);
  assert.deepEqual(q, p);
  assert.match(b.requirements[0].elements[0].text, /shall/);
  const c = M.copy(q);
  assert.notEqual(c.id, p.id);
  assert.equal(c.annotations["FAU_GEN.1.1"].notes, "N");
  assert.match(M.markdown(p, idx), /choice/);
});
test("imports reject unknown IDs, invalid statuses, unsupported versions and oversized files", () => {
  const p = M.create("A");
  const parse = (v) =>
    M.parseBackup(JSON.stringify({ schemaVersion: 1, project: v }), idx);
  assert.throws(() => parse({ ...p, components: ["UNKNOWN.1"] }));
  assert.throws(() =>
    parse({
      ...p,
      annotations: {
        "FAU_GEN.1.1": { ...M.annotation(p, "x"), status: "Certified" },
      },
    }),
  );
  assert.throws(() => M.parseBackup("{", idx));
  assert.throws(() => M.parseBackup('{"schemaVersion":2}', idx));
  assert.throws(() => M.parseBackup("x".repeat(M.MAX_BYTES + 1), idx));
  assert.throws(() => parse({ ...p, edition: "CC:other" }));
});
test("deprecated import stays flagged and dependency/operation review are separate from status", () => {
  const p = M.create("A");
  p.components = ["FCS_CKM.4", "FAU_GEN.1"];
  p.annotations["FAU_GEN.1.1"] = {
    ...M.annotation(p, "x"),
    status: "Verified",
  };
  const q = M.validate(p, idx),
    m = M.metrics(q, idx);
  assert.equal(m.deprecated, 1);
  assert.equal(m.verified, 1);
  assert.equal(m.dependencies, 2);
  assert.ok(m.operations > 0);
});
test("versioned persistence round trip and storage failures", () => {
  let stored;
  const storage = { getItem: () => stored, setItem: (_, v) => (stored = v) };
  const p = M.create("A"),
    state = { projects: [p], activeId: p.id };
  M.save(storage, state);
  assert.deepEqual(M.load(storage, idx), state);
  stored = "{}";
  assert.throws(() => M.load(storage, idx));
  assert.throws(() =>
    M.save(
      {
        setItem: () => {
          throw Error("Quota exceeded");
        },
      },
      state,
    ),
  );
});

test('imported copies of maximum-length names remain valid after reload', () => {
  const project = M.create('A'.repeat(160));
  const copy = M.copy(project);
  assert.equal(copy.name.length, 160);
  assert.doesNotThrow(() => M.validate(copy, idx));
});
