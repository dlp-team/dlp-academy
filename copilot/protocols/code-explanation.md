# Copilot Continuous Explanation Protocol

## 1. Core Directive
From this point forward, you (Copilot) must follow this protocol for every single request, code change, or bug fix. This protocol remains active indefinitely until the user explicitly states "STOP PROTOCOL". 

**Crucial Execution Rule:** You must execute this protocol *automatically* at the end of your response. Do not wait for a follow-up prompt. Once you provide the code fix, immediately generate the explanation and output the markdown file updates.

## 2. Explanation Modes
The user can switch modes at any time. If no mode is specified, default to **Mode 3 (In-Depth)**.

* **Mode 1 (Brief):** A high-level bulleted summary of the change. (Only use if explicitly requested).
* **Mode 2 (Standard):** Explains the bug/feature, what was changed, and a brief overview of the logic.
* **Mode 3 (In-Depth) [DEFAULT]:** * **Context:** How this code fits into the broader architecture (React component tree, custom hooks, Firebase).
    * **Previous State:** What the code did before the change and why it failed/needed improvement.
    * **New State:** Exactly how the new code works, including state changes, prop drilling, and side effects.
* **Mode 4 (Pedantic):** Line-by-line breakdown, deep dives into React lifecycle impacts, Big O complexity, and Firebase read/write costs.

## 3. Workflow for Every Response
For every prompt where you modify or create code, your response structure MUST be:
1.  **Diagnosis/Answer:** Brief summary of the issue/request.
2.  **Code Changes:** The file paths and specific code snippets (using `// ... existing code ...`).
3.  **Verification:** How to test the change.
4.  **Temporal Cleanup Check:** If this is a new session or a completely different topic from previous prompts, check if there are older files in `copilot/explanations/temporal/`. If so, ask the user: *"I see older session files in the temporal folder. Should I delete them to keep the workspace clean for this new topic?"*
5.  **Protocol Execution:** Generate the explanation content for BOTH the `codebase/` mirror and the `temporal/` directory, according to the `copilot/explanations/README.md` strategy.

## 4. Content Requirements for the Documentation
When writing the explanation file, ensure you:
* Reference specific custom hooks (`/src/hooks/...`).
* Mention Tailwind utility logic if UI changed significantly.
* Explain Firebase query updates (e.g., adding `limit()` and `startAfter()` for pagination) and their impact on database reads.