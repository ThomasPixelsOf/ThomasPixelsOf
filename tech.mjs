// Met à jour automatiquement la section "Tech Stack" du README.
// Détecte les technos dans tous tes repos (publics + privés), ajoute une liste manuelle.
// Node 20+, aucune dépendance. Variable d'environnement : GH_STATS_TOKEN.
// Le token doit avoir : Metadata (read) + Contents (read).

import { readFileSync, writeFileSync } from "node:fs";

const TOKEN = process.env.GH_STATS_TOKEN;
if (!TOKEN) throw new Error("GH_STATS_TOKEN manquant");

// ---- Réglages ----
const README = "README.md";
const START = "<!-- TECH-START -->";
const END = "<!-- TECH-END -->";
const EXCLUDE_FORKS = true;
const EXCLUDE_ARCHIVED = true;
const EXCLUDE_REPOS = new Set([]); // ex: ["ThomasPixelsOf/old-stuff"]
const MIN_REPOS = 1; // nombre de repos minimum pour afficher un badge détecté

// Badges toujours affichés, en plus de ceux détectés automatiquement.
// Noms = clés du CATALOG. Retire une ligne pour la laisser en détection automatique seule.
const MANUAL = [
  // Outils non détectables dans le code
  "Git", "Selenium", "OpenGL", "WebGL", "FFmpeg", "XFCE", "TOR", "nVIDIA",
  "Raspberry Pi", "Power Bi", "Prometheus", "Plex", "Jira", "Notion",
  "Pi-Hole", "Home Assistant", "Confluence", "Bitwarden",
  // Compétences gardées même si elles ne sont pas (ou plus) dans un de tes repos
  "Java", "PowerShell", "Python", "Kotlin", "C", "C#", "C++", "CMake",
  "Azure", "Cloudflare", "Firebase", ".Net", "JWT", "Nginx", "SQLite",
  "Playwright", "Unreal Engine", "Tampermonkey",
];
// ------------------

const S = "style=plastic";
// L'ordre ci-dessous est l'ordre d'affichage.
const CATALOG = {
  "Java": `https://img.shields.io/badge/java-%23ED8B00.svg?${S}&logo=openjdk&logoColor=white`,
  "TypeScript": `https://img.shields.io/badge/typescript-%23007ACC.svg?${S}&logo=typescript&logoColor=white`,
  "Rust": `https://img.shields.io/badge/rust-%23000000.svg?${S}&logo=rust&logoColor=white`,
  "Bash Script": `https://img.shields.io/badge/bash_script-%23121011.svg?${S}&logo=gnu-bash&logoColor=white`,
  "PowerShell": `https://img.shields.io/badge/PowerShell-%235391FE.svg?${S}&logo=powershell&logoColor=white`,
  "Python": `https://img.shields.io/badge/python-3670A0?${S}&logo=python&logoColor=ffdd54`,
  "Kotlin": `https://img.shields.io/badge/kotlin-%237F52FF.svg?${S}&logo=kotlin&logoColor=white`,
  "HTML5": `https://img.shields.io/badge/html5-%23E34F26.svg?${S}&logo=html5&logoColor=white`,
  "JavaScript": `https://img.shields.io/badge/javascript-%23323330.svg?${S}&logo=javascript&logoColor=%23F7DF1E`,
  "CSS3": `https://img.shields.io/badge/css3-%231572B6.svg?${S}&logo=css3&logoColor=white`,
  "C": `https://img.shields.io/badge/c-%2300599C.svg?${S}&logo=c&logoColor=white`,
  "C#": `https://img.shields.io/badge/c%23-%23239120.svg?${S}&logo=csharp&logoColor=white`,
  "C++": `https://img.shields.io/badge/c++-%2300599C.svg?${S}&logo=c%2B%2B&logoColor=white`,
  "Azure": `https://img.shields.io/badge/azure-%230072C6.svg?${S}&logo=microsoftazure&logoColor=white`,
  "Cloudflare": `https://img.shields.io/badge/Cloudflare-F38020?${S}&logo=Cloudflare&logoColor=white`,
  "Firebase": `https://img.shields.io/badge/firebase-%23039BE5.svg?${S}&logo=firebase`,
  ".Net": `https://img.shields.io/badge/.NET-5C2D91?${S}&logo=.net&logoColor=white`,
  "Bun": `https://img.shields.io/badge/Bun-%23000000.svg?${S}&logo=bun&logoColor=white`,
  "Electron.js": `https://img.shields.io/badge/Electron-191970?${S}&logo=Electron&logoColor=white`,
  "JWT": `https://img.shields.io/badge/JWT-black?${S}&logo=JSON%20web%20tokens`,
  "NPM": `https://img.shields.io/badge/NPM-%23CB3837.svg?${S}&logo=npm&logoColor=white`,
  "NodeJS": `https://img.shields.io/badge/node.js-6DA55F?${S}&logo=node.js&logoColor=white`,
  "OpenGL": `https://img.shields.io/badge/OpenGL-%23FFFFFF.svg?${S}&logo=opengl`,
  "Vite": `https://img.shields.io/badge/vite-%23646CFF.svg?${S}&logo=vite&logoColor=white`,
  "WebGL": `https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white&${S}`,
  "Nginx": `https://img.shields.io/badge/nginx-%23009639.svg?${S}&logo=nginx&logoColor=white`,
  "SQLite": `https://img.shields.io/badge/sqlite-%2307405e.svg?${S}&logo=sqlite&logoColor=white`,
  "Git": `https://img.shields.io/badge/git-%23F05033.svg?${S}&logo=git&logoColor=white`,
  "Playwright": `https://img.shields.io/badge/-playwright-%232EAD33?${S}&logo=playwright&logoColor=white`,
  "Selenium": `https://img.shields.io/badge/-selenium-%43B02A?${S}&logo=selenium&logoColor=white`,
  "Unreal Engine": `https://img.shields.io/badge/unrealengine-%23313131.svg?${S}&logo=unrealengine&logoColor=white`,
  "Bevy": `https://img.shields.io/badge/bevy-%23232326.svg?${S}&logo=bevy&logoColor=white`,
  "XFCE": `https://img.shields.io/badge/XFCE-%232284F2.svg?${S}&logo=xfce&logoColor=white`,
  "Tampermonkey": `https://img.shields.io/badge/tampermonkey-%2300485B.svg?${S}&logo=tampermonkey&logoColor=white`,
  "TOR": `https://img.shields.io/badge/tor-%237E4798.svg?${S}&logo=tor-project&logoColor=white`,
  "nVIDIA": `https://img.shields.io/badge/nVIDIA-%2376B900.svg?${S}&logo=nVIDIA&logoColor=white`,
  "Raspberry Pi": `https://img.shields.io/badge/-Raspberry_Pi-C51A4A?${S}&logo=Raspberry-Pi`,
  "Power Bi": `https://img.shields.io/badge/power_bi-F2C811?${S}&logo=powerbi&logoColor=black`,
  "Prometheus": `https://img.shields.io/badge/Prometheus-E6522C?${S}&logo=Prometheus&logoColor=white`,
  "Plex": `https://img.shields.io/badge/plex-%23E5A00D.svg?${S}&logo=plex&logoColor=white`,
  "Jira": `https://img.shields.io/badge/jira-%230A0FFF.svg?${S}&logo=jira&logoColor=white`,
  "Notion": `https://img.shields.io/badge/Notion-%23000000.svg?${S}&logo=notion&logoColor=white`,
  "Pi-Hole": `https://img.shields.io/badge/pihole-%2396060C.svg?${S}&logo=pi-hole&logoColor=white`,
  "Home Assistant": `https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?${S}&logo=home-assistant&logoColor=white`,
  "FFmpeg": `https://shields.io/badge/FFmpeg-%23171717.svg?logo=ffmpeg&${S}&labelColor=171717&logoColor=5cb85c`,
  "Confluence": `https://img.shields.io/badge/confluence-%23172BF4.svg?${S}&logo=confluence&logoColor=white`,
  "CMake": `https://img.shields.io/badge/CMake-%23008FBA.svg?${S}&logo=cmake&logoColor=white`,
  "Bitwarden": `https://img.shields.io/badge/bitwarden-%23175DDC.svg?${S}&logo=bitwarden&logoColor=white`,
};

// Langage GitHub -> badge
const LANG_MAP = {
  Java: "Java", TypeScript: "TypeScript", Rust: "Rust", Shell: "Bash Script",
  PowerShell: "PowerShell", Python: "Python", Kotlin: "Kotlin", HTML: "HTML5",
  JavaScript: "JavaScript", CSS: "CSS3", C: "C", "C#": "C#", "C++": "C++", CMake: "CMake",
};

// Fichier présent dans un repo -> badge(s)
const FILE_RULES = [
  [/(^|\/)Cargo\.toml$/, ["Rust"]],
  [/(^|\/)package\.json$/, ["NodeJS", "NPM"]],
  [/(^|\/)bun\.lockb?$|(^|\/)bunfig\.toml$/, ["Bun"]],
  [/(^|\/)vite\.config\.[cm]?[jt]s$/, ["Vite"]],
  [/(^|\/)CMakeLists\.txt$/, ["CMake"]],
  [/\.(csproj|fsproj|sln)$/, [".Net"]],
  [/(^|\/)playwright\.config\.[cm]?[jt]s$/, ["Playwright"]],
  [/(^|\/)firebase\.json$/, ["Firebase"]],
  [/(^|\/)wrangler\.(toml|json|jsonc)$/, ["Cloudflare"]],
  [/\.uproject$/, ["Unreal Engine"]],
  [/\.user\.js$/, ["Tampermonkey"]],
  [/(^|\/)nginx\.conf$/, ["Nginx"]],
  [/\.(sqlite3?|db3?)$/, ["SQLite"]],
  [/(^|\/)azure-pipelines\.ya?ml$|\.bicep$/, ["Azure"]],
];

// Dépendance dans package.json / Cargo.toml (à la racine) -> badge
const NPM_DEPS = [
  [/^electron$/, "Electron.js"],
  [/^(jsonwebtoken|jose)$/, "JWT"],
  [/^(playwright|@playwright\/test)$/, "Playwright"],
  [/^selenium-webdriver$/, "Selenium"],
  [/^(firebase|firebase-admin)$/, "Firebase"],
  [/^three$/, "WebGL"],
  [/^vite$/, "Vite"],
  [/^@types\/bun$|^bun-types$/, "Bun"],
  [/^@azure\//, "Azure"],
  [/^(sqlite3|better-sqlite3)$/, "SQLite"],
];
const CARGO_DEPS = [
  [/^\s*bevy\b/m, "Bevy"],
  [/^\s*jsonwebtoken\b/m, "JWT"],
  [/^\s*(rusqlite|sqlx)\b/m, "SQLite"],
];

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "profile-tech-stack",
};

// Retourne null si la ressource n'existe pas (404) ou si le repo est vide (409).
async function gh(url, { raw = false } = {}) {
  const res = await fetch(url, {
    headers: raw ? { ...headers, Accept: "application/vnd.github.raw+json" } : headers,
  });
  if (res.status === 404 || res.status === 409) return null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} sur ${url}`);
  return raw ? res.text() : res.json();
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

const hits = new Map(); // badge -> Set(repos)
const add = (badge, repo) => {
  if (!CATALOG[badge]) return;
  if (!hits.has(badge)) hits.set(badge, new Set());
  hits.get(badge).add(repo);
};

for (const r of repos) {
  // 1) Langages
  const langs = (await gh(`https://api.github.com/repos/${r.full_name}/languages`)) || {};
  for (const name of Object.keys(langs)) if (LANG_MAP[name]) add(LANG_MAP[name], r.full_name);

  // 2) Fichiers
  const tree = await gh(
    `https://api.github.com/repos/${r.full_name}/git/trees/${encodeURIComponent(r.default_branch)}?recursive=1`
  );
  const paths = (tree?.tree || [])
    .map((t) => t.path)
    .filter((p) => !/(^|\/)(node_modules|vendor|\.git)\//.test(p));
  if (tree?.truncated) console.log(`  (arborescence tronquée : ${r.full_name})`);
  for (const p of paths) {
    for (const [re, badges] of FILE_RULES) {
      if (re.test(p)) badges.forEach((b) => add(b, r.full_name));
    }
  }

  // 3) Dépendances à la racine
  if (paths.includes("package.json")) {
    const txt = await gh(`https://api.github.com/repos/${r.full_name}/contents/package.json`, { raw: true });
    try {
      const pkg = JSON.parse(txt || "{}");
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      for (const d of deps) for (const [re, b] of NPM_DEPS) if (re.test(d)) add(b, r.full_name);
    } catch {}
  }
  if (paths.includes("Cargo.toml")) {
    const txt = (await gh(`https://api.github.com/repos/${r.full_name}/contents/Cargo.toml`, { raw: true })) || "";
    for (const [re, b] of CARGO_DEPS) if (re.test(txt)) add(b, r.full_name);
  }
}

const detected = new Set(
  [...hits].filter(([, set]) => set.size >= MIN_REPOS).map(([badge]) => badge)
);
// Catégories affichées dans le README, dans cet ordre. Chaque catégorie est en ordre alphabétique.
// Un badge absent de toutes les catégories est placé dans "Other" à la fin.
const GROUPS = [
  ["Languages", ["Bash Script", "C", "C#", "C++", "CSS3", "HTML5", "Java", "JavaScript", "Kotlin", "PowerShell", "Python", "Rust", "TypeScript"]],
  ["Runtime & Web", [".Net", "Bun", "Electron.js", "JWT", "Nginx", "NodeJS", "NPM", "SQLite", "Tampermonkey", "Vite"]],
  ["Graphics & Native", ["Bevy", "CMake", "FFmpeg", "nVIDIA", "OpenGL", "Unreal Engine", "WebGL"]],
  ["Cloud", ["Azure", "Cloudflare", "Firebase"]],
  ["Testing", ["Playwright", "Selenium"]],
  ["Tools", ["Confluence", "Git", "Jira", "Notion", "Power Bi"]],
  ["Systems & Self-hosting", ["Bitwarden", "Home Assistant", "Pi-Hole", "Plex", "Prometheus", "Raspberry Pi", "TOR", "XFCE"]],
];
const wantedSet = new Set(Object.keys(CATALOG).filter((b) => detected.has(b) || MANUAL.includes(b)));
const grouped = new Set(GROUPS.flatMap(([, items]) => items));
const others = [...wantedSet].filter((b) => !grouped.has(b)).sort((a, b) => a.localeCompare(b));
// Disposition des titres de catégories : "A" gras au-dessus, "B" gras en ligne, "C" titre h4, "H3" titre h3.
const LAYOUT = "A";
const titleFor = {
  A: (t) => `**${t}**<br/>\n`,
  B: (t) => `**${t}:**\n`,
  C: (t) => `#### ${t}\n`,
  H3: (t) => `### ${t}\n`,
}[LAYOUT];
// Commentaire invisible sur le profil : auto = détecté dans tes repos, manual = forcé via MANUAL.
const tag = (b) => {
  const auto = detected.has(b), manual = MANUAL.includes(b);
  return `<!-- ${auto && manual ? "auto + manual" : auto ? "auto" : "manual"} -->`;
};
const sections = [...GROUPS, ["Other", others]]
  .map(([title, items]) => [title, items.filter((b) => wantedSet.has(b))])
  .filter(([, items]) => items.length > 0)
  .map(([title, items]) => `${titleFor(title)}${items.map((b) => `![${b}](${CATALOG[b]})${tag(b)}`).join("\n")}`);
const wanted = [...wantedSet];
const note =
  "<!-- Bloc généré automatiquement : toute modification ici sera écrasée. " +
  "auto = détecté dans tes repos, manual = ajouté via la liste MANUAL du script. -->";
const block = `${START}\n${note}\n${sections.join("\n\n")}\n${END}`;

const current = readFileSync(README, "utf8");
const re = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!re.test(current)) {
  throw new Error(`Marqueurs ${START} / ${END} introuvables dans ${README}`);
}
const next = current.replace(re, () => block);
if (next !== current) writeFileSync(README, next);

console.log(`Détectés : ${[...detected].join(", ") || "(aucun)"}`);
console.log(`OK : ${repos.length} repos, ${wanted.length} badges (${next === current ? "inchangé" : "README mis à jour"})`);
