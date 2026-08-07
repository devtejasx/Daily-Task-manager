# Discipline Quest — Project Vision

> The document every change in this repository is measured against.
> If a proposed feature does not survive the test on this page, it does not ship.

---

## Core vision

This is **not** a task manager. It is a **Discipline RPG**.

The application uses game design to help people build long-term discipline through
consistent completion of real-life tasks. The purpose is not to organise work — it
is to make people **want** to do the work.

- Every completed mission should make the hunter feel stronger.
- Every session should reinforce consistency.
- Discipline itself is the progression system.

## The problem

Most productivity apps only organise tasks. People already know what they should
do; their real challenge is staying motivated and consistent. Traditional task
managers reward organisation. **This one rewards discipline.**

## The translation

| Real life | In the world |
| --- | --- |
| The person | Hunter |
| A task | Mission / Quest |
| Progress | Levels |
| Consistency | Power |
| Achievements | Titles |

## Philosophy

**Always encourage. Never punish. Never shame. Never induce guilt.**

Missing a day must feel like *"You can recover"* — never *"You failed."*
The app rewards **consistency, not perfection**. It is a mentor, not a strict teacher.
The narrative must never imply the user is lazy.

This is not a tone preference; it is a hard constraint. The word "failed" does not
appear in the product.

### The permanence guarantee

Nothing the hunter earns can ever be taken away — not XP, not levels, not
achievements, not a personal best. Only the *current* streak is ever at stake, and
the Resolve system gives it two chances before it settles. See
[the Resolve system](README.md#the-resolve-system).

## Emotional targets

| Moment | Feeling |
| --- | --- |
| Opening the app | Curiosity, excitement, motivation, hope |
| Creating a mission | Purpose, control, commitment |
| Completing a mission | Satisfaction, reward, progress, momentum |
| Levelling up | Pride, achievement, excitement |
| Returning after a missed day | Encouragement — never guilt |
| Returning tomorrow | Anticipation |

## Design principles

Everything must answer one question:

> **"Does this make discipline feel rewarding?"**

If not, do not implement it. Never add a feature merely because other productivity
apps have it.

- Every interaction provides feedback.
- Every accomplishment feels rewarding.
- Progress is always visible — the hunter must never wonder *"Am I getting stronger?"*
- Dramatic effects are reserved for meaningful moments. Celebration everywhere is
  celebration nowhere.
- Never show a blank screen. Every empty state invites the next action.

## Success criteria for a feature

A feature ships only if it satisfies at least one:

- Makes completing tasks more enjoyable
- Encourages the hunter to return tomorrow
- Rewards consistency
- Makes progression feel meaningful
- Strengthens the RPG experience
- Makes the hunter feel stronger

## Success criteria for the product

A first-time visitor understands the product in **under 30 seconds** — without
documentation, without a tutorial, without opening GitHub — and thinks:

> *"I want to become stronger."*

## What this product is not

Not a generic task manager. Not a note-taking app. Not project management. Not team
collaboration. Not a document editor. Not a calendar replacement. Not a chat app.
Not an AI chatbot.

## Audience

Students, software engineers, developers, gamers, anime fans, professionals, and
anyone building better habits — especially people who enjoy RPG progression.

## Theme

Inspired by the *feeling* of Solo Leveling: becoming stronger through daily effort.
It is **not** a clone and must stand on its own.

## Engineering principles

- Never rewrite working code without reason; prefer extending existing systems.
- Keep the architecture modular, reuse components, avoid duplication.
- Maintain backward compatibility. Protect user data — migrations never destroy.
- Keep animations smooth, performance high, accessibility in mind.

## The test, before any change

1. Does this align with the product vision?
2. Does it improve the hunter's journey toward becoming more disciplined?
3. Does it strengthen the RPG progression?

If any answer is no, choose a better solution.

> You are not building software. You are building an experience.
