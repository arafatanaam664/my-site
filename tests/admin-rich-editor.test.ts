import { afterEach, describe, expect, it, vi } from "vitest";
import { applyEditorCommand } from "../src/lib/admin-rich-editor";

describe("أوامر المحرر الغني", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("يمرر عناوين الفقرات بصيغة <h2> التي يعتمدها المتصفح", () => {
    const execCommand = vi.fn().mockReturnValue(true);
    vi.stubGlobal("document", { execCommand });
    applyEditorCommand("formatBlock", "h2");
    expect(execCommand).toHaveBeenCalledWith("formatBlock", false, "<h2>");
    expect(execCommand).toHaveBeenCalledTimes(1);
  });

  it("يجرب القيمة غير المغلفة إن رفض المتصفح الصيغة المغلفة", () => {
    const execCommand = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    vi.stubGlobal("document", { execCommand });
    applyEditorCommand("formatBlock", "h3");
    expect(execCommand).toHaveBeenNthCalledWith(1, "formatBlock", false, "<h3>");
    expect(execCommand).toHaveBeenNthCalledWith(2, "formatBlock", false, "h3");
  });
});
