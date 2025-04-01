"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("path");
const vue = require("vue");
const toast = require("./chunks/toast-BE6IAHnn.cjs");
const NcDialog = require("@nextcloud/vue/components/NcDialog");
const NcNoteCard = require("@nextcloud/vue/components/NcNoteCard");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const NcDialog__default = /* @__PURE__ */ _interopDefault(NcDialog);
const NcNoteCard__default = /* @__PURE__ */ _interopDefault(NcNoteCard);
const spawnDialog = (dialog, props, onClose = () => {
}) => {
  const el = document.createElement("div");
  const container = document.querySelector(props?.container) || document.body;
  container.appendChild(el);
  const vue$1 = vue.createApp({
    name: "VueDialogHelper",
    render: () => vue.h(dialog, {
      props,
      onClose: (...rest) => {
        onClose(...rest.map((v) => vue.toRaw(v)));
        vue$1.unmount();
      }
    })
  });
  return vue$1;
};
const IconMove = '<svg xmlns="http://www.w3.org/2000/svg" id="mdi-folder-move" viewBox="0 0 24 24"><path d="M14,18V15H10V11H14V8L19,13M20,6H12L10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6Z" /></svg>';
const IconCopy = '<svg xmlns="http://www.w3.org/2000/svg" id="mdi-folder-multiple" viewBox="0 0 24 24"><path d="M22,4H14L12,2H6A2,2 0 0,0 4,4V16A2,2 0 0,0 6,18H22A2,2 0 0,0 24,16V6A2,2 0 0,0 22,4M2,6H0V11H0V20A2,2 0 0,0 2,22H20V20H2V6Z" /></svg>';
var FilePickerType = /* @__PURE__ */ ((FilePickerType2) => {
  FilePickerType2[FilePickerType2["Choose"] = 1] = "Choose";
  FilePickerType2[FilePickerType2["Move"] = 2] = "Move";
  FilePickerType2[FilePickerType2["Copy"] = 3] = "Copy";
  FilePickerType2[FilePickerType2["CopyMove"] = 4] = "CopyMove";
  FilePickerType2[FilePickerType2["Custom"] = 5] = "Custom";
  return FilePickerType2;
})(FilePickerType || {});
class FilePickerClosed extends Error {
}
class FilePicker {
  title;
  multiSelect;
  mimeTypeFilter;
  directoriesAllowed;
  buttons;
  path;
  filter;
  container;
  disabledNavigation;
  constructor(title, multiSelect, mimeTypeFilter, directoriesAllowed, buttons, path2, filter, container, disabledNavigation = false) {
    this.title = title;
    this.multiSelect = multiSelect;
    this.mimeTypeFilter = mimeTypeFilter;
    this.directoriesAllowed = directoriesAllowed;
    this.path = path2;
    this.filter = filter;
    this.buttons = buttons;
    this.container = container;
    this.disabledNavigation = disabledNavigation;
  }
  /**
   * Pick files using the FilePicker
   *
   * @return Promise with array of picked files or rejected promise on close without picking
   */
  async pick() {
    const { FilePickerVue } = await Promise.resolve().then(() => require("./chunks/index-CXsPICz4.cjs"));
    return new Promise((resolve, reject) => {
      spawnDialog(FilePickerVue, {
        allowPickDirectory: this.directoriesAllowed,
        buttons: this.buttons,
        container: this.container,
        name: this.title,
        path: this.path,
        mimetypeFilter: this.mimeTypeFilter,
        multiselect: this.multiSelect,
        filterFn: this.filter,
        disabledNavigation: this.disabledNavigation
      }, (...rest) => {
        const [nodes] = rest;
        if (!Array.isArray(nodes) || nodes.length === 0) {
          reject(new FilePickerClosed("FilePicker: No nodes selected"));
        } else {
          if (this.multiSelect) {
            resolve(nodes.map((node) => node.path));
          } else {
            resolve(nodes[0]?.path || "/");
          }
        }
      });
    });
  }
}
class FilePickerBuilder {
  title;
  multiSelect = false;
  mimeTypeFilter = [];
  directoriesAllowed = false;
  path;
  filter;
  buttons = [];
  container;
  disabledNavigation = false;
  /**
   * Construct a new FilePicker
   *
   * @param title Title of the FilePicker
   */
  constructor(title) {
    this.title = title;
  }
  /**
   * Set the container where the FilePicker will be mounted
   * By default 'body' is used
   *
   * @param container The dialog container
   */
  setContainer(container) {
    this.container = container;
    return this;
  }
  /**
   * Enable or disable picking multiple files
   *
   * @param ms True to enable picking multiple files, false otherwise
   */
  setMultiSelect(ms) {
    this.multiSelect = ms;
    return this;
  }
  /**
   * Add allowed MIME type
   *
   * @param filter MIME type to allow
   */
  addMimeTypeFilter(filter) {
    this.mimeTypeFilter.push(filter);
    return this;
  }
  /**
   * Set allowed MIME types
   *
   * @param filter Array of allowed MIME types
   */
  setMimeTypeFilter(filter) {
    this.mimeTypeFilter = filter;
    return this;
  }
  /**
   * Add a button to the FilePicker
   * Note: This overrides any previous `setButtonFactory` call
   *
   * @param button The button
   */
  addButton(button) {
    if (typeof this.buttons === "function") {
      console.warn("FilePicker buttons were set to factory, now overwritten with button object.");
      this.buttons = [];
    }
    this.buttons.push(button);
    return this;
  }
  /**
   * Set the button factory which is used to generate buttons from current view, path and selected nodes
   * Note: This overrides any previous `addButton` call
   *
   * @param factory The button factory
   */
  setButtonFactory(factory) {
    this.buttons = factory;
    return this;
  }
  /**
   * Set FilePicker type based on legacy file picker types
   * @param type The legacy filepicker type to emulate
   * @deprecated Use `addButton` or `setButtonFactory` instead as with setType you do not know which button was pressed
   */
  setType(type) {
    this.buttons = (nodes, path$1) => {
      const buttons = [];
      const node = nodes?.[0]?.attributes?.displayName || nodes?.[0]?.basename;
      const target = node || path.basename(path$1);
      if (type === 1) {
        let label = toast.t("Choose");
        if (nodes.length === 1) {
          label = toast.t("Choose {file}", { file: node });
        } else if (this.multiSelect) {
          label = toast.n("Choose %n file", "Choose %n files", nodes.length);
        }
        buttons.push({
          callback: () => {
          },
          type: "primary",
          label
        });
      }
      if (type === 4 || type === 3) {
        buttons.push({
          callback: () => {
          },
          label: target ? toast.t("Copy to {target}", { target }) : toast.t("Copy"),
          type: "primary",
          icon: IconCopy
        });
      }
      if (type === 2 || type === 4) {
        buttons.push({
          callback: () => {
          },
          label: target ? toast.t("Move to {target}", { target }) : toast.t("Move"),
          type: type === 2 ? "primary" : "secondary",
          icon: IconMove
        });
      }
      return buttons;
    };
    return this;
  }
  /**
   * Allow to pick directories besides files
   *
   * @param allow True to allow picking directories
   */
  allowDirectories(allow = true) {
    this.directoriesAllowed = allow;
    return this;
  }
  /**
   * Set starting path of the FilePicker
   *
   * @param path Path to start from picking
   */
  startAt(path2) {
    this.path = path2;
    return this;
  }
  /**
   * Add filter function to filter file list of FilePicker
   *
   * @param filter Filter function to apply
   */
  setFilter(filter) {
    this.filter = filter;
    return this;
  }
  /**
   * Allow to pick directories besides files
   *
   * @param allow True to allow picking directories
   */
  disableNavigation() {
    this.disabledNavigation = true;
    return this;
  }
  /**
   * Construct the configured FilePicker
   */
  build() {
    return new FilePicker(
      this.title,
      this.multiSelect,
      this.mimeTypeFilter,
      this.directoriesAllowed,
      this.buttons,
      this.path,
      this.filter,
      this.container,
      this.disabledNavigation
    );
  }
}
function getFilePickerBuilder(title) {
  return new FilePickerBuilder(title);
}
var DialogSeverity = /* @__PURE__ */ ((DialogSeverity2) => {
  DialogSeverity2["Info"] = "info";
  DialogSeverity2["Warning"] = "warning";
  DialogSeverity2["Error"] = "error";
  return DialogSeverity2;
})(DialogSeverity || {});
const _hoisted_1 = ["textContent"];
const _hoisted_2 = ["innerHTML"];
const _sfc_main = /* @__PURE__ */ vue.defineComponent({
  __name: "GenericDialog",
  props: {
    name: {},
    text: {},
    html: {},
    buttons: {},
    severity: {}
  },
  setup(__props) {
    const props = __props;
    const handleUnload = () => `${props.name}: ${props.text}`;
    vue.onMounted(() => window.addEventListener("unload", handleUnload));
    vue.onUnmounted(() => window.removeEventListener("unload", handleUnload));
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.unref(NcDialog__default.default), {
        "dialog-classes": "nc-generic-dialog",
        buttons: _ctx.buttons,
        name: _ctx.name,
        message: _ctx.text,
        "onUpdate:open": _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close"))
      }, {
        default: vue.withCtx(() => [
          _ctx.severity ? (vue.openBlock(), vue.createBlock(vue.unref(NcNoteCard__default.default), {
            key: 0,
            type: _ctx.severity
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("p", {
                textContent: vue.toDisplayString(_ctx.text)
              }, null, 8, _hoisted_1)
            ]),
            _: 1
          }, 8, ["type"])) : vue.createCommentVNode("", true),
          _ctx.html ? (vue.openBlock(), vue.createElementBlock("div", {
            key: 1,
            innerHTML: _ctx.html
          }, null, 8, _hoisted_2)) : vue.createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["buttons", "name", "message"]);
    };
  }
});
class Dialog {
  #name;
  #text;
  #buttons;
  #severity;
  #dialog;
  /** @deprecated */
  #html;
  constructor(name, text, buttons = [], severity) {
    this.#name = name;
    this.#text = text;
    this.#buttons = buttons;
    this.#severity = severity;
    this.#dialog = void 0;
    this.#html = void 0;
  }
  /**
   * @deprecated DO NOT USE! It will be removed in the near future!
   * @param html HTML content
   */
  setHTML(html) {
    this.#html = html;
    return this;
  }
  /**
   * Spawn and show the dialog - if already open the previous instance will be destroyed
   * @return Promise that resolves when the dialog is answered successfully and rejects on close
   */
  show() {
    if (this.#dialog) {
      this.#dialog.$destroy();
    }
    return new Promise((resolve) => {
      this.#dialog = spawnDialog(
        _sfc_main,
        {
          buttons: this.#buttons,
          name: this.#name,
          text: this.#text,
          severity: this.#severity,
          html: this.#html
        },
        resolve
      );
    });
  }
  /**
   * Hide and destroy the current dialog instance
   */
  hide() {
    this.#dialog?.$destroy();
  }
}
class DialogBuilder {
  #severity;
  #text;
  #name;
  #buttons;
  constructor(name) {
    this.#severity = void 0;
    this.#text = "";
    this.#name = name ?? "";
    this.#buttons = [];
  }
  /**
   * Set dialog name
   * @param name The name or headline of the dialog
   */
  setName(name) {
    this.#name = name;
    return this;
  }
  /**
   * Set the dialog text
   * @param text Main text of the dialog
   */
  setText(text) {
    this.#text = text;
    return this;
  }
  /**
   * Set the severity of the dialog
   * @param severity Severity of the dialog
   */
  setSeverity(severity) {
    this.#severity = severity;
    return this;
  }
  /**
   * Set buttons from array
   * @param buttons Either an array of dialog buttons
   */
  setButtons(buttons) {
    if (this.#buttons.length > 0) {
      console.warn("[@nextcloud/dialogs] Dialog buttons are already set - this overrides previous buttons.");
    }
    this.#buttons = buttons;
    return this;
  }
  /**
   * Add a single button
   * @param button Button to add
   */
  addButton(button) {
    this.#buttons.push(button);
    return this;
  }
  build() {
    return new Dialog(this.#name, this.#text, this.#buttons, this.#severity);
  }
}
function getDialogBuilder(name) {
  return new DialogBuilder(name);
}
exports.TOAST_ARIA_LIVE_ASSERTIVE = toast.TOAST_ARIA_LIVE_ASSERTIVE;
exports.TOAST_ARIA_LIVE_OFF = toast.TOAST_ARIA_LIVE_OFF;
exports.TOAST_ARIA_LIVE_POLITE = toast.TOAST_ARIA_LIVE_POLITE;
exports.TOAST_DEFAULT_TIMEOUT = toast.TOAST_DEFAULT_TIMEOUT;
exports.TOAST_PERMANENT_TIMEOUT = toast.TOAST_PERMANENT_TIMEOUT;
exports.TOAST_UNDO_TIMEOUT = toast.TOAST_UNDO_TIMEOUT;
exports.ToastAriaLive = toast.ToastAriaLive;
exports.ToastType = toast.ToastType;
exports.showError = toast.showError;
exports.showInfo = toast.showInfo;
exports.showLoading = toast.showLoading;
exports.showMessage = toast.showMessage;
exports.showSuccess = toast.showSuccess;
exports.showUndo = toast.showUndo;
exports.showWarning = toast.showWarning;
exports.Dialog = Dialog;
exports.DialogBuilder = DialogBuilder;
exports.DialogSeverity = DialogSeverity;
exports.FilePicker = FilePicker;
exports.FilePickerBuilder = FilePickerBuilder;
exports.FilePickerClosed = FilePickerClosed;
exports.FilePickerType = FilePickerType;
exports.getDialogBuilder = getDialogBuilder;
exports.getFilePickerBuilder = getFilePickerBuilder;
exports.spawnDialog = spawnDialog;
