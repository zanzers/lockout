# Project Proposal: LockOut— LLM Security CTF_Project Proposal

## 1. Summary

**Derelict** is a browser-based capture-the-flag (CTF) game that teaches LLM security and AI engineering through play. The player is trapped aboard a damaged spaceship with no clearance, and must talk, trick, and reason their way past a series of AI-controlled door guards to escape. Each level is a real, playable example of a known LLM security vulnerability class, paired with a short written explainer of the underlying concept.

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

Derelict isn't a pure prompt-injection game. Each level mixes three ingredients in different proportions, and the mix shifts as the player goes deeper:

| Pillar | What it tests | Where it shows up |
| --- | --- | --- |
| **CTF mechanics** | Exploration, hints, chained clues, a flag or win-state per level | The overall structure — every level |
| **LLM security** | Prompt injection, jailbreaking, trust boundaries between model and backend | The core of every level — the guard AI itself |
| **Coding problems** | Reading real (or realistic) backend code, spotting the actual flaw, sometimes writing a small fix or exploit script | Increasingly, from the middle levels onward |

**Difficulty scales with level, and so does the mix.** Early levels lean almost entirely on conversation (pure prompt injection, no code reading required) so the game is approachable to anyone, including non-programmers. Later levels increasingly require reading the guard AI's actual backend logic (a real validation function, a real system prompt, a real tool definition) to find the gap, closer to a traditional security CTF. The player's needed knowledge grows level by level, from "cleverness with words" toward "cleverness with words *and* an ability to read code and reason about systems":

| Stage | Levels | Knowledge required |
| --- | --- | --- |
| **Entry** | 1–2 | Conversation only. No code reading. Anyone can play. |
| **Core** | 3–4 | Conversation + noticing a stated rule has a gap (e.g. "unless authorized" with no verification) |
| **Intermediate** | 5–6 | Requires retrieving and using outside information (RAG) and recognizing indirect injection in content, not just chat |
| **Advanced** | 7–8 | Requires reading real backend/validation code snippets shown in-level, spotting the actual logic flaw, and crafting an exploit that targets it specifically |

This progression is also what makes the project useful as a personal curriculum: by the time you reach the advanced levels, you are not just playing a game, you are debugging and exploiting real (if simplified) backend logic, the same skill used in real LLM security assessments.

---

## 4. Learning Objectives

| Area | What gets learned by building this |
| --- | --- |
| **LLM security** | Prompt injection, jailbreaking, indirect injection via tool/content inputs, insecure output handling, excessive agency, system prompt leakage |
| **Tool calling / agents** | Designing tools an LLM can call, and the principle that permission checks belong in the tool's code, never in the model's judgment |
| **RAG** | Several levels require the player (or the in-game AI) to retrieve information from a ship's manual / log archive before a door will open — real chunking, embedding, and retrieval |
| **Structured output** | Guard AIs return structured decisions (`{"action": "open_door", "authorized": true}`), which must be validated server-side, not trusted as-is |
| **Evaluation** | Each level is paired with a small test suite of attack/non-attack prompts to measure whether a given defense actually holds |
| **Guardrails** | Implementing and then *breaking* real defense patterns: input filters, output filters, a second "judge" LLM, permission-checked tools |

---

## 5. Game Concept

### Setting

You regain consciousness aboard the derelict science vessel *Kestrel*. Life support is failing. You have no security clearance. Every door, console, and system is guarded by an onboard AI that will only act for authorized personnel — and you are not one.

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

### Level List (draft)

Difficulty rises in two dimensions at once: the AI guard's defenses get stronger, and the **type of challenge** shifts from pure conversation toward real code. Early levels need only clear thinking and a chat box; late levels require reading code, writing small scripts, or understanding how retrieval and validation actually work under the hood.

| Level | Location | Challenge type | Vulnerability class | Engineering pattern behind it |
| --- | --- | --- | --- | --- |
| 1 | Cargo Bay | Prompt only | No real defense — direct instruction works | Baseline: an unguarded tool call |
| 2 | Crew Deck | Prompt only | Refuses direct asks, but has no authority check | A refusal that isn't backed by a permission check |
| 3 | Security Office | Prompt only | Accepts unverified claims of "authorization" | The exact pattern discovered in testing — trusting words, not records |
| 4 | Engine Room | Prompt + code reading | Output filter blocks the literal passcode string | Keyword filtering, defeated by encoding/splitting the output — player is shown the filter's actual code to find the gap |
| 5 | Archive / Library | Prompt + RAG | Door opens only if you can prove a fact from the ship's logs | **RAG required** — logs are too long for one prompt; must retrieve the right passage |
| 6 | Medbay | Prompt + coding problem | Indirect injection — a "patient note" you show the AI contains hidden instructions | Prompt injection via tool/content input; player writes the injected payload as a small script, not just a sentence |
| 7 | Bridge | Code reading + prompt | A second AI reviews the first AI's decision before acting | Guard-model pattern — player reads both AIs' logic to find where the judge itself can be fooled |
| 8 | Escape Pod Bay | Full hybrid | Combines several defenses at once | Final boss: chained exploitation, mixing a coding fix, a crafted payload, and conversational framing in one level |

Each level that is beaten should also show the player, afterward, **why it worked** — a short, plain-language explainer tying the exploit to its real-world name (e.g. "This is a form of **indirect prompt injection**."), plus the code fix that would have stopped it, for the levels that involved code.

---

## 6. What Makes a Level "Real"

To keep this honest and not just a puzzle box, every level maps to a named, real vulnerability class, primarily drawn from the **OWASP Top 10 for LLM Applications**, which is the closest thing the field has to a standard reference:

- LLM01: Prompt Injection
- LLM02: Insecure Output Handling
- LLM06: Excessive Agency
- LLM07: System Prompt Leakage
- LLM08: Vector/Embedding Weaknesses (relevant to the RAG level)

This gives the project a credible backbone and a natural way to explain it ("each level demonstrates one OWASP LLM Top 10 category") rather than inventing vulnerabilities from scratch.

---

## 7. Technical Architecture

Reuses the working foundation already built in the Prompt Lab prototype.

```
Browser (2D room UI, chat panel)
   │
   ↓
Next.js
   ├── Room / level UI (lightweight pixel-art panels, not a full game engine)
   ├── Chat interface → guard AI
   ├── Level API routes (one per level's rules + tools)
   ├── RAG pipeline (Level 5+): chunk → embed → store → retrieve
   └── Evaluation harness: attack/non-attack test prompts per level
           │
           ├──→ Groq (LLM calls, streaming)
           └──→ Supabase (level state, ship's log archive + pgvector, attempt logs)
```

- **Frontend:** Next.js, TypeScript, Tailwind CSS. Chosen because the existing Prompt Lab prototype is already built in this stack, and because the AI/LLM tooling ecosystem (streaming SDKs, RAG examples, embedding libraries) overwhelmingly targets React/Next.js rather than alternatives like Angular. Rooms as static panels (image or CSS pixel art) with a door-open/closed state — no physics or movement engine for V1.
- **LLM:** Groq, reusing the existing streaming route.
- **Retrieval:** Supabase `pgvector` for the Archive level's log search.
- **Logging:** every attempt (prompt + outcome) saved per level, both to power a "you are not alone" leaderboard of exploit attempts and to self-evaluate which defenses actually hold.

---


## 8. Scope

### V1 (playable core)

[[LEVEL 1 — Cargo Bay (CARGO-9)]]

### V2

- Level 5 (RAG / Archive)
- Level 6 (indirect injection via content)
- Basic evaluation harness (automated attack-prompt test suite per level)

### V3

- Level 7 (judge-model pattern)
- Level 8 (combined final level)
- Public leaderboard / shareable link
- Write-up page explaining each OWASP category with this game as the example

### Explicitly out of scope for now

- Real 2D movement/animation/sprites — static room panels only
- User accounts / auth
- Mobile app

---

## 9. Success Criteria

- A stranger can open the link, play through Level 1–3 with no explanation, and come away able to state the core idea: *"the model's agreement is not the same as the system's enforcement."*
- For each shipped level, a short written note exists stating: the vulnerability class, why the exploit worked, and the fix (what the backend should have checked instead).
- The project is rebuildable from memory in an interview setting — every piece should be explainable without notes, since it was built level by level, not generated wholesale.

---

## 10. Why This Is Worth Building

LLM security is a genuinely growing specialization, not a novelty topic — as AI systems are given real capabilities (sending email, running code, accessing records), the cost of a broken trust boundary rises. Most portfolio projects demonstrate "I can call an LLM API." Fewer demonstrate "I can explain, with a working example, why a security boundary must live in code and not in a prompt." This project produces that, while its RAG and tool-calling levels also cover the core AI engineering skills needed regardless of specialization.