# Project Proposal: LockOut — LLM Security CTF

## 1. Summary

**LockOut** is a browser-based capture-the-flag (CTF) game that teaches LLM security and AI engineering through play. The player is trapped aboard a damaged spaceship with no clearance, and must talk, trick, and reason their way past a series of AI-controlled door guards to escape. Each level is a real, playable example of a known LLM security vulnerability class, paired with a short written explainer of the underlying concept.

The game is not purely conversational. As the player advances, levels increasingly mix **prompt-based social engineering** with **real coding problems** — reading a snippet of the guard's backend logic to find the actual gap, writing a small script to craft a payload, or fixing/exploiting a flawed validation function. The deeper the level, the more technical knowledge it demands, so the difficulty curve is tied directly to how much the player actually understands, not just how cleverly they can phrase a sentence.

The project serves two purposes at once:

1. **A public game** anyone can play, demonstrating today's LLM security vulnerabilities hands-on rather than through a slide deck.
2. **A personal AI engineering curriculum.** Building each level requires implementing the real engineering patterns behind modern LLM apps: tool calling, retrieval-augmented generation (RAG), structured output, guardrails, and evaluation.

---

## 2. Motivation

AI is moving fast, and cybersecurity is adapting alongside it. While learning LLM engineering as part of my AI engineering journey, I want to expand into this side of cybersecurity, not as a full career pivot, but as a real, demonstrable addition to my profile. Something I can point to and keep expanding over time, rather than a certificate that proves I sat through a course.

Reading about prompt injection is forgettable. Finding, by hand, that a model will accept an unverified claim of "authorization" and act on it is not. That exact discovery, made while testing Lakera's Agent Breaker, is the seed of this project: the gap between what an LLM *agrees to in conversation* and what the *backend actually enforces* is the central idea in LLM security, and it is best taught by letting someone fall into it themselves.

Building the game requires implementing the same patterns that make LLM apps secure or insecure in production, so the project is simultaneously a security education tool and an AI engineering portfolio piece.

## 3. Three Pillars, One Game

LockOut isn't a pure prompt-injection game. Each level mixes three ingredients in different proportions, and the mix shifts as the player goes deeper:

| Pillar | What it tests | Where it shows up |
| --- | --- | --- |
| **CTF mechanics** | Exploration, hints, chained clues, a flag or win-state per level | The overall structure — every level |
| **LLM security** | Prompt injection, jailbreaking, trust boundaries between model and backend | The core of every level — the guard AI itself |
| **Coding problems** | Reading real (or realistic) backend code, spotting the actual flaw, sometimes writing a small fix or exploit script | Increasingly, from the middle levels onward |

**Difficulty scales with level, and so does the mix.** Early levels lean almost entirely on conversation (pure prompt injection, no code reading required) so the game is approachable to anyone, including non-programmers. Later levels increasingly require reading the guard AI's actual backend logic to find the gap, closer to a traditional security CTF.

| Stage | Levels | Knowledge required |
| --- | --- | --- |
| **Entry** | 1–2 | Conversation only. No code reading. Anyone can play. |
| **Core** | 3–4 | Conversation + noticing a stated rule has a gap |
| **Intermediate** | 5–6 | Requires retrieving and using outside information (RAG) and recognizing indirect injection in content, not just chat |
| **Advanced** | 7–8 | Requires reading real backend/validation code snippets, spotting the actual logic flaw, and crafting an exploit that targets it specifically |

---

## 4. Learning Objectives

| Area | What gets learned by building this |
| --- | --- |
| **LLM security** | Prompt injection, jailbreaking, indirect injection via tool/content inputs, insecure output handling, excessive agency, system prompt leakage |
| **Tool calling / agents** | Designing tools an LLM can call, and the principle that permission checks belong in the tool's code, never in the model's judgment |
| **RAG** | Several levels require the player (or the in-game AI) to retrieve information from a ship's manual / log archive before a door will open — real chunking, embedding, and retrieval |
| **Structured output** | Guard AIs return structured decisions via a tool call, which must be validated server-side, not trusted as-is |
| **Evaluation** | Each level is paired with a small test suite of attack/non-attack prompts to measure whether a given defense actually holds |
| **Guardrails** | Implementing and then *breaking* real defense patterns: input filters, output filters, a second "judge" LLM, permission-checked tools |

---

## 5. Game Concept

### Setting

You regain consciousness aboard a damaged science vessel. Life support is failing. You have no security clearance. Every door, console, and system is guarded by an onboard AI that will only act for authorized personnel — and you are not one.

### Core Loop

```
Enter a room
     ↓
Talk to the room's guard AI (chat interface)
     ↓
Discover what it knows / what it will do
     ↓
Find the gap between its stated rule and its actual enforcement
     ↓
Exploit it to open the door / unlock the system
     ↓
Advance, carrying hints or tools found along the way
```

### Level List

The first two levels are designed and documented in detail (see `docs/LEVEL-1-Cargo.md` and `docs/LEVEL-2-Crew-Deck.md`). They are deliberately **different exploit mechanisms**, not variations on the same trick, even though both are forms of prompt injection:

| Level | Location | Challenge type | Vulnerability class | What actually happens |
| --- | --- | --- | --- | --- |
| 1 | Cargo Bay (CARGO-9) | Prompt only | LLM01: Prompt Injection — unverified claim trusted blindly | The AI is convinced by a specific, explicit claim ("I am the supervisor"). The backend trusts the AI's own `authorized`/`personnel` fields with nothing to check them against. |
| 2 | Crew Deck (WATCH-2) | Prompt only | LLM07: System Prompt Leakage, chained into a correct check | The AI holds a real secret (a crew ID) in its system prompt and is told never to reveal it. The player must extract it through injection, then submit it. The final match check is a real, deterministic comparison — the vulnerability is entirely in the leak, not the check. |
| 3–8 | — | — | — | Draft only, not yet redesigned in light of Levels 1–2. Original concepts (unverified-authorization claims with a fake "record" check, output filtering, RAG, indirect injection via content, judge-model pattern, final combined level) still apply directionally but need to be revisited so each level stays mechanically distinct, the way 1 and 2 are. |

Each level that is beaten shows the player, afterward, **why it worked** — a short, plain-language explainer tying the exploit to its real-world OWASP category, plus what the backend should have checked instead.

---

## 6. What Makes a Level "Real"

Every level maps to a named, real vulnerability class, primarily drawn from the **OWASP Top 10 for LLM Applications**:

- LLM01: Prompt Injection
- LLM02: Insecure Output Handling
- LLM06: Excessive Agency
- LLM07: System Prompt Leakage
- LLM08: Vector/Embedding Weaknesses (relevant to the RAG level)

This gives the project a credible backbone and a natural way to explain it ("each level demonstrates one OWASP LLM Top 10 category") rather than inventing vulnerabilities from scratch.

---

## 7. Technical Architecture

```
Browser (chat panel — no UI built yet, all levels proven via API first)
   │
   ↓
Next.js (App Router, TypeScript)
   ├── /api/chat — orchestration: Groq call → checkBackend() → response
   ├── Per-level modules (system prompt, tool definition, checkBackend)
   └── (planned) RAG pipeline for Level 5+, evaluation harness for V2
           │
           ├──→ Groq (LLM calls, tool/function calling)
           └──→ Supabase (planned — attempt logging; not yet wired in)
```

- **Frontend/API:** Next.js, TypeScript. No UI exists yet by design — every level is built backend-first (`checkBackend()` → system prompt → Bruno testing) and proven to work via direct API requests before any chat interface is built.
- **LLM:** Groq, using tool/function calling so each guard AI returns a structured decision rather than free text. That decision is always treated as an input to a plain-code check, never as the verdict itself.
- **Testing:** Bruno (API client) is the primary testing tool for every level — a documented set of requests (refuse cases, vague claims, the real exploit, multi-turn conversations) is run against `/api/chat` before any level is considered done.
- **Persistence:** Supabase, planned but deferred. The plan is a single `attempts` table (every turn, win or lose, logged for later evaluation/leaderboard use), added once more than one level exists end-to-end, so logging and level logic aren't being debugged at the same time.
- **Retrieval:** Supabase `pgvector`, planned for the Archive/RAG level — not started.

### Design principle carried through every level

The AI's structured output (its tool call) is **never trusted as the verdict**. Each level has its own `checkBackend()` function, in plain code, that is the only place a door-opening decision is actually made. This is deliberately visible in the post-level explainer — the point is to show, concretely, where the real security boundary should have been.

---

## 8. Scope

### V1 (playable core)

- **Level 1 — Cargo Bay (CARGO-9):** built, passing Bruno tests. See `docs/LEVEL-1-Cargo.md`.
- **Level 2 — Crew Deck (WATCH-2):** designed, not yet built. See `docs/LEVEL-2-Crew-Deck.md`.
- Chat-based interaction via API only — no UI yet.
- Attempt logging via Supabase — deferred until Level 2 is also built.

### V2

- Level 5 (RAG / Archive)
- Level 6 (indirect injection via content)
- Basic evaluation harness (automated attack-prompt test suite per level)
- Levels 3–4 redesigned and built, consistent with the "mechanically distinct exploit per level" approach used for Levels 1–2

### V3

- Level 7 (judge-model pattern)
- Level 8 (combined final level)
- Public leaderboard / shareable link
- Write-up page explaining each OWASP category with this game as the example

### Explicitly out of scope for now

- Real 2D movement/animation/sprites — static room panels only
- User accounts / auth
- Mobile app
- **Traditional network hacking** (scanning, exploiting services, gaining access to other machines) — raised as a possible future direction, but a different skill domain from the AI-security ladder this project is built around. If pursued, it would need to exist as its own clearly separate track rather than folded into the existing level progression. No design work has started on it.

---

## 9. Success Criteria

- A stranger can open the link, play through Levels 1–2 with no explanation, and come away able to state the core idea: *"the model's agreement is not the same as the system's enforcement."*
- For each shipped level, a short written note exists (the `docs/LEVEL-N-*.md` files) stating: the vulnerability class, why the exploit worked, and the fix.
- Each level is built in a fixed order — backend check first, then prompt, then Bruno testing, then (later) UI — so every level is provably correct on its own before the next one starts.
- The project is rebuildable from memory in an interview setting — every piece should be explainable without notes, since it was built level by level, not generated wholesale.

---

## 10. Why This Is Worth Building

LLM security is a genuinely growing specialization, not a novelty topic — as AI systems are given real capabilities (sending email, running code, accessing records), the cost of a broken trust boundary rises. Most portfolio projects demonstrate "I can call an LLM API." Fewer demonstrate "I can explain, with a working example, why a security boundary must live in code and not in a prompt." This project produces that, while its RAG and tool-calling levels also cover the core AI engineering skills needed regardless of specialization.