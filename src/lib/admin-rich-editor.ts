export type RichEditorHandle = {
  getHtml: () => string;
  setHtml: (html: string) => void;
  insertHtml: (html: string) => void;
  focus: () => void;
  destroy: () => void;
};

function currentSelectionInside(root: HTMLElement) {
  const selection = document.getSelection();
  if (!selection?.rangeCount) return false;
  return root.contains(selection.anchorNode);
}

function exec(command: string, value?: string) {
  const editor = document as unknown as { execCommand: (commandId: string, showUI?: boolean, commandValue?: string) => boolean };
  editor.execCommand(command, false, value);
}

export function mountRichEditor(surface: HTMLElement, options: { onChange?: () => void } = {}): RichEditorHandle {
  surface.setAttribute("contenteditable", "true");
  surface.setAttribute("role", "textbox");
  surface.setAttribute("aria-multiline", "true");
  surface.spellcheck = true;

  const sync = () => options.onChange?.();
  surface.addEventListener("input", sync);
  surface.addEventListener("keyup", sync);
  surface.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") ?? "";
    exec("insertText", text);
    sync();
  });

  return {
    getHtml: () => surface.innerHTML,
    setHtml: (html) => { surface.innerHTML = html || "<p></p>"; sync(); },
    insertHtml: (html) => {
      surface.focus();
      if (!currentSelectionInside(surface)) {
        const range = document.createRange();
        range.selectNodeContents(surface);
        range.collapse(false);
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(range);
      }
      exec("insertHTML", html);
      sync();
    },
    focus: () => surface.focus(),
    destroy: () => {
      surface.removeEventListener("input", sync);
      surface.removeEventListener("keyup", sync);
    },
  };
}

export function applyEditorCommand(command: string, value?: string) {
  if (command === "createLink") {
    const href = value?.trim() || window.prompt("رابط HTTPS") || "";
    if (!href) return;
    exec("createLink", href);
    return;
  }
  if (command === "insertTable") {
    exec("insertHTML", "<table><thead><tr><th>عنوان</th><th>عنوان</th></tr></thead><tbody><tr><td>خلية</td><td>خلية</td></tr></tbody></table>");
    return;
  }
  exec(command, value);
}
