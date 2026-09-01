import { describe, expect, it } from "vitest";
import { nextEditorialRole } from "../src/lib/server/editor-access";

describe("منح صلاحية التحرير", () => {
  it("يبقي الدور التحريري الحالي", () => {
    expect(nextEditorialRole({ currentRole: "editor", allowlistRole: null, existingEditorCount: 3 })).toBe("editor");
  });

  it("يرقّي المشاهد إذا كان بريده في قائمة المحررين", () => {
    expect(nextEditorialRole({ currentRole: "viewer", allowlistRole: "admin", existingEditorCount: 2 })).toBe("admin");
  });

  it("يجعل أول حساب مديرًا إن لم يوجد أي محرر", () => {
    expect(nextEditorialRole({ currentRole: "viewer", allowlistRole: null, existingEditorCount: 0 })).toBe("admin");
  });

  it("يرفض مشاهدًا بعد وجود محررين بلا قائمة سماح", () => {
    expect(nextEditorialRole({ currentRole: "viewer", allowlistRole: null, existingEditorCount: 1 })).toBeNull();
  });
});
