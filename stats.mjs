// Génère metrics.plugin.languages.svg : langages de tous tes repos (publics + privés).
// Node 20+, aucune dépendance. Token requis dans la variable d'environnement GH_STATS_TOKEN.

import { writeFileSync } from "node:fs";

const TOKEN = process.env.GH_STATS_TOKEN;
if (!TOKEN) throw new Error("GH_STATS_TOKEN manquant");

// ---- Réglages ----
const EXCLUDE_FORKS = true;
const EXCLUDE_ARCHIVED = true;
const EXCLUDE_LANGS = new Set([]); // ex: ["HTML", "CSS", "Jupyter Notebook"]
const EXCLUDE_REPOS = new Set([]); // ex: ["ThomasPixelsOf/old-stuff"]
const TOP = 8;
const OUTPUT = "metrics.plugin.languages.svg";
// -------------------

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "profile-language-stats",
};

async function gh(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} sur ${url}`);
  return res.json();
}

async function listRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await gh(
      `https://api.github.com/user/repos?affiliation=owner&per_page=100&page=${page}`
    );
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const repos = (await listRepos()).filter(
  (r) =>
    !(EXCLUDE_FORKS && r.fork) &&
    !(EXCLUDE_ARCHIVED && r.archived) &&
    !EXCLUDE_REPOS.has(r.full_name)
);

const totals = {};
for (const r of repos) {
  const langs = await gh(`https://api.github.com/repos/${r.full_name}/languages`);
  for (const [name, bytes] of Object.entries(langs)) {
    if (EXCLUDE_LANGS.has(name)) continue;
    totals[name] = (totals[name] || 0) + bytes;
  }
}

const sum = Object.values(totals).reduce((a, b) => a + b, 0);
if (!sum) throw new Error("Aucun langage trouvé : vérifie le token et ses permissions");

const top = Object.entries(totals)
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP)
  .map(([name, bytes]) => ({ name, pct: (bytes / sum) * 100 }));

const COLORS = ["#3178c6", "#f1e05a", "#e34c26", "#563d7c", "#3572A5", "#89e051", "#dea584", "#b07219", "#c6538c"];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const W = 400, PAD = 20, BAR_W = W - PAD * 2;
const ROW_H = 24, H = 70 + Math.ceil(top.length / 2) * ROW_H + PAD;

let x = PAD;
const bar = top
  .map((l, i) => {
    const w = (l.pct / top.reduce((a, b) => a + b.pct, 0)) * BAR_W;
    const seg = `<rect x="${x.toFixed(2)}" y="48" width="${w.toFixed(2)}" height="8" fill="${COLORS[i % COLORS.length]}"/>`;
    x += w;
    return seg;
  })
  .join("");

const legend = top
  .map((l, i) => {
    const cx = PAD + (i % 2) * (BAR_W / 2);
    const cy = 82 + Math.floor(i / 2) * ROW_H;
    return `<circle cx="${cx + 5}" cy="${cy - 4}" r="5" fill="${COLORS[i % COLORS.length]}"/>` +
      `<text x="${cx + 16}" y="${cy}" font-size="12">${esc(l.name)} ${l.pct.toFixed(1)}%</text>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Ubuntu, Sans-Serif">
<style>
  .bg{fill:none;stroke:none}
  text{fill:#434d58}
  .title{font-size:16px;font-weight:600;fill:#2f80ed}
  @media (prefers-color-scheme: dark){text{fill:#c9d1d9} .title{fill:#58a6ff}}
</style>
<rect class="bg" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="6"/>
<text class="title" x="${PAD}" y="32">Most Used Languages</text>
<clipPath id="c"><rect x="${PAD}" y="48" width="${BAR_W}" height="8" rx="4"/></clipPath>
<g clip-path="url(#c)">${bar}</g>
${legend}
</svg>
`;

writeFileSync(OUTPUT, svg);
console.log(`OK : ${repos.length} repos, ${top.length} langages -> ${OUTPUT}`);
