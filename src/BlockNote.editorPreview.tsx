import { ReactElement } from "react";
import { BlockNotePreviewProps } from "../typings/BlockNoteProps";

// Studio Pro renders this in design mode. The real editor cannot run here - it
// needs a live attribute and a mounted ProseMirror view - so this draws a
// static stand-in at roughly the right size, which is enough for a modeller to
// place and align the widget on a page.
const PLACEHOLDER_LINE_WIDTHS = ["68%", "84%", "45%"];

export function preview({ isEditable, saveCaption, themeEnum, class: className }: BlockNotePreviewProps): ReactElement {
    const isDark = themeEnum === "dark";
    const foreground = isDark ? "#cfcfcf" : "#3f3f3f";
    const muted = isDark ? "#4a4a4a" : "#d8d8d8";

    return (
        <div
            className={`blocknote-mendix-wrapper blocknote-mx-${themeEnum} ${className ?? ""}`}
            style={{
                padding: 12,
                minHeight: 120,
                border: `1px solid ${muted}`,
                borderRadius: 6,
                backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
                color: foreground
            }}
        >
            {isEditable && (
                <div style={{ paddingBottom: 10 }}>
                    <span
                        style={{
                            display: "inline-block",
                            width: 100,
                            padding: "6px 0",
                            borderRadius: 6,
                            textAlign: "center",
                            fontSize: 12,
                            backgroundColor: isDark ? "#23b5d8" : "#eef6f9",
                            color: isDark ? "#ffffff" : "#2095b2"
                        }}
                    >
                        {saveCaption || "Save"}
                    </span>
                </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, paddingBottom: 8 }}>Block Note</div>
            {PLACEHOLDER_LINE_WIDTHS.map(width => (
                <div
                    key={width}
                    style={{ width, height: 8, marginBottom: 8, borderRadius: 4, backgroundColor: muted }}
                />
            ))}
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/BlockNote.css");
}
