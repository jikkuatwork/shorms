# Plan: "Shorms" (Shadcn Forms) Transformation

**Goal:** Transform the existing `shadcn-ui-form-builder` into "Shorms" — a robust, SurveyJS-alternative form engine with multi-page support, JSON serialization, and advanced validation.

**Current State:**
- Single page linear list of fields.
- Basic Zod validation (hardcoded per type).
- Zustand store holding a flat `FormField[]`.
- No Import/Export capabilities.

**Target State:**
- **Brand:** "Shorms"
- **Data Model:** Recursive/Paginated JSON structure.
- **Engine:** Standalone `<FormRunner />` component.
- **Features:** JSON Import/Export, Regex Validation, Pagination.

---

## Phase 1: Rebranding & Cleanup
**Objective:** Establish the new identity and clean up the UI.

1.  **Update Metadata & Config:**
    - [ ] Modify `app/layout.tsx`: Change title to "Shorms Builder".
    - [ ] Modify `app/page.tsx`: Update header texts and links.
    - [ ] Update `package.json`: Rename name to `shorms`.

2.  **UI Polish:**
    - [ ] Modify `components/sidebar-left.tsx`: Update Logo text to "Shorms".
    - [ ] Modify `components/logo.tsx`: (Optional) Update SVG if a new logo is desired, otherwise keep generic.

---

## Phase 2: Data Model Refactor (Pagination Support)
**Objective:** Move from a flat list of fields to a paginated structure. This is the most critical architectural change.

1.  **Define New Types (`types/form-store.ts`, `types/field.ts`):**
    - [ ] Create `interface FormPage { id: string; title?: string; fields: FormField[] }`.
    - [ ] Update `FormState` in `types/form-store.ts`:
        - Change `formFields: FormField[]` to `pages: FormPage[]`.
        - Add `activePageId: string`.

2.  **Update Store Logic (`stores/form.ts`):**
    - [ ] Refactor `addFormField`: Push to `pages.find(p => p.id === activePageId).fields`.
    - [ ] Refactor `deleteFormField`, `updateFormField`: Locate field within the active page.
    - [ ] Add Actions: `addPage()`, `deletePage()`, `setActivePage(id)`.

3.  **Update Editor UI (`components/form-editor.tsx`):**
    - [ ] Add a **Page Tab Bar** above the form canvas to switch `activePageId`.
    - [ ] Update `SortableContext` to only render `pages[activePageId].fields`.
    - [ ] *Note:* Drag-and-drop will now be scoped to the *current active page*.

---

## Phase 3: Advanced Validation Engine
**Objective:** Allow users to define custom validation rules (Regex, Custom Error Messages) that get serialized to JSON.

1.  **Extend Field Schema (`types/field.ts`):**
    - [ ] Add `validation` object to `FormField`:
        ```typescript
        validation?: {
          required?: boolean;
          min?: number;
          max?: number;
          regex?: string; // Pattern for text inputs
          errorMessage?: string; // Custom error message
        }
        ```

2.  **Update Editor Properties Panel (`components/render-edit-form-field-inputs.tsx`):**
    - [ ] Add "Validation" section.
    - [ ] Add inputs for `Regex Pattern` (for text/email/number) and `Custom Error Message`.
    - [ ] Add `Required` toggle (move `required` prop into this validation object if not already there).

3.  **Update Zod Generator (`lib/form-schema.ts`):**
    - [ ] Update `generateZodSchema` to read the new `validation` object.
    - [ ] Implement dynamic regex: `field.validation.regex ? z.string().regex(new RegExp(field.validation.regex), field.validation.errorMessage) : ...`

---

## Phase 4: JSON Import / Export
**Objective:** Enable saving and loading the form schema.

1.  **Create Schema Definition:**
    - The "Shorms JSON" format is essentially the `pages: FormPage[]` array from the store.

2.  **Build Action Components (`components/header-actions.tsx`):**
    - [ ] **Export:** Create a button that:
        - Grabs `useFormStore.getState().pages`.
        - Triggers a download of `shorms-schema.json`.
    - [ ] **Import:** Create a file input or text area dialog that:
        - Parses JSON.
        - Validates it (basic check).
        - Calls `useFormStore.getState().setPages(data)`.

3.  **Integrate into Header (`app/page.tsx`):**
    - [ ] Replace existing "Clear Form" or add next to it.

---

## Phase 5: The "Form Runner" (Previewer)
**Objective:** A standalone component that renders the form from JSON without the builder UI overhead.

1.  **Create `components/form-runner.tsx`:**
    - [ ] Props: `schema: FormPage[]`.
    - [ ] State: `currentPageIndex` (number).
    - [ ] Render Logic:
        - Generate Zod Schema for *all* pages (or per page if validating step-by-step).
        - Render `schema[currentPageIndex].fields`.
        - Add "Next" / "Previous" / "Submit" buttons based on `currentPageIndex`.

2.  **Preview Mode (`components/form-preview-dialog.tsx`):**
    - [ ] Create a Dialog/Modal that mounts `<FormRunner schema={store.pages} />`.
    - [ ] Add a "Preview" button in the main header.

---

## Phase 6: Integration & Output
**Objective:** Finalize the exportable artifact.

1.  **Update Code Generator (`lib/generate-form-code.ts`):**
    - [ ] Update the string generation to produce a React component that includes the *multi-page logic* (using React state for pages) if multiple pages exist.
    - [ ] Ensure the generated code includes the `zod` schema with the new regex validations.

## Execution Order
1. Phase 1 (Rebrand)
2. Phase 2 (Pagination - Core Architecture)
3. Phase 3 (Validation)
4. Phase 5 (Runner - Needed to test Pagination properly)
5. Phase 4 (Import/Export)
6. Phase 6 (Code Gen Update)