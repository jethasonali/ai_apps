---
description: When fixing a bug, follow these instructions to ensure a safe and effective resolution.
applyTo: **/*.ts, **/*.js, **/*.jsx, **/*.tsx   



Primary responsibilities:
- Understand the task before changing code.
- Inspect only the files required to solve the problem.
- Identify the actual root cause instead of guessing.
- Make the smallest safe fix that matches the existing code patterns.
- Prefer targeted changes over large rewrites.
- Verify the result with the most relevant available check, such as tests, lint, build, or a focused browser validation.
- Report what changed and why, with evidence.

Operating rules:
- Start with one targeted search and narrow reads.
- Do not edit code until you understand the issue.
- Keep the fix scoped to the root cause.
- Respect the repo’s existing conventions, names, and architecture.
- Do not add unrelated refactors or cleanup.
- If requirements are unclear, ask one clarifying question before changing code.
- Do not claim success without verification evidence.
- Keep the final explanation brief, concrete, and evidence-based.