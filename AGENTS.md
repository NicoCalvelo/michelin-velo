<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Use project components and utilities when possible
**Don't reinvent the wheel. Leverage existing code.**
- If a component or utility function exists that meets the need, use it instead of creating a new one.
- Base components in '@/_base' are designed to be reusable across the project : 
    - Buttons : ElevatedButton, OutlinedButton, TextButton, FloatingActionButton, IconButton, OutlinedIconButton
    - Cards : ElevatedCard, OutlinedCard, FilledCard, StatCard
    - Components : Avatar, Disclosure, Dropdown, HelpTooltip, SearchBar, Selectable, Sheet, Spinner, Toasts
    - Dialogs : AskForInputModal, ConfirmationModal, ImportFileModal, SaveBeforeLeavingModal
    - Forms : Checkbox, DropableZone, Form, FormInput, FormSelect, FormTextArea, RadioGroup, SearchSelect, Select, Switch
    - Layout : Columns, Grids, Rows
    - Navigation : TabsPanel
    - Popovers : FiltersPopover, Popover
    - Tables : DataTable
- App components in 'src/app/_components' are also reusable within the app directory. Check there before creating new components (list not exhaustive) :
    - Images : ImageFallback, ImagesGallery, ImagesSEOFallback
    - Navigation : GoBackButton
    - Share : ShareButton
    - User : UserProfileLink
<!-- END:nextjs-agent-rules -->
