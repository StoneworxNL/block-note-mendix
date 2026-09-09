import { createElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ActionValue, EditableValue } from "mendix";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteWrapper } from "../BlockNoteWrapper";

// The real editor cannot be loaded here: the CommonJS bundle of @blocknote/core
// expects a default export from @tiptap/core, which Tiptap 3 does not provide,
// so requiring it under jest throws before any test runs. Standing it up would
// mean experimental ESM mode - a fragile foundation for `npm test`.
//
// Mocking at the module boundary is also what these tests actually want. The
// subject is the save-echo vs external-reload state machine, and a stub editor
// makes "did it remount?" directly observable as the identity of the instance
// handed to BlockNoteView.
jest.mock("@blocknote/core", () => {
    let nextEditorId = 0;

    // Mirrors the two shapes BlockNoteEditor.create is known to reject, which is
    // how documents written by the pre-fix save path fail to reopen. This
    // reproduces the rule rather than re-running BlockNote's validator, so what
    // it pins is the wrapper's handling of a rejected document, not BlockNote.
    const rejectLikeBlockNote = (blocks: any[]): void => {
        for (const block of blocks) {
            if (Array.isArray(block?.content)) {
                for (const inline of block.content) {
                    if (inline?.type === "link" && !(inline.content?.length > 0)) {
                        throw new Error("A link node must have content");
                    }
                }
            }

            if (block?.type === "table" && !(block.content?.rows?.length > 0)) {
                throw new Error("A table must have at least one row");
            }

            if (Array.isArray(block?.children)) {
                rejectLikeBlockNote(block.children);
            }
        }
    };

    return {
        BlockNoteEditor: {
            create: jest.fn(({ initialContent }: { initialContent: any[] }) => {
                rejectLikeBlockNote(initialContent);

                const subscribers = new Set<() => void>();

                return {
                    id: ++nextEditorId,
                    document: initialContent,
                    onChange(callback: () => void) {
                        subscribers.add(callback);
                        return () => subscribers.delete(callback);
                    },
                    // Stands in for the user typing: swaps in a new document and
                    // notifies, as the real editor does on every edit.
                    edit(document: any[]) {
                        this.document = document;
                        subscribers.forEach(callback => callback());
                    }
                };
            })
        }
    };
});

jest.mock("@blocknote/mantine", () => ({
    BlockNoteView: ({ editor, editable, theme }: any) =>
        createElement("div", {
            "data-testid": "editor",
            // Remounting means a new instance, so this attribute changing is the
            // assertion that the open document was torn down.
            "data-editor-id": String(editor.id),
            "data-editable": String(editable),
            "data-theme": theme
        })
}));

const createEditor = BlockNoteEditor.create as unknown as jest.Mock;

const EMPTY_PARAGRAPH = {
    type: "paragraph",
    props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
    content: [],
    children: []
};

const documentOf = (text: string): any[] => [{ ...EMPTY_PARAGRAPH, content: [{ type: "text", text, styles: {} }] }];

const storedJson = (text: string): string => JSON.stringify(documentOf(text), null, 2);

// Mendix hands the widget a fresh props object on every update - that identity
// change is what re-runs the load effect - so each call here builds a new one.
const attribute = (value: string | undefined, overrides: Partial<EditableValue<string>> = {}): EditableValue<string> =>
    ({
        value,
        displayValue: value ?? "",
        status: "available",
        readOnly: false,
        validation: undefined,
        setValue: jest.fn(),
        setTextValue: jest.fn(),
        setValidator: jest.fn(),
        ...overrides
    } as unknown as EditableValue<string>);

const action = (overrides: Partial<ActionValue> = {}): ActionValue =>
    ({ canExecute: true, isExecuting: false, execute: jest.fn(), ...overrides } as unknown as ActionValue);

const setValueOf = (attr: EditableValue<string>): jest.Mock => attr.setValue as unknown as jest.Mock;
const executeOf = (value: ActionValue): jest.Mock => value.execute as unknown as jest.Mock;

const editorId = (): string | null => screen.getByTestId("editor").getAttribute("data-editor-id");

// The instance the wrapper is currently holding, so a test can drive an edit
// through the same object the component subscribed to.
const currentEditor = (): any => createEditor.mock.results[createEditor.mock.results.length - 1].value;

const type = (text: string): void => {
    act(() => currentEditor().edit(documentOf(text)));
};

const saveButton = (): HTMLElement => screen.getByRole("button", { name: "Save" });

describe("BlockNoteWrapper", () => {
    let consoleError: jest.SpyInstance;

    beforeEach(() => {
        // The wrapper logs on every refusal to load; keep the run readable and
        // let the tests assert on it where it is part of the contract.
        consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => consoleError.mockRestore());

    const renderWrapper = (
        jsonPayload: EditableValue<string>,
        props: Record<string, unknown> = {}
    ): ReturnType<typeof render> & { update: (next: EditableValue<string>) => void } => {
        const view = render(<BlockNoteWrapper jsonPayload={jsonPayload} isEditable themeEnum="light" {...props} />);

        return {
            ...view,
            // Stands in for a Mendix update: a new attribute object arrives and
            // the widget re-renders with it.
            update: (next: EditableValue<string>) =>
                view.rerender(<BlockNoteWrapper jsonPayload={next} isEditable themeEnum="light" {...props} />)
        };
    };

    describe("saving", () => {
        it("writes the edited document to the attribute and runs the save action", () => {
            const payload = attribute(storedJson("stored"));
            const saveAction = action();
            renderWrapper(payload, { saveAction });

            type("edited");
            fireEvent.click(saveButton());

            expect(setValueOf(payload)).toHaveBeenCalledTimes(1);
            expect(setValueOf(payload)).toHaveBeenCalledWith(storedJson("edited"));
            expect(executeOf(saveAction)).toHaveBeenCalledTimes(1);
        });

        it("writes the attribute even with no save action configured", () => {
            const payload = attribute(storedJson("stored"));
            renderWrapper(payload);

            type("edited");
            fireEvent.click(saveButton());

            expect(setValueOf(payload)).toHaveBeenCalledWith(storedJson("edited"));
        });

        it("does not remount the editor when the save echoes back", () => {
            const payload = attribute(storedJson("stored"));
            const { update } = renderWrapper(payload);
            const before = editorId();

            type("edited");
            fireEvent.click(saveButton());

            // Mendix re-renders with a new attribute object carrying the value we
            // just wrote. Reloading on that echo would tear the document down
            // under the cursor.
            update(attribute(storedJson("edited")));

            expect(editorId()).toBe(before);
            expect(createEditor).toHaveBeenCalledTimes(1);
        });

        it("disables the button until there is something to save", () => {
            renderWrapper(attribute(storedJson("stored")));

            expect(saveButton()).toBeDisabled();

            type("edited");

            expect(saveButton()).toBeEnabled();

            fireEvent.click(saveButton());

            // Saved state is clean again, so the button stops offering a re-save.
            expect(saveButton()).toBeDisabled();
        });

        it("reports a save action that cannot run, and leaves the attribute alone", () => {
            const payload = attribute(storedJson("stored"));
            const saveAction = action({ canExecute: false });
            renderWrapper(payload, { saveAction });

            type("edited");
            fireEvent.click(saveButton());

            expect(setValueOf(payload)).not.toHaveBeenCalled();
            expect(executeOf(saveAction)).not.toHaveBeenCalled();
            expect(screen.getByRole("alert")).toHaveTextContent("cannot be run right now");
        });
    });

    describe("external changes", () => {
        it("remounts and reloads when the attribute changes underneath", () => {
            const { update } = renderWrapper(attribute(storedJson("first")));
            const before = editorId();

            update(attribute(storedJson("second")));

            expect(editorId()).not.toBe(before);
            expect(createEditor).toHaveBeenCalledTimes(2);
            expect(createEditor).toHaveBeenLastCalledWith({ initialContent: documentOf("second") });
        });

        it("drops unsaved edits and clears dirty when the dataview moves on", () => {
            const { update } = renderWrapper(attribute(storedJson("first")));

            type("unsaved");
            expect(saveButton()).toBeEnabled();

            // Switching to another object must not leave the previous document
            // dirty: the next Save would write it onto the new record.
            update(attribute(storedJson("second")));

            expect(saveButton()).toBeDisabled();
            expect(createEditor).toHaveBeenLastCalledWith({ initialContent: documentOf("second") });
        });

        it("ignores updates while the attribute is unavailable", () => {
            const { update } = renderWrapper(attribute(storedJson("first")));

            update(attribute(undefined, { status: "loading" } as Partial<EditableValue<string>>));

            expect(createEditor).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId("editor")).toBeInTheDocument();
        });
    });

    describe("read-only attributes", () => {
        it("never writes to a read-only attribute", () => {
            const payload = attribute(storedJson("stored"), { readOnly: true });
            renderWrapper(payload);

            // Mendix can mark the attribute read-only independently of the
            // widget's own Editable setting, so there is nothing to save.
            expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
            expect(setValueOf(payload)).not.toHaveBeenCalled();
            expect(screen.getByTestId("editor")).toHaveAttribute("data-editable", "false");
        });

        it("never writes when the widget itself is not editable", () => {
            const payload = attribute(storedJson("stored"));
            renderWrapper(payload, { isEditable: false });

            expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
            expect(setValueOf(payload)).not.toHaveBeenCalled();
            expect(screen.getByTestId("editor")).toHaveAttribute("data-editable", "false");
        });

        it("withdraws the toolbar when the attribute turns read-only mid-edit", () => {
            const payload = attribute(storedJson("stored"));
            const setValue = setValueOf(payload);
            const { update } = renderWrapper(payload);

            type("edited");

            // Same stored value, so no reload - only the read-only flag flips.
            update(attribute(storedJson("stored"), { readOnly: true, setValue }));

            expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
            expect(setValue).not.toHaveBeenCalled();
        });

        it("refuses to write when the attribute turned read-only after the toolbar rendered", () => {
            const payload = attribute(storedJson("stored"));
            renderWrapper(payload);

            type("edited");
            expect(saveButton()).toBeEnabled();

            // Mendix flips the flag on the object the widget is already holding.
            // Nothing has re-rendered yet, so the toolbar is still live and a
            // click can land - setValue on a read-only attribute would not stick.
            (payload as { readOnly: boolean }).readOnly = true;
            fireEvent.click(saveButton());

            expect(setValueOf(payload)).not.toHaveBeenCalled();
        });
    });

    describe("unreadable content", () => {
        const expectRefusedToLoad = (payload: EditableValue<string>): void => {
            expect(screen.getByRole("alert")).toHaveTextContent("could not be opened");
            expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
            // The stored value is the only copy left, so it has to survive.
            expect(setValueOf(payload)).not.toHaveBeenCalled();
        };

        it("refuses to load corrupt JSON", () => {
            const payload = attribute("{ not json at all");
            renderWrapper(payload);

            expectRefusedToLoad(payload);
            expect(createEditor).not.toHaveBeenCalled();
        });

        it("refuses to load JSON that is not an array of blocks", () => {
            const payload = attribute(JSON.stringify({ blocks: [] }));
            renderWrapper(payload);

            expectRefusedToLoad(payload);
            expect(createEditor).not.toHaveBeenCalled();
        });

        it("refuses to load a legacy document whose link has empty content", () => {
            const payload = attribute(
                JSON.stringify([
                    { ...EMPTY_PARAGRAPH, content: [{ type: "link", href: "https://example.com", content: [] }] }
                ])
            );
            renderWrapper(payload);

            // Written by the pre-fix save path: create() rejects it, and that
            // failure has to be caught rather than escaping into render.
            expect(createEditor).toHaveBeenCalledTimes(1);
            expectRefusedToLoad(payload);
        });

        it("refuses to load a legacy document whose table has no rows", () => {
            const payload = attribute(
                JSON.stringify([
                    { type: "table", props: {}, content: { type: "tableContent", rows: [] }, children: [] }
                ])
            );
            renderWrapper(payload);

            expect(createEditor).toHaveBeenCalledTimes(1);
            expectRefusedToLoad(payload);
        });

        it("recovers once the attribute holds a readable document again", () => {
            const { update } = renderWrapper(attribute("{ not json at all"));

            update(attribute(storedJson("repaired")));

            expect(screen.getByTestId("editor")).toBeInTheDocument();
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("empty attributes", () => {
        it.each([
            ["absent", undefined],
            ["empty", ""],
            // BlockNote rejects a genuinely empty array, and it holds no user
            // content anyway, so a fresh document loses nothing.
            ["an empty array", "[]"]
        ])("opens a fresh document when the attribute is %s", (_label, value) => {
            renderWrapper(attribute(value));

            expect(createEditor).toHaveBeenCalledWith({ initialContent: [EMPTY_PARAGRAPH] });
            expect(screen.getByTestId("editor")).toBeInTheDocument();
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });

        it("saves a first document onto a record that had none", () => {
            const payload = attribute(undefined);
            renderWrapper(payload);

            type("first ever");
            fireEvent.click(saveButton());

            expect(setValueOf(payload)).toHaveBeenCalledWith(storedJson("first ever"));
        });
    });

    describe("in-flight saves", () => {
        it("does not start a second run while the save action is already in flight", () => {
            const payload = attribute(storedJson("stored"));
            const saveAction = action();
            renderWrapper(payload, { saveAction });

            type("edited");
            expect(saveButton()).toBeEnabled();

            // Mendix flips isExecuting on the action the widget is already
            // holding as soon as the run starts. Nothing has re-rendered yet, so
            // the button is still live and a click landing in that window would
            // queue a second run on top of the first.
            (saveAction as { isExecuting: boolean }).isExecuting = true;
            fireEvent.click(saveButton());

            expect(executeOf(saveAction)).not.toHaveBeenCalled();
            expect(setValueOf(payload)).not.toHaveBeenCalled();
        });

        it("does not re-run a completed save on a second click", () => {
            const payload = attribute(storedJson("stored"));
            const saveAction = action();
            renderWrapper(payload, { saveAction });

            type("edited");
            fireEvent.click(saveButton());
            fireEvent.click(saveButton());

            expect(executeOf(saveAction)).toHaveBeenCalledTimes(1);
            expect(setValueOf(payload)).toHaveBeenCalledTimes(1);
        });

        it("disables the button while a save is in flight", () => {
            const saveAction = action({ isExecuting: true });
            renderWrapper(attribute(storedJson("stored")), { saveAction });

            type("edited");

            expect(saveButton()).toBeDisabled();
        });
    });

    describe("appearance", () => {
        it("applies the Studio Pro class, style and tab index to its root", () => {
            const { container } = renderWrapper(attribute(storedJson("stored")), {
                className: "from-studio-pro",
                style: { height: "400px" },
                tabIndex: 3
            });

            const root = container.firstElementChild as HTMLElement;

            expect(root).toHaveClass("blocknote-mendix-wrapper", "blocknote-mx-light", "from-studio-pro");
            expect(root).toHaveStyle({ height: "400px" });
            expect(root).toHaveAttribute("tabindex", "3");
        });

        it("passes the configured theme through to the editor", () => {
            renderWrapper(attribute(storedJson("stored")), { themeEnum: "dark" });

            expect(screen.getByTestId("editor")).toHaveAttribute("data-theme", "dark");
        });

        it("uses the configured save caption", () => {
            renderWrapper(attribute(storedJson("stored")), {
                saveCaption: { value: "Store", status: "available" }
            });

            expect(screen.getByRole("button", { name: "Store" })).toBeInTheDocument();
        });
    });
});
