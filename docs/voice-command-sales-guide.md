# Voice Command Integration for Sales Creation

## 1. Current Code Analysis

### 1.1 Data Fetching and Page Composition
- `app/sales/new/page.tsx` fetches up to 1,000 products via `fetchProducts` and all clients via `fetchClients`, maps them to lightweight option objects, and renders `<SaleForm />` with those arrays.
- Navigation breadcrumbs and the main layout are rendered directly in this page component; the form logic is entirely encapsulated inside `SaleForm`.

### 1.2 Sale Form Client Component (`components/sales/sale-form.tsx`)
- Runs on the client (`"use client"`) and is responsible for the entire interaction flow.
- Local state is held for `selectedProduct`, `selectedClient`, `quantity`, `pricePlan`, and `unitPrice`. Derived data such as `totalAmount` and `selectedProductData` are computed from those state values.
- Side effects:
  - `useEffect` syncs initial `sale` props into the component state when editing.
  - A second `useEffect` updates the `unitPrice` whenever the product or pricing plan changes, using a mapping between price plan keys and Supabase product fields.
- Form submission builds a `FormData` instance, injects the controlled values, and invokes the server actions `createSale` or `updateSale`. These server actions perform schema validation, write to Supabase, deduct stock FIFO, and redirect back to `/sales`.
- Error handling currently expects field errors but renders empty arrays; voice-related validation will need to integrate with this pattern.

### 1.3 Supporting Server Actions (`app/sales/actions.ts`)
- Strong validation using Zod schemas for sale creation and updates.
- `createSale` checks authentication, inserts the sale, deducts inventory (FIFO across lots), and redirects.
- `updateSale` restores previous inventory, updates the sale, deducts the new quantities, and revalidates relevant paths.
- Any pre-submit confirmation must happen **before** these server actions are triggered because submission immediately redirects when successful.

### 1.4 UI Components
- Uses Shadcn UI primitives (`Select`, `Input`, `Button`) which expose accessible DOM nodes (`<button>`, `<select>`-like popovers). Voice interactions will need to programmatically focus or set state rather than manipulating DOM elements directly.

## 2. Adding Voice Commands with V0
`v0` (https://v0.dev/) can generate React hooks/components with speech recognition. To integrate with the existing form:

1. **Prompt v0 with Context**
   - Provide the file excerpts above, emphasizing controlled state setters (`setSelectedProduct`, etc.).
   - Ask v0 to scaffold a custom hook (e.g., `useSaleVoiceCommands`) that wraps the Web Speech API and emits high-level intents such as `selectProduct`, `selectPricePlan`, `setQuantity`, and `confirmSubmission`.

2. **Voice Recognition Hook Requirements**
   - Start/stop microphone capture.
   - Parse commands like:
     - "Select product [name]" → fuzzy match product list (e.g., using `string-similarity` or custom Levenshtein matching) and call `setSelectedProduct`.
     - "Use wholesale price" / "detail one" etc. → call `setPricePlan`.
     - "Quantity [number]" → update `setQuantity`.
     - "Set price to [amount]" → update `setUnitPrice` while respecting validation.
     - "Review" → speak back the current selection using `speechSynthesis` for confirmation.
     - "Confirm sale" → trigger a provided callback (`handleSubmit` or `formRef.submit()`).
   - Manage edge cases: command not recognized, product not found, microphone denied.

3. **Generated Output from v0**
   - Expect v0 to produce a hook or component skeleton; review for correctness, especially around browser-only APIs (`window`, `SpeechRecognition`). Ensure code guards for SSR (`typeof window !== "undefined"`).
   - Paste the generated hook into a new client file, e.g., `components/sales/use-sale-voice-commands.ts`.
   - Integrate it inside `SaleForm` by passing state setters to the hook.

4. **UI Affordances**
   - Add a toggle button ("🎤 Start Voice Control") that calls `startListening`/`stopListening` from the hook and displays current transcription.
   - Surface errors through existing helper (e.g., `renderErrors`) or a new alert.

5. **Pre-Submission Validation**
   - Before calling the server action, have the hook set a `pendingConfirmation` flag. When the user says "Confirm sale" or clicks a button after the voice summary, call the existing `handleSubmit`.

## 3. Integrating OpenAI Connectors and MCP Servers
OpenAI Connectors and Model Context Protocol (MCP) servers give you a clean way to call external tools—such as Supabase RPCs or custom pricing services—from an LLM-driven workflow. Layer them into the voice experience like this:

1. **Choose the Connector Targets**
   - Expose product search and price retrieval as MCP tools. A thin MCP server can live beside your Next.js app (e.g., `scripts/mcp/sales-tools.ts`) and invoke existing server actions or database queries via REST/RPC.
   - Register that MCP server with an OpenAI Connector (see [OpenAI documentation](https://platform.openai.com/docs/assistants/tools/connectors)) so the Assistant can call `find_product`, `get_price_plan`, or `create_sale_preview` tools.

2. **Voice Hook → Assistant Workflow**
   - When the client-side hook detects an intent that needs structured data ("select intelligent match product"), send the transcribed text to an Assistant session associated with your Connector.
   - The Assistant uses the MCP tools to fuzzy-match the product and compute the proposed sell price. Return the normalized payload to the browser via a lightweight API route (e.g., `app/api/voice-intents/route.ts`).

3. **Validation and Confirmation**
   - The API route should map the Assistant response to your form state (`productId`, `pricePlan`, `unitPrice`). If the Assistant returns multiple matches, surface them in the confirmation dialog for manual selection.
   - Gate the final `createSale` action behind a second Assistant call that validates stock/price by invoking `create_sale_preview`. On success, prompt the user for the final "Confirm" voice command.

4. **Operational Considerations**
   - Cache Connector responses for a short window to avoid repeated fuzzy searches when the same command is repeated.
   - Log MCP requests/responses for auditing, but strip microphone transcripts of PII before storage.
   - Make sure the Connector is scoped with least privilege—read-only access for selection steps, write access only for the confirmation call.

> **Tip:** During local development without Connector access, provide a fallback path where the hook uses the in-memory product list directly, so the UI keeps working.

## 4. Implementing Directly in VS Code
When coding manually:

1. **Create the Voice Hook Manually**
   - Add a new file `components/sales/use-sale-voice-commands.ts` with:
     - Feature-detected access to `window.SpeechRecognition || webkitSpeechRecognition`.
     - Internal state for `isListening`, `transcript`, and `error`.
     - Command parsing using regex/keyword maps.
     - Functions `startListening`, `stopListening`, and `processCommand` that call callbacks supplied via hook props.

2. **Enhance `SaleForm`**
   - Import the hook and call it with setters:
     \`\`\`tsx
     const voice = useSaleVoiceCommands({
       products,
       onSelectProduct: setSelectedProduct,
       onSelectPricePlan: setPricePlan,
       onQuantity: setQuantity,
       onUnitPrice: setUnitPrice,
       onRequestSubmit: () => setIsVoiceConfirmOpen(true),
     })
     \`\`\`
   - Provide UI controls bound to `voice.startListening`, `voice.stopListening`, and show `voice.transcript`/`voice.feedback`.

3. **Add a Confirmation Modal**
   - Introduce a `Dialog` from Shadcn UI that displays the chosen product, quantity, plan, and total. The voice hook can open this dialog (`setIsVoiceConfirmOpen(true)`) when the user says "Review".
   - Only call `handleSubmit` when the user confirms (voice command "Confirm" or pressing the dialog button). Ensure the form `onSubmit` handles both manual and voice flows by gating the `createSale` call behind a check (e.g., require `isConfirmationAccepted` state).

4. **Testing Strategy**
   - Test in Chrome (best Web Speech API support).
   - Validate fallback: if `SpeechRecognition` is unavailable, display guidance and keep manual form fully functional.
   - Unit-test command parsing by exporting pure helper functions for fuzzy matching and using Vitest/Jest (if added) to cover phrase variations.

5. **Deployment Considerations**
   - Voice features require HTTPS in production (microphone permissions).
   - Provide localization for French commands if primary UI language is French.
   - Update documentation (`README` or user guide) to mention microphone requirements and supported voice phrases.

## 5. Summary Checklist
- [ ] Extract voice intent handling into a dedicated hook/component.
- [ ] Fuzzy-match product names when parsing speech.
- [ ] Introduce a confirmation dialog driven by voice and manual controls.
- [ ] Block server action submission until confirmation is explicit.
- [ ] Document voice commands and browser compatibility.

## 6. Role-Based Visibility Considerations
The current navigation is filtered by role permissions before it renders the voice assistant entry. In `components/layout/sidebar.tsx`, the sidebar loads the active profile, looks up the allowed `modules`, and only keeps items whose `module` key is present in that list. The voice assistant link (`/dashboard/voice-sales`) is tagged with the `sales` module, so any role that lacks `"sales"` in `ROLE_PERMISSIONS` never sees the feature.

Key files:

- `components/layout/sidebar.tsx` – filters `ALL_NAVIGATION_ITEMS` using the module list returned from the profile.
- `lib/auth/rbac.ts` – defines `ROLE_PERMISSIONS` for each role, including which modules appear in navigation.

To make the voice command universally visible you have a few options:

1. **Add a dedicated module flag**
   - Introduce a new module identifier (e.g., `"voice_assistant"`) on the sidebar item instead of reusing `"sales"`.
   - Append that module to every role in `ROLE_PERMISSIONS`. Because the filtering step just checks membership, once every role includes the new flag, the item appears for everyone while keeping existing sales permissions intact.

2. **Bypass filtering for the voice entry**
   - Update the sidebar filter to always include the voice assistant item regardless of role (e.g., `if (item.href === "/dashboard/voice-sales") return true;`). This keeps the rest of the RBAC logic unchanged, but you should still enforce authorization inside the page if certain roles must be blocked from creating sales.

3. **Broaden module access in RBAC**
   - If it is acceptable for more roles to see the wider sales module, extend each role's `modules` array in `ROLE_PERMISSIONS` to include `"sales"`. This has the side-effect of exposing all sales navigation entries, so it is only appropriate if the entire sales area should be visible.

Regardless of the approach, keep server-side guards in place. Even if the link is visible, `app/dashboard/voice-sales/page.tsx` (and any API routes it calls) should verify that the user is allowed to finalize or submit sales so that voice navigation does not bypass business rules.

## 7. Step-by-Step Implementation Plan

Follow the checklist below sequentially when you (or Vercel v0) implement the voice workflow. Each step references earlier sections so you can cross-check intent details.

1. **Preparation**
   1. Open `docs/voice-command-sales-guide.md` and `docs/vercel-v0-voice-prompt.md` side by side. Skim Sections 2, 4, 5, and 6 to internalize the desired hook API, confirmation dialog behavior, and RBAC updates.
   2. In VS Code, create a new feature branch and run `pnpm dev` to ensure the project starts cleanly before editing files. This lets you regression-test the existing sale form quickly.

2. **Scaffold the Voice Hook (`components/sales/use-sale-voice-commands.ts`)**
   1. Add the new client file with `"use client"` at the top.
   2. Feature-detect `window.SpeechRecognition` / `webkitSpeechRecognition`. If unsupported, expose `isSupported = false` and return inert handlers so the form remains usable without voice.
   3. Define `VoiceHookProps` exactly as described in Section 2 and initialize hook state for `isListening`, `transcript`, `statusMessage`, `error`, and `pendingConfirmation`.
   4. Implement `startListening`/`stopListening` to guard against double-starts or `AbortError` exceptions.
   5. Inside the speech recognizer's `onresult`, normalize text and dispatch intents: product selection, price plan, quantity, unit price, review, and confirm. Reuse helpers like `fuzzyFindProduct` to keep matching readable.
   6. When the user says "review", set `pendingConfirmation = true`, call `onRequestSubmit()`, and provide a `statusMessage` prompting the confirmation step.
   7. When the user says "confirm" while `pendingConfirmation` is `true`, invoke the `handleConfirm` callback provided by `SaleForm`, clear `pendingConfirmation`, and reset the transcript/status.

3. **Integrate the Hook in `components/sales/sale-form.tsx`**
   1. Instantiate the hook, passing state setters (`setSelectedProduct`, `setPricePlan`, `setQuantity`, `setUnitPrice`) plus a `handleConfirm` that calls the existing `handleSubmit`.
   2. Add UI controls: a toggle button tied to `voice.isListening`, a transcript preview, and subtle status/error text without disrupting existing layout.
   3. Hide voice-only UI when `voice.isSupported` is `false`, and show helper text encouraging manual entry instead.
   4. Insert a Shadcn `Dialog` that opens whenever `voice.pendingConfirmation` is `true`. Display the selected product, quantity, price plan, and computed total inside the dialog.
   5. Wire "Confirm" to the hook's `handleConfirm` callback and "Cancel" to reset voice state, close the dialog, and stop listening.

4. **Preserve Manual Submission**
   1. Ensure the existing form `onSubmit` still runs when the manual submit button is clicked.
   2. Keep new voice-only state defaulted so manual submissions remain unaffected (e.g., `pendingConfirmation` should start as `false`).

5. **Expose Voice Navigation to All Roles**
   1. Update `components/layout/sidebar.tsx` so the voice assistant nav item uses a dedicated module key like `"voice_assistant"`.
   2. Append `"voice_assistant"` to every role's `modules` list in `lib/auth/rbac.ts`.
   3. Leave server-side authorization guards intact to prevent unauthorized sale creation.

6. **Testing & QA**
   1. Run `pnpm lint` (and `pnpm test` if available) to catch regressions.
   2. Exercise the voice flow in Chrome: select product, set pricing plan, quantity, review, confirm, and cancel.
   3. Switch between user profiles to verify the voice assistant navigation link is visible for every role while permissions remain enforced on the backend.

7. **Documentation & Hand-off**
   1. Update user-facing docs (`USER_MANUAL.md`, release notes) with supported voice phrases and browser requirements.
   2. Summarize the implementation in your commit/PR message and reference this guide for future maintainers.

By working through the ordered steps above you reduce the chance of regressions while ensuring the voice feature respects existing RBAC and sales flows.

## 8. Getting the Changes Live

Once you finish implementing or adjusting the voice feature locally, nothing is automatically deployed. Follow the steps below so your team (or Vercel v0) understands how the updates reach production:

1. **Commit and Push to GitHub**
   - `git status` should show the modified files. Stage them with `git add`, commit with a descriptive message, and push the branch to your GitHub remote (`git push origin <branch>`). Until this push happens, nobody else—including Vercel—can see the new voice assistant changes.
   - **Prefer the Git CLI or Desktop:** These workflows make it explicit which files you are publishing and avoid accidental overwrites.
   - **If you are in the Vercel v0 diff view (screenshot you shared):** the **Create PR** button opens a GitHub dialog that commits the generated branch to your repo. Use it only after downloading/testing the patch locally or verifying that the diff contains exactly what you want, because it writes straight to GitHub.
   - **If you edit directly on GitHub.com:** you still need to commit the file changes in the web editor and either merge them into your main branch or open a PR. The push happens the moment you press "Commit changes".

2. **Open a Pull Request**
   - Create a PR on GitHub so teammates can review the diff. Link this guide in the PR description if reviewers need the background.

3. **Trigger Vercel (or V0) Deployments**
   - Vercel watches your GitHub repo. Once you push or merge to the branch that Vercel tracks (often `main` or `production`), it automatically builds and deploys the site. Vercel v0 does not deploy by itself—you still need the GitHub push/merge to kick off the pipeline.

4. **Manual V0 Runs**
   - If you are asking Vercel v0 to apply additional edits, supply the latest `voice-command-sales-guide.md` and the prompt from `docs/vercel-v0-voice-prompt.md`. After v0 returns a diff, pull the generated branch or patch into your local repo, test, commit, and push again.

5. **Database and Policy Visibility**
   - To inspect Supabase policies or table structure, connect with the Supabase dashboard or your existing MCP tooling; no additional Vercel action is needed. Voice UI visibility is controlled by the RBAC module configuration already documented above.

By keeping the push → PR → deploy cycle explicit, you avoid surprises where local work never reaches GitHub or production.

## 9. Using OpenAI Agents to Drive the Flow

If you are experimenting with the Assistant builder shown in your screenshot (a custom GPT on chat.openai.com) and want it to orchestrate the same confirmation-centric workflow, the behavior is achievable by wiring the Assistant to the MCP tools described in Section 3 and exposing a narrow set of actions:

1. **Define Structured Tools** – Reuse the MCP server you already prototyped for product lookups and price proposals. Add explicit tool schemas such as `find_product_by_voice(query: string)`, `suggest_price(product_id: string)`, and `prepare_sale(payload: {...})`. Because Connectors surface these tools directly to the Assistant, the agent can call them deterministically instead of hallucinating UI actions.

2. **Restrict the Action Surface** – In the Assistant configuration, document that the agent must only respond with JSON payloads matching your API route contract (e.g., `POST /api/voice-intents`). The front-end voice hook then interprets the payload, updates React state, and asks the user for spoken confirmation before submitting. This keeps all mutation authority inside your Next.js app while still letting the agent perform intelligent matching.

3. **Enforce Confirmation** – Configure the Assistant instructions to never call a "finalize sale" tool unless the client explicitly provides a confirmation flag. Your existing hook can send `confirm: false` on the first pass so the agent replies with a human-readable summary ("Produit: Batterie AGM, Prix: 85 000 FCFA, Quantité: 3. Confirmez-vous ?"). Only after the user says "oui"/"confirm" should the hook resend the payload with `confirm: true`, which triggers the server action that ultimately calls `createSale`.

4. **Blend UI and Agent Responses** – Even when the agent is involved, keep the UI authoritative. For example, if the Assistant cannot find a precise match, return `status: "needs_disambiguation"` along with the top candidates. Render those options in the confirmation dialog so the user can pick manually instead of letting the agent guess.

By structuring the agent this way, you can leverage OpenAI's hosted Assistants (or any compliant MCP client) without giving it unchecked control over the sales pipeline, and the same voice hook continues to operate with or without the agent connection.
