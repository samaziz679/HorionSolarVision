# Vercel v0 Prompt: Voice Command Integration Without Regressions

You are updating an existing Next.js 14 + TypeScript + Tailwind application that already has a working sales creation form. You must **preserve all existing functionality**. Apply the following instructions exactly and avoid deleting or rewriting unrelated logic.

## Context
1. Carefully review `docs/voice-command-sales-guide.md`. Follow the implementation guidance in Sections 2, 4, 5, 6, and the step-by-step plan in Section 7. The document describes the desired voice workflow, required hook API, confirmation flow, RBAC updates, and the exact execution order.
2. Do not modify server actions in `app/sales/actions.ts` except to add new imports that are strictly required. All pre-submit confirmation must remain on the client.
3. Do not touch `package.json`, `pnpm-lock.yaml`, or configuration files unless explicitly instructed.
4. Keep all TypeScript types intact. If you need new types, add them next to the code that uses them.

## Requirements
- Create a new client hook `components/sales/use-sale-voice-commands.ts` that:
  - Feature-detects `window.SpeechRecognition` / `webkitSpeechRecognition` and falls back gracefully with an `isSupported` flag.
  - Exposes state `{ isListening, transcript, statusMessage, error, pendingConfirmation }` and methods `{ startListening, stopListening, reset, handleConfirm }`.
  - Accepts props:
    \`\`\`ts
    type VoiceHookProps = {
      products: { id: string; name: string; sku?: string }[];
      onSelectProduct: (productId: string) => void;
      onSelectPricePlan: (plan: "retail" | "wholesale" | "intelligent_match") => void;
      onQuantity: (value: number) => void;
      onUnitPrice: (value: number) => void;
      onRequestSubmit: () => void;
    };
    \`\`\`
  - Implements fuzzy product matching (case-insensitive, tolerant of minor misspellings) and parses commands described in the guide (select product, set plan, set quantity, set price, review, confirm).
  - For the "review" intent, call `onRequestSubmit()` only after updating `pendingConfirmation = true`.
  - For the "confirm" intent, set `pendingConfirmation = false` and call `handleConfirm()` which must be provided by `SaleForm`.

- Update `components/sales/sale-form.tsx` to:
  - Import and use the new hook.
  - Provide UI controls: a button that toggles listening, live transcript text, and a message area for errors/status.
  - Add a confirmation dialog (Shadcn `Dialog`) that appears when `pendingConfirmation` is `true`. The dialog should summarize the selected product, quantity, price plan, and computed total. Include "Confirm" and "Cancel" buttons. "Confirm" triggers the existing `handleSubmit` via the hook's `handleConfirm` callback; "Cancel" resets `pendingConfirmation` and stops listening.
  - Ensure manual submission still works. Voice flows must call the same `handleSubmit` you already use.

- Ensure the voice assistant navigation entry is visible to all roles by adding a dedicated module key `"voice_assistant"`:
  - Update the sidebar navigation item for the voice assistant to use the new module key.
  - Add `"voice_assistant"` to every role in `lib/auth/rbac.ts`.
  - Keep server-side authorization checks unchanged.

- Update relevant CSS or UI files only if necessary for layout. Do not remove existing class names.
- Add concise inline comments only where new logic is non-obvious.
- Run `pnpm lint` locally before finalizing (if linting fails, explain why in your response).

## Output Expectations
Return the full diff for each file you modify. Do not collapse or omit code. Do not describe the changes—just show the patch. Ensure the code compiles.
