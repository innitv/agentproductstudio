import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseCaptureArgs, normalizeSections } from "./capture-local-screenshots.mjs";

const parsed = parseCaptureArgs([
  "--reference-url",
  "https://example.com/reference-page",
  "--local-url",
  "http://127.0.0.1:5173",
  "--slug",
  "custom-slug",
  "--no-warmup",
]);

assert.equal(parsed.referenceUrl, "https://example.com/reference-page");
assert.equal(parsed.localUrl, "http://127.0.0.1:5173");
assert.equal(parsed.slug, "custom-slug");
assert.equal(parsed.warmup, false);
assert.match(parsed.outputDir.replaceAll("\\", "/"), /reports\/visual-review\/custom-slug$/);

const normalized = normalizeSections([
  { label: "Hero Block", selectors: [".hero", "#hero"] },
  { label: "Pricing", reference_selectors: [".plans"], local_selectors: ["#pricing"] },
]);

assert.deepEqual(normalized[0], {
  label: "hero-block",
  referenceSelectors: [".hero", "#hero"],
  localSelectors: [".hero", "#hero"],
});
assert.deepEqual(normalized[1], {
  label: "pricing",
  referenceSelectors: [".plans"],
  localSelectors: ["#pricing"],
});

const tempDir = mkdtempSync(join(tmpdir(), "capture-sections-"));
try {
  const sectionsPath = join(tempDir, "sections.json");
  writeFileSync(sectionsPath, JSON.stringify([{ label: "FAQ", selectors: ".faq" }]), "utf8");
  const withSections = parseCaptureArgs([
    "https://example.com",
    "http://127.0.0.1:5173",
    "--sections",
    sectionsPath,
  ]);
  assert.equal(withSections.sections[0].label, "faq");
  assert.deepEqual(withSections.sections[0].referenceSelectors, [".faq"]);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log("capture-local-screenshots CLI tests passed");
