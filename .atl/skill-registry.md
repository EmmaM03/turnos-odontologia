# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol (if present in your SDD skill set).

Project: `turnos-odontologia` (Node.js + TypeScript + Vitest, módulo de dominio puro — agenda odontológica, MVP académico, un único change implementado en código: C-01).

## User Skills

Scanned locations: `~/.claude/skills/` (resolves symlinks into `~/.agents/skills/`), `{project}/.claude/skills/` (empty), `~/.config/opencode/skills/`, `~/.gemini/skills/`, `~/.cursor/skills/`, `~/.copilot/skills/`, `{project}/.gemini/skills/`, `{project}/.agent/skills/`, `{project}/skills/` (all empty/non-existent). `skill-registry` itself, and the Anthropic built-in platform skills synced under `~/.claude/skills/synced/` (browser, docs, pdf, pptx, xlsx, computer-use, etc.) were excluded — the latter are generic Claude-product capabilities, not project/coding skills installed for this repo.

| Trigger | Skill | Path |
|---------|-------|------|
| Build features/fix bugs test-first, "red-green-refactor", integration tests | tdd | `C:\Users\Emmam\.agents\skills\tdd\SKILL.md` (symlinked from `~\.claude\skills\tdd`) |
| Writing tests, mocking, coverage config, test filtering/fixtures (Vitest) | vitest | `C:\Users\Emmam\.agents\skills\vitest\SKILL.md` (symlinked from `~\.claude\skills\vitest`) |
| Start a new project from scratch via SDD/OpenSpec foundation flow; `/active-orchestrator:*` | active-orchestrator | `C:\Users\Emmam\.claude\skills\active-orchestrator\SKILL.md` |
| Create/update AGENTS.md or CLAUDE.md, "armar las reglas del proyecto" | agent-instruction (agents-md-generator) | `C:\Users\Emmam\.claude\skills\agent-instruction\SKILL.md` |
| Run Discovery/market research before building the KB | discovery-research | `C:\Users\Emmam\.claude\skills\discovery-research\SKILL.md` |
| "find a skill for X", "is there a skill that can...", extend capabilities | find-skill (find-skills) | `C:\Users\Emmam\.claude\skills\find-skill\SKILL.md` |
| Create/build a project knowledge base ("armar base de conocimiento", "crear KB") | kb-creator | `C:\Users\Emmam\.claude\skills\kb-creator\SKILL.md` |
| Create/regenerate CHANGES.md / roadmap / implementation plan | roadmap-generator | `C:\Users\Emmam\.claude\skills\roadmap-generator\SKILL.md` |
| Create, edit, or optimize an agent skill; run skill evals | skill-creator | `C:\Users\Emmam\.claude\skills\skill-creator\SKILL.md` |
| Investigate a competitor/existing solution from a URL | web-scraper | `C:\Users\Emmam\.claude\skills\web-scraper\SKILL.md` |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### tdd
- Red before green: write the failing test first, then only the minimum code to pass it — never anticipate future tests or add speculative features.
- Test only at pre-agreed seams (public boundaries). Confirm the seams with the user before writing any test; never test private methods, internals, or via a side channel (e.g. querying the DB instead of the public interface).
- A good test verifies behavior through the public interface and survives refactors — avoid implementation-coupled tests (mocking internal collaborators, testing private methods).
- Avoid tautological assertions: expected values must come from an independent source of truth (spec, worked example, known-good literal) — never recomputed the same way the code does.
- Avoid horizontal slicing (all tests, then all code). Work in vertical slices: one seam → one test → one minimal implementation, repeat each cycle as a tracer bullet.
- One slice at a time: one seam, one test, one minimal implementation per cycle.
- Refactoring is NOT part of the red→green loop — it belongs to the review stage (`code-review` skill / OPSX Verify).
- Match test names/vocabulary to the project's domain language (check `GLOSSARY.md` if present) and respect existing ADRs in the touched area.

### vitest
- Jest-compatible API; Vite-native transform pipeline; native ESM/TS/JSX with no extra config.
- Use `test`/`it` (with `skip`/`only`/`concurrent` modifiers) and `describe`/`suite` for grouping/nesting.
- Assertions via `expect` (toBe, toEqual, matchers, asymmetric matchers).
- Setup/teardown via `beforeEach`/`afterEach`/`beforeAll`/`afterAll` (and `aroundEach`).
- Mocking via `vi` utilities: `vi.fn`, `vi.spyOn`, fake timers/dates, `vi.mock`, `vi.hoisted`.
- Coverage via V8 (default) or Istanbul provider, configured in the Vitest config.
- Snapshots via `toMatchSnapshot`/inline snapshots — prefer explicit assertions per the `tdd` skill's anti-tautology rule; don't let a snapshot become the only check.
- Test fixtures/context via `test.extend`; concurrency via `test.concurrent`/sharding; filter runs by name/file pattern/tags.
- Deep-dive references live under the skill's `references/*.md` (config, CLI, mocking, coverage, environments, projects, etc.) — consult the matching one instead of guessing API shape.

### active-orchestrator
- Orchestration/meta skill only (not for feature code). Owns `.active-orchestrator-state.json`'s `version`/`step`/`owner` fields only — never writes KB/CHANGES.md/AGENTS.md content itself.
- Routes each foundation phase to its dedicated sub-skill in order (discovery-research → kb-creator → roadmap-generator → find-skill → skill-registry → agent-instruction) — never reimplements a phase's logic inline.
- Holds a checkpoint at every phase boundary; never chains phases without the user's explicit "Continuar".
- Never installs a skill autonomously — `find-skill` only recommends; the user picks; only then the orchestrator installs.

### agent-instruction (agents-md-generator)
- Generates root `AGENTS.md` + root `CLAUDE.md` as an identical copy (not a symlink/reference) — never inside `.claude/` or `openspec/`.
- Pre-checks: `knowledge-base/` (at least `02_descripcion_general.md`) must exist or it refuses; if `CHANGES.md` is missing, generates anyway but omits the Roadmap section and warns.
- Reads `.atl/skill-registry.md` as the source of truth for available skills (this file) — does not rescan `.claude/skills/` unless this registry is missing.
- Reads the global `~/.claude/CLAUDE.md` first and must NOT repeat universal rules already defined there (orchestrator, governance, engram, TDD) — only emits project-specific rules plus any universal rule the global doesn't cover (e.g. commit/build conventions).
- Hard rules are derived from the REAL detected stack (never hardcode to one language) and MUST be confirmed interactively with the user (AskUserQuestion) before being written.

### discovery-research
- Produces a discovery artifact (e.g. `docs/discovery/informe-discovery.md`) + `state.discovery`; feeds `kb-creator`, never replaces it.
- Governance MEDIA: implements with checkpoints; never writes the discovery file or touches `state.json` without the user's explicit confirmation of the final summary.
- Delegates competitor/source scraping to `web-scraper` (one call per URL) instead of reimplementing scraping.
- Checklist Q&A covers 11 fixed points (problema, usuarios, casos de uso, competidores, funcionalidades necesarias/opcionales, reglas de negocio, integraciones, restricciones, riesgos, preguntas abiertas) — never fills a point with an assumption when it can be asked or researched.
- Unverified assumptions go into "riesgos"/"preguntas abiertas", not into settled facts.

### find-skill (find-skills)
- Search with `npx skills find [query] [--owner <owner>]`; install with `npx skills add <package>`; refresh with `npx skills update` — never install without explicit user confirmation.
- Verify quality before recommending: prefer 1K+ installs (be cautious under 100), prefer reputable/known sources, check GitHub stars (<100 = treat with skepticism).
- Present each candidate with name, install count, source, and install command — the user decides, never auto-install.

### kb-creator
- Output only in root `knowledge-base/` — never mixed with `docs/` (source material).
- Must produce exactly the 10 canonical files (`01_vision_y_objetivos.md` … `10_preguntas_abiertas.md`) + `README.md`; extra files only as additive `1X_`/`2X_`, never replacing a canonical.
- Auto-detects mode from filesystem state (Mode A: silent from `docs/` sources; Mode B: interactive from scratch) — doesn't ask the user which mode to use.
- Don't rerun fully if all 10 canonicals already exist complete — suggest editing a specific file instead.

### roadmap-generator
- Output is a single root `CHANGES.md` (never inside `openspec/`) — fire-and-forget, no questions asked.
- Pre-checks required before generating: `knowledge-base/` exists with all 10 canonicals, and `openspec/` exists — abort with a clear message if either fails.
- Always reads `04_modelo_de_datos.md`, `06_funcionalidades.md`, `07_flujos_principales.md`, `08_arquitectura_propuesta.md`; reads `03`/`05`/`10` only if relevant.
- `CHANGES.md`'s top-level section structure is a fixed contract (dependency tree, parallelism gates, critical path, per-change governance level + "Leer antes" KB pointers) — never add/remove top-level sections.
- Don't regenerate the whole file if the user wants to update a single change — suggest a targeted edit instead.

### skill-creator
- Lifecycle: capture intent → interview/research → write `SKILL.md` → test prompts → eval (qualitative + quantitative) → iterate → expand test set.
- The `description` frontmatter field must carry ALL "when to use" triggering info, phrased slightly "pushy" to counter model under-triggering — the body never repeats triggering info.
- Calibrate jargon to the user's apparent technical level; briefly clarify terms like "evaluation"/"JSON"/"assertion" if unsure.
- If a draft already exists, skip straight to the eval/iterate loop instead of re-interviewing from scratch.

### web-scraper
- Output is always `discovery/sources/<slug>.md` (slug via `scripts/slugify.py`) with a FIXED 8-field schema — never reorder, omit, or invent a field; missing data → `(no publicado)`, never guessed.
- Read-only/external-only skill — no approval gate needed for a single URL fetch (cheap, reversible).
- No crawling or mass-scraping of a full site — only explicit, individual URLs passed by the caller.
- On blocked/empty fetch (403, paywall, CAPTCHA, empty SPA shell): report the limitation as-is, never retry with evasion tricks, move to the next URL.
- Multiple URLs are processed one by one; a single failure never aborts the whole batch — report resolved vs. failed count at the end.

## Decisiones de selección de skills (find-skill)

Registradas tal cual en `.active-orchestrator-state.json` → `state.skills.recommended[].decision` / `.decision_rationale` (etapa 5, find-skill). No reinterpretadas.

- **tdd** → **instalada**. Razón: escribir primero el test de cada escenario del spec asegura la trazabilidad spec-test que pide la fase Verify de OPSX.
- **vitest** → **instalada**. Razón: es el test runner elegido explícitamente en el Discovery (restricciones de stack).
- **domain-modeling** → **descartada**. Razón: el dominio ya está modelado en la Knowledge Base (`knowledge-base/04_modelo_de_datos.md` y `08_arquitectura_propuesta.md`); sumarla agrega riesgo de sobrediseño para un alcance de un solo change.
- **code-review** → **descartada**. Razón: se superpone con la fase Verify de OPSX, que ya cubre ese gate de calidad antes de archivar.
- **zod** → **descartada**. Razón: dominio puro sin entradas externas que validar en runtime, y la recomendación misma era de baja confianza (pocas instalaciones).

Otras dos recomendaciones descartadas sin justificación adicional pedida por el usuario (registradas igual en el state, no parte del requisito de 5 decisiones): `typescript-advanced-types` (wshobson/agents) y `javascript-testing-patterns` (wshobson/agents).

## Project Conventions

No se encontró todavía ningún archivo índice de convenciones en la raíz del proyecto (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`) — ese es el output de la fase `agent-instruction`, todavía pendiente (`state.step == "registry"` en `.active-orchestrator-state.json`, antes de `"agents"`).

Referencias actuales de facto en la raíz (no son archivos de convenciones de agente, pero son la fuente de verdad hoy):

| File | Path | Notes |
|------|------|-------|
| Knowledge base index | `knowledge-base/README.md` | Índice de los 10 archivos canónicos de la KB |
| Roadmap de changes | `CHANGES.md` | Índice operativo de changes (C-01..C-06), generado por `roadmap-generator` |
| Orchestrator state | `.active-orchestrator-state.json` | Estado compartido del flujo de fundación OPSX/Active Stack |

Cuando se corra `agent-instruction`, va a generar `AGENTS.md` + `CLAUDE.md` en la raíz leyendo este mismo registry (`.atl/skill-registry.md`) como fuente de verdad de skills — no hace falta re-escanear.
