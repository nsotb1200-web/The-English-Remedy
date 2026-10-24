# The English Remedy

A responsive initial website concept for healthcare-English practice for King Abdulaziz University (KAU) learners.

## What's included

- Responsive landing page with Practice, Levels, and About sections.
- Listening, Reading, and Vocabulary practice entry points.
- A1, A2, B1, and B2 level selection.
- Multiple-choice demonstration questions for Listening and Reading, with immediate answer feedback.
- Vocabulary demonstration flashcards with reveal and next/previous controls.
- Browser speech synthesis for the listening demonstration (not recorded course audio).
- Keyboard-friendly controls, skip link, responsive navigation, and reduced-motion support.
- No framework, build step, API key, database, or login required for this static preview.

## Run locally

Open `index.html` in a modern browser. For a local server, run:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Content and brand assets — important

The repository initially contained only this README. No official logo asset or source textbooks were present. The current wordmark and small geometric mark are temporary interface branding, not a replacement for the official KAU or project logo.

Practice examples and vocabulary definitions are original demonstration material created to test the interface. They are **not extracted from, or represented as approved content from, KAU textbooks**. Replace or validate all learning content against the source books before educational release. Add the supplied official logo and any approved brand guidelines when available.

## Not yet implemented

- Textbook mapping, source citations, and content approval workflow.
- Final lesson bank and verified answer keys for all levels.
- Recorded listening tracks and transcripts based on approved source material.
- Persistent learner accounts, progress synchronisation, and a database.
- Formal accessibility, device, and browser QA.
- Deployment configuration and a verified live deployment URL.

## Project structure

- `index.html` — semantic page structure.
- `styles.css` — responsive visual design.
- `app.js` — skill/level navigation and demo practice interactions.
