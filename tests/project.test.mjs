import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function filesBelow(relative, extensions = new Set([".ts", ".tsx", ".md"])) {
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (extensions.has(path.extname(entry.name))) out.push(full);
    }
  }
  await walk(path.join(root, relative));
  return out;
}

test("public copy avoids retired credibility claims", async () => {
  const files = [
    ...(await filesBelow("app")),
    ...(await filesBelow("components")),
    ...(await filesBelow("lib")),
  ];
  const retired = [
    /watch real data respond/i,
    /basically legally drunk/i,
    /thirst shows up late/i,
    /100%.*numbers.*cited/i,
    /personalized app, coming/i,
    /sleep starts to suffer/i,
    /clear enough to sleep/i,
    /safe for about/i,
    /fresh young hearing/i,
    /focus was running about/i,
    /takes your brain offline/i,
  ];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const pattern of retired) {
      assert.doesNotMatch(text, pattern, `${path.relative(root, file)} contains ${pattern}`);
    }
  }
});

test("article sources are linked and contextualized", async () => {
  const text = await readFile(path.join(root, "lib/articles.ts"), "utf8");
  assert.match(text, /reviewed: "Reviewed [^"]+"/);
  assert.ok((text.match(/href: "https:\/\//g) ?? []).length >= 10);
  assert.ok((text.match(/note: "/g) ?? []).length >= 10);
});

test("removed UI scaffold is not imported", async () => {
  const files = [...(await filesBelow("app")), ...(await filesBelow("components")), ...(await filesBelow("lib"))];
  for (const file of files) {
    assert.doesNotMatch(await readFile(file, "utf8"), /@\/components\/ui\//);
  }
});

test("interactive custom graphics expose keyboard controls", async () => {
  const clock = await readFile(path.join(root, "components/labs/BodyClock.tsx"), "utf8");
  assert.match(clock, /role="slider"/);
  assert.match(clock, /onKeyDown={onClockKeyDown}/);

  const vision = await readFile(path.join(root, "app/labs/vision/page.tsx"), "utf8");
  assert.match(vision, /role="slider"/);
  assert.match(vision, /onKeyDown={onBalanceKeyDown}/);

  const pattern = await readFile(path.join(root, "app/labs/sleep/games/pattern/page.tsx"), "utf8");
  assert.match(pattern, /aria-label={`Dot \$\{d\.i \+ 1\}`}/);
});

test("canonical domain is consistent", async () => {
  const site = await readFile(path.join(root, "lib/site.ts"), "utf8");
  assert.match(site, /https:\/\/thehealthblueprintproject\.com/);
  assert.doesNotMatch(site, /healthblueprint\.app/);
});
