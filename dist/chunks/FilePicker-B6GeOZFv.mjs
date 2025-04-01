import { openBlock, createElementBlock, mergeProps, createElementVNode, toDisplayString, createCommentVNode, ref, onMounted, computed, defineComponent, normalizeClass, unref, watchEffect, toRef, normalizeStyle, Fragment, createBlock, resolveDynamicComponent, toHandlers, withModifiers, createVNode, onUnmounted, withCtx, createTextVNode, renderList, nextTick, createSlots, shallowRef, watch } from "vue";
import { FileType, formatFileSize, sortNodes, davGetRecentSearch, davResultToNode, davRootPath, davGetDefaultPropfind, davGetClient, getFavoriteNodes } from "@nextcloud/files";
import { NcCheckboxRadioSwitch, NcDateTime, NcButton, NcBreadcrumbs, NcBreadcrumb, NcActions, NcActionInput, NcTextField, NcIconSvgWrapper, NcSelect, NcDialog, NcEmptyContent } from "@nextcloud/vue";
import { loadState } from "@nextcloud/initial-state";
import { generateUrl } from "@nextcloud/router";
import { isPublicShare } from "@nextcloud/sharing/public";
import { toValue } from "@vueuse/core";
import axios from "@nextcloud/axios";
import { k as showError, t } from "./toast-4FBJraHM.mjs";
import PQueue from "p-queue";
import { getCurrentUser } from "@nextcloud/auth";
import { mdiFolder, mdiClock, mdiStar } from "@mdi/js";
import { emit } from "@nextcloud/event-bus";
import { CancelablePromise } from "cancelable-promise";
import { join } from "path";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$k = {
  name: "FileIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$i = ["aria-hidden", "aria-label"];
const _hoisted_2$h = ["fill", "width", "height"];
const _hoisted_3$g = { d: "M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" };
const _hoisted_4$g = { key: 0 };
function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon file-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$g, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$g, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$h))
  ], 16, _hoisted_1$i);
}
const IconFile = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$d]]);
const useFilesSettings = () => {
  const filesUserState = loadState("files", "config", null);
  const showHiddenFiles = ref(filesUserState?.show_hidden ?? true);
  const sortFavoritesFirst = ref(filesUserState?.sort_favorites_first ?? true);
  const cropImagePreviews = ref(filesUserState?.crop_image_previews ?? true);
  onMounted(async () => {
    if (!isPublicShare()) {
      try {
        const { data } = await axios.get(generateUrl("/apps/files/api/v1/configs"));
        showHiddenFiles.value = data?.data?.show_hidden ?? false;
        sortFavoritesFirst.value = data?.data?.sort_favorites_first ?? true;
        cropImagePreviews.value = data?.data?.crop_image_previews ?? true;
      } catch (error) {
        console.error("Could not load files settings", error);
        showError(t("Could not load files settings"));
      }
    } else {
      console.debug("Skip loading files settings - currently on public share");
    }
  });
  return {
    showHiddenFiles,
    sortFavoritesFirst,
    cropImagePreviews
  };
};
const useFilesViews = (currentView) => {
  const convertOrder = (order2) => order2 === "asc" ? "ascending" : order2 === "desc" ? "descending" : "none";
  const filesViewsState = loadState("files", "viewConfigs", null);
  const filesViewConfig = ref({
    sortBy: filesViewsState?.files?.sorting_mode ?? "basename",
    order: convertOrder(filesViewsState?.files?.sorting_direction ?? "asc")
  });
  const recentViewConfig = ref({
    sortBy: filesViewsState?.recent?.sorting_mode ?? "basename",
    order: convertOrder(filesViewsState?.recent?.sorting_direction ?? "asc")
  });
  const favoritesViewConfig = ref({
    sortBy: filesViewsState?.favorites?.sorting_mode ?? "basename",
    order: convertOrder(filesViewsState?.favorites?.sorting_direction ?? "asc")
  });
  onMounted(async () => {
    if (!isPublicShare()) {
      try {
        const { data } = await axios.get(generateUrl("/apps/files/api/v1/views"));
        filesViewConfig.value = {
          sortBy: data?.data?.files?.sorting_mode ?? "basename",
          order: convertOrder(data?.data?.files?.sorting_direction)
        };
        favoritesViewConfig.value = {
          sortBy: data?.data?.favorites?.sorting_mode ?? "basename",
          order: convertOrder(data?.data?.favorites?.sorting_direction)
        };
        recentViewConfig.value = {
          sortBy: data?.data?.recent?.sorting_mode ?? "basename",
          order: convertOrder(data?.data?.recent?.sorting_direction)
        };
      } catch (error) {
        console.error("Could not load files views", error);
        showError(t("Could not load files views"));
      }
    } else {
      console.debug("Skip loading files views - currently on public share");
    }
  });
  const currentConfig = computed(() => toValue(currentView || "files") === "files" ? filesViewConfig.value : toValue(currentView) === "recent" ? recentViewConfig.value : favoritesViewConfig.value);
  const sortBy = computed(() => currentConfig.value.sortBy);
  const order = computed(() => currentConfig.value.order);
  return {
    filesViewConfig,
    favoritesViewConfig,
    recentViewConfig,
    currentConfig,
    sortBy,
    order
  };
};
const _sfc_main$j = {
  name: "MenuUpIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$h = ["aria-hidden", "aria-label"];
const _hoisted_2$g = ["fill", "width", "height"];
const _hoisted_3$f = { d: "M7,15L12,10L17,15H7Z" };
const _hoisted_4$f = { key: 0 };
function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon menu-up-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$f, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$f, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$g))
  ], 16, _hoisted_1$h);
}
const IconSortAscending = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$c]]);
const _sfc_main$i = {
  name: "MenuDownIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$g = ["aria-hidden", "aria-label"];
const _hoisted_2$f = ["fill", "width", "height"];
const _hoisted_3$e = { d: "M7,10L12,15L17,10H7Z" };
const _hoisted_4$e = { key: 0 };
function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon menu-down-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$e, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$e, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$f))
  ], 16, _hoisted_1$g);
}
const IconSortDescending = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$b]]);
const fileListIconStylesModule = {
  "file-picker__file-icon": "_file-picker__file-icon_19mjt_9"
};
const _hoisted_1$f = {
  "aria-hidden": "true",
  class: "file-picker__row loading-row"
};
const _hoisted_2$e = {
  key: 0,
  class: "row-checkbox"
};
const _hoisted_3$d = { class: "row-name" };
const _hoisted_4$d = { class: "row-wrapper" };
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "LoadingTableRow",
  props: {
    showCheckbox: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("tr", _hoisted_1$f, [
        _ctx.showCheckbox ? (openBlock(), createElementBlock("td", _hoisted_2$e, _cache[0] || (_cache[0] = [
          createElementVNode("span", null, null, -1)
        ]))) : createCommentVNode("", true),
        createElementVNode("td", _hoisted_3$d, [
          createElementVNode("div", _hoisted_4$d, [
            createElementVNode("span", {
              class: normalizeClass(unref(fileListIconStylesModule)["file-picker__file-icon"])
            }, null, 2),
            _cache[1] || (_cache[1] = createElementVNode("span", null, null, -1))
          ])
        ]),
        _cache[2] || (_cache[2] = createElementVNode("td", { class: "row-size" }, [
          createElementVNode("span")
        ], -1)),
        _cache[3] || (_cache[3] = createElementVNode("td", { class: "row-modified" }, [
          createElementVNode("span")
        ], -1))
      ]);
    };
  }
});
const LoadingTableRow = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-15187afc"]]);
const queue = new PQueue({ concurrency: 5 });
function preloadImage(url) {
  const { resolve, promise } = Promise.withResolvers();
  queue.add(() => {
    const image = new Image();
    image.onerror = () => resolve(false);
    image.onload = () => resolve(true);
    image.src = url;
    return promise;
  });
  return promise;
}
function getPreviewURL(node, options = {}) {
  options = { size: 32, cropPreview: false, mimeFallback: true, ...options };
  try {
    const previewUrl = node.attributes?.previewUrl || generateUrl("/core/preview?fileId={fileid}", {
      fileid: node.fileid
    });
    let url;
    try {
      url = new URL(previewUrl);
    } catch (e) {
      url = new URL(previewUrl, window.location.origin);
    }
    url.searchParams.set("x", `${options.size}`);
    url.searchParams.set("y", `${options.size}`);
    url.searchParams.set("mimeFallback", `${options.mimeFallback}`);
    url.searchParams.set("a", options.cropPreview === true ? "0" : "1");
    url.searchParams.set("c", `${node.attributes.etag}`);
    return url;
  } catch (e) {
    return null;
  }
}
const usePreviewURL = (node, options) => {
  const previewURL = ref(null);
  const previewLoaded = ref(false);
  watchEffect(() => {
    previewLoaded.value = false;
    previewURL.value = getPreviewURL(toValue(node), toValue(options || {}));
    if (previewURL.value) {
      preloadImage(previewURL.value.href).then((success) => {
        previewLoaded.value = success;
      });
    }
  });
  return {
    previewURL,
    previewLoaded
  };
};
const _sfc_main$g = {
  name: "FolderIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$e = ["aria-hidden", "aria-label"];
const _hoisted_2$d = ["fill", "width", "height"];
const _hoisted_3$c = { d: "M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" };
const _hoisted_4$c = { key: 0 };
function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon folder-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$c, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$c, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$d))
  ], 16, _hoisted_1$e);
}
const IconFolder = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$a]]);
const _sfc_main$f = {
  name: "LockIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$d = ["aria-hidden", "aria-label"];
const _hoisted_2$c = ["fill", "width", "height"];
const _hoisted_3$b = { d: "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" };
const _hoisted_4$b = { key: 0 };
function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon lock-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$b, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$b, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$c))
  ], 16, _hoisted_1$d);
}
const LockIcon = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$9]]);
const _sfc_main$e = {
  name: "TagIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$c = ["aria-hidden", "aria-label"];
const _hoisted_2$b = ["fill", "width", "height"];
const _hoisted_3$a = { d: "M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z" };
const _hoisted_4$a = { key: 0 };
function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon tag-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$a, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$a, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$b))
  ], 16, _hoisted_1$c);
}
const TagIcon = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$8]]);
const _sfc_main$d = {
  name: "LinkIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$b = ["aria-hidden", "aria-label"];
const _hoisted_2$a = ["fill", "width", "height"];
const _hoisted_3$9 = { d: "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" };
const _hoisted_4$9 = { key: 0 };
function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon link-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$9, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$9, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$a))
  ], 16, _hoisted_1$b);
}
const LinkIcon = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$7]]);
const _sfc_main$c = {
  name: "AccountPlusIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$a = ["aria-hidden", "aria-label"];
const _hoisted_2$9 = ["fill", "width", "height"];
const _hoisted_3$8 = { d: "M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z" };
const _hoisted_4$8 = { key: 0 };
function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon account-plus-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$8, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$8, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$9))
  ], 16, _hoisted_1$a);
}
const AccountPlusIcon = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$6]]);
const _sfc_main$b = {
  name: "NetworkIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$9 = ["aria-hidden", "aria-label"];
const _hoisted_2$8 = ["fill", "width", "height"];
const _hoisted_3$7 = { d: "M17,3A2,2 0 0,1 19,5V15A2,2 0 0,1 17,17H13V19H14A1,1 0 0,1 15,20H22V22H15A1,1 0 0,1 14,23H10A1,1 0 0,1 9,22H2V20H9A1,1 0 0,1 10,19H11V17H7C5.89,17 5,16.1 5,15V5A2,2 0 0,1 7,3H17Z" };
const _hoisted_4$7 = { key: 0 };
function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon network-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$7, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$7, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$8))
  ], 16, _hoisted_1$9);
}
const NetworkIcon = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$5]]);
const _sfc_main$a = {
  name: "AccountGroupIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$8 = ["aria-hidden", "aria-label"];
const _hoisted_2$7 = ["fill", "width", "height"];
const _hoisted_3$6 = { d: "M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" };
const _hoisted_4$6 = { key: 0 };
function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon account-group-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$6, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$6, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$7))
  ], 16, _hoisted_1$8);
}
const AccountGroupIcon = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$4]]);
const __default__$1 = {
  name: "FilePreview"
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  ...__default__$1,
  props: {
    node: {},
    cropImagePreviews: { type: Boolean }
  },
  setup(__props) {
    const fileListIconStyles = ref(fileListIconStylesModule);
    const props = __props;
    const {
      previewURL,
      previewLoaded
    } = usePreviewURL(toRef(props, "node"), computed(() => ({ cropPreview: props.cropImagePreviews })));
    const isFile = computed(() => props.node.type === FileType.File);
    const folderDecorationIcon = computed(() => {
      if (props.node.type !== FileType.Folder) {
        return null;
      }
      if (props.node.attributes?.["is-encrypted"] === 1) {
        return LockIcon;
      }
      if (props.node.attributes?.["is-tag"]) {
        return TagIcon;
      }
      const shareTypes = Object.values(props.node.attributes?.["share-types"] || {}).flat();
      if (shareTypes.some((type) => type === ShareType.Link || type === ShareType.Email)) {
        return LinkIcon;
      }
      if (shareTypes.length > 0) {
        return AccountPlusIcon;
      }
      switch (props.node.attributes?.["mount-type"]) {
        case "external":
        case "external-session":
          return NetworkIcon;
        case "group":
          return AccountGroupIcon;
        case "shared":
          return AccountPlusIcon;
      }
      return null;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        style: normalizeStyle(unref(previewLoaded) ? { backgroundImage: `url(${unref(previewURL)})` } : void 0),
        class: normalizeClass(fileListIconStyles.value["file-picker__file-icon"])
      }, [
        !unref(previewLoaded) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          isFile.value ? (openBlock(), createBlock(IconFile, {
            key: 0,
            size: 20
          })) : folderDecorationIcon.value ? (openBlock(), createBlock(resolveDynamicComponent(folderDecorationIcon.value), { key: 1 })) : (openBlock(), createBlock(IconFolder, {
            key: 2,
            size: 20
          }))
        ], 64)) : createCommentVNode("", true)
      ], 6);
    };
  }
});
const _hoisted_1$7 = ["tabindex", "aria-selected", "data-filename"];
const _hoisted_2$6 = { class: "row-name" };
const _hoisted_3$5 = {
  class: "file-picker__name-container",
  "data-testid": "row-name"
};
const _hoisted_4$5 = ["title", "textContent"];
const _hoisted_5$1 = ["textContent"];
const _hoisted_6$1 = { class: "row-size" };
const _hoisted_7$1 = { class: "row-modified" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "FileListRow",
  props: {
    allowPickDirectory: { type: Boolean },
    selected: { type: Boolean },
    showCheckbox: { type: Boolean },
    canPick: { type: Boolean },
    node: {},
    cropImagePreviews: { type: Boolean }
  },
  emits: ["update:selected", "enter-directory"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const displayName = computed(() => props.node.attributes?.displayName || props.node.basename.slice(0, props.node.extension ? -props.node.extension.length : void 0));
    const fileExtension = computed(() => props.node.extension);
    const isDirectory = computed(() => props.node.type === FileType.Folder);
    const isPickable = computed(() => props.canPick && (props.allowPickDirectory || !isDirectory.value));
    function toggleSelected() {
      emit2("update:selected", !props.selected);
    }
    function handleClick() {
      if (isDirectory.value) {
        emit2("enter-directory", props.node);
      } else {
        toggleSelected();
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Enter") {
        handleClick();
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("tr", mergeProps({
        tabindex: _ctx.showCheckbox && !isDirectory.value ? void 0 : 0,
        "aria-selected": !isPickable.value ? void 0 : _ctx.selected,
        class: ["file-picker__row", {
          "file-picker__row--selected": _ctx.selected && !_ctx.showCheckbox
        }],
        "data-filename": _ctx.node.basename,
        "data-testid": "file-list-row"
      }, toHandlers({
        click: handleClick,
        /* same as tabindex -> if we hide the checkbox or this is a directory we need keyboard access to enter the directory or select the node */
        ...!_ctx.showCheckbox || isDirectory.value ? { keydown: handleKeyDown } : {}
      }, true)), [
        _ctx.showCheckbox ? (openBlock(), createElementBlock("td", {
          key: 0,
          class: "row-checkbox",
          onClick: withModifiers(() => {
          }, ["stop"])
        }, [
          createVNode(unref(NcCheckboxRadioSwitch), {
            "aria-label": unref(t)("Select the row for {nodename}", { nodename: displayName.value }),
            "model-value": _ctx.selected,
            disabled: !isPickable.value,
            "data-testid": "row-checkbox",
            "onUpdate:modelValue": toggleSelected
          }, null, 8, ["aria-label", "model-value", "disabled"])
        ])) : createCommentVNode("", true),
        createElementVNode("td", _hoisted_2$6, [
          createElementVNode("div", _hoisted_3$5, [
            createVNode(_sfc_main$9, {
              node: _ctx.node,
              "crop-image-previews": _ctx.cropImagePreviews
            }, null, 8, ["node", "crop-image-previews"]),
            createElementVNode("div", {
              class: "file-picker__file-name",
              title: displayName.value,
              textContent: toDisplayString(displayName.value)
            }, null, 8, _hoisted_4$5),
            createElementVNode("div", {
              class: "file-picker__file-extension",
              textContent: toDisplayString(fileExtension.value)
            }, null, 8, _hoisted_5$1)
          ])
        ]),
        createElementVNode("td", _hoisted_6$1, toDisplayString(unref(formatFileSize)(_ctx.node.size || 0)), 1),
        createElementVNode("td", _hoisted_7$1, [
          createVNode(unref(NcDateTime), {
            timestamp: _ctx.node.mtime,
            "ignore-seconds": true
          }, null, 8, ["timestamp"])
        ])
      ], 16, _hoisted_1$7);
    };
  }
});
const FileListRow = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-46520243"]]);
const _hoisted_1$6 = {
  key: 0,
  class: "row-checkbox"
};
const _hoisted_2$5 = { class: "hidden-visually" };
const _hoisted_3$4 = ["aria-sort"];
const _hoisted_4$4 = { class: "header-wrapper" };
const _hoisted_5 = {
  key: 2,
  style: { "width": "44px" }
};
const _hoisted_6 = ["aria-sort"];
const _hoisted_7 = {
  key: 2,
  style: { "width": "44px" }
};
const _hoisted_8 = ["aria-sort"];
const _hoisted_9 = {
  key: 2,
  style: { "width": "44px" }
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "FileList",
  props: {
    currentView: {},
    multiselect: { type: Boolean },
    allowPickDirectory: { type: Boolean },
    loading: { type: Boolean },
    files: {},
    selectedFiles: {},
    path: {}
  },
  emits: ["update:path", "update:selectedFiles"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const customSortingConfig = ref();
    const { currentConfig: filesAppSorting } = useFilesViews(props.currentView);
    const sortingConfig = computed(() => customSortingConfig.value ?? filesAppSorting.value);
    const sortByName = computed(() => sortingConfig.value.sortBy === "basename" ? sortingConfig.value.order === "none" ? void 0 : sortingConfig.value.order : void 0);
    const sortBySize = computed(() => sortingConfig.value.sortBy === "size" ? sortingConfig.value.order === "none" ? void 0 : sortingConfig.value.order : void 0);
    const sortByModified = computed(() => sortingConfig.value.sortBy === "mtime" ? sortingConfig.value.order === "none" ? void 0 : sortingConfig.value.order : void 0);
    const toggleSorting = (sortBy) => {
      if (sortingConfig.value.sortBy === sortBy) {
        if (sortingConfig.value.order === "ascending") {
          customSortingConfig.value = { sortBy: sortingConfig.value.sortBy, order: "descending" };
        } else {
          customSortingConfig.value = { sortBy: sortingConfig.value.sortBy, order: "ascending" };
        }
      } else {
        customSortingConfig.value = { sortBy, order: "ascending" };
      }
    };
    const { sortFavoritesFirst, cropImagePreviews } = useFilesSettings();
    const sortedFiles = computed(() => {
      return sortNodes(props.files, {
        sortFoldersFirst: true,
        sortFavoritesFirst: sortFavoritesFirst.value,
        sortingOrder: sortingConfig.value.order === "descending" ? "desc" : "asc",
        sortingMode: sortingConfig.value.sortBy
      });
    });
    const selectableFiles = computed(() => props.files.filter((file) => props.allowPickDirectory || file.type !== FileType.Folder));
    const allSelected = computed(() => !props.loading && props.selectedFiles.length > 0 && props.selectedFiles.length >= selectableFiles.value.length);
    function onSelectAll() {
      if (props.selectedFiles.length < selectableFiles.value.length) {
        emit2("update:selectedFiles", selectableFiles.value);
      } else {
        emit2("update:selectedFiles", []);
      }
    }
    function onNodeSelected(file) {
      if (props.selectedFiles.includes(file)) {
        emit2("update:selectedFiles", props.selectedFiles.filter((f) => f.path !== file.path));
      } else {
        if (props.multiselect) {
          emit2("update:selectedFiles", [...props.selectedFiles, file]);
        } else {
          emit2("update:selectedFiles", [file]);
        }
      }
    }
    function onChangeDirectory(dir) {
      emit2("update:path", dir.path);
    }
    const skeletonNumber = ref(4);
    const fileContainer = ref();
    {
      const resize = () => nextTick(() => {
        const nodes = fileContainer.value?.parentElement?.children || [];
        let height = fileContainer.value?.parentElement?.clientHeight || 450;
        for (let index = 0; index < nodes.length; index++) {
          if (!fileContainer.value?.isSameNode(nodes[index])) {
            height -= nodes[index].clientHeight;
          }
        }
        skeletonNumber.value = Math.max(1, Math.floor((height - 50) / 50));
      });
      onMounted(() => {
        window.addEventListener("resize", resize);
        resize();
      });
      onUnmounted(() => {
        window.removeEventListener("resize", resize);
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "fileContainer",
        ref: fileContainer,
        class: "file-picker__files"
      }, [
        createElementVNode("table", null, [
          createElementVNode("thead", null, [
            createElementVNode("tr", null, [
              _ctx.multiselect ? (openBlock(), createElementBlock("th", _hoisted_1$6, [
                createElementVNode("span", _hoisted_2$5, toDisplayString(unref(t)("Select entry")), 1),
                _ctx.multiselect ? (openBlock(), createBlock(unref(NcCheckboxRadioSwitch), {
                  key: 0,
                  "aria-label": unref(t)("Select all entries"),
                  "model-value": allSelected.value,
                  "data-testid": "select-all-checkbox",
                  "onUpdate:modelValue": onSelectAll
                }, null, 8, ["aria-label", "model-value"])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true),
              createElementVNode("th", {
                "aria-sort": sortByName.value,
                class: "row-name"
              }, [
                createElementVNode("div", _hoisted_4$4, [
                  _cache[3] || (_cache[3] = createElementVNode("span", { class: "file-picker__header-preview" }, null, -1)),
                  createVNode(unref(NcButton), {
                    wide: true,
                    type: "tertiary",
                    "data-test": "file-picker_sort-name",
                    onClick: _cache[0] || (_cache[0] = ($event) => toggleSorting("basename"))
                  }, {
                    icon: withCtx(() => [
                      sortByName.value === "ascending" ? (openBlock(), createBlock(IconSortAscending, {
                        key: 0,
                        size: 20
                      })) : sortByName.value === "descending" ? (openBlock(), createBlock(IconSortDescending, {
                        key: 1,
                        size: 20
                      })) : (openBlock(), createElementBlock("span", _hoisted_5))
                    ]),
                    default: withCtx(() => [
                      createTextVNode(" " + toDisplayString(unref(t)("Name")), 1)
                    ]),
                    _: 1
                  })
                ])
              ], 8, _hoisted_3$4),
              createElementVNode("th", {
                "aria-sort": sortBySize.value,
                class: "row-size"
              }, [
                createVNode(unref(NcButton), {
                  wide: true,
                  type: "tertiary",
                  onClick: _cache[1] || (_cache[1] = ($event) => toggleSorting("size"))
                }, {
                  icon: withCtx(() => [
                    sortBySize.value === "ascending" ? (openBlock(), createBlock(IconSortAscending, {
                      key: 0,
                      size: 20
                    })) : sortBySize.value === "descending" ? (openBlock(), createBlock(IconSortDescending, {
                      key: 1,
                      size: 20
                    })) : (openBlock(), createElementBlock("span", _hoisted_7))
                  ]),
                  default: withCtx(() => [
                    createTextVNode(" " + toDisplayString(unref(t)("Size")), 1)
                  ]),
                  _: 1
                })
              ], 8, _hoisted_6),
              createElementVNode("th", {
                "aria-sort": sortByModified.value,
                class: "row-modified"
              }, [
                createVNode(unref(NcButton), {
                  wide: true,
                  type: "tertiary",
                  onClick: _cache[2] || (_cache[2] = ($event) => toggleSorting("mtime"))
                }, {
                  icon: withCtx(() => [
                    sortByModified.value === "ascending" ? (openBlock(), createBlock(IconSortAscending, {
                      key: 0,
                      size: 20
                    })) : sortByModified.value === "descending" ? (openBlock(), createBlock(IconSortDescending, {
                      key: 1,
                      size: 20
                    })) : (openBlock(), createElementBlock("span", _hoisted_9))
                  ]),
                  default: withCtx(() => [
                    createTextVNode(" " + toDisplayString(unref(t)("Modified")), 1)
                  ]),
                  _: 1
                })
              ], 8, _hoisted_8)
            ])
          ]),
          createElementVNode("tbody", null, [
            _ctx.loading ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(skeletonNumber.value, (index) => {
              return openBlock(), createBlock(LoadingTableRow, {
                key: index,
                "show-checkbox": _ctx.multiselect
              }, null, 8, ["show-checkbox"]);
            }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(sortedFiles.value, (file) => {
              return openBlock(), createBlock(FileListRow, {
                key: file.fileid || file.path,
                "allow-pick-directory": _ctx.allowPickDirectory,
                "show-checkbox": _ctx.multiselect,
                "can-pick": _ctx.multiselect || _ctx.selectedFiles.length === 0 || _ctx.selectedFiles.includes(file),
                selected: _ctx.selectedFiles.includes(file),
                node: file,
                "crop-image-previews": unref(cropImagePreviews),
                "onUpdate:selected": ($event) => onNodeSelected(file),
                onEnterDirectory: onChangeDirectory
              }, null, 8, ["allow-pick-directory", "show-checkbox", "can-pick", "selected", "node", "crop-image-previews", "onUpdate:selected"]);
            }), 128))
          ])
        ])
      ], 512);
    };
  }
});
const FileList = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-55a410e0"]]);
const _sfc_main$6 = {
  name: "HomeIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$5 = ["aria-hidden", "aria-label"];
const _hoisted_2$4 = ["fill", "width", "height"];
const _hoisted_3$3 = { d: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" };
const _hoisted_4$3 = { key: 0 };
function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon home-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$3, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$3, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$4))
  ], 16, _hoisted_1$5);
}
const IconHome = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$3]]);
const _sfc_main$5 = {
  name: "PlusIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$4 = ["aria-hidden", "aria-label"];
const _hoisted_2$3 = ["fill", "width", "height"];
const _hoisted_3$2 = { d: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" };
const _hoisted_4$2 = { key: 0 };
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon plus-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$2, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$2, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$3))
  ], 16, _hoisted_1$4);
}
const IconPlus = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$2]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "FilePickerBreadcrumbs",
  props: {
    path: {},
    showMenu: { type: Boolean }
  },
  emits: ["update:path", "create-node"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const actionsOpen = ref(false);
    const newNodeName = ref("");
    const nameInput = ref();
    function validateInput() {
      const name = newNodeName.value.trim();
      const input = nameInput.value?.$el?.querySelector("input");
      let validity = "";
      if (name.length === 0) {
        validity = t("Folder name cannot be empty.");
      } else if (name.includes("/")) {
        validity = t('"/" is not allowed inside a folder name.');
      } else if (["..", "."].includes(name)) {
        validity = t('"{name}" is an invalid folder name.', { name });
      } else if (window.OC.config?.blacklist_files_regex && name.match(window.OC.config?.blacklist_files_regex)) {
        validity = t('"{name}" is not an allowed folder name', { name });
      }
      if (input) {
        input.setCustomValidity(validity);
      }
      return validity === "";
    }
    const onSubmit = function() {
      const name = newNodeName.value.trim();
      if (validateInput()) {
        actionsOpen.value = false;
        emit2("create-node", name);
        newNodeName.value = "";
      }
    };
    const pathElements = computed(
      () => props.path.split("/").filter((v) => v !== "").map((v, i, elements) => ({
        name: v,
        path: "/" + elements.slice(0, i + 1).join("/")
      }))
    );
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NcBreadcrumbs), { class: "file-picker__breadcrumbs" }, createSlots({
        default: withCtx(() => [
          createVNode(unref(NcBreadcrumb), {
            name: unref(t)("All files"),
            title: unref(t)("Home"),
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("update:path", "/"))
          }, {
            icon: withCtx(() => [
              createVNode(IconHome, { size: 20 })
            ]),
            _: 1
          }, 8, ["name", "title"]),
          (openBlock(true), createElementBlock(Fragment, null, renderList(pathElements.value, (dir) => {
            return openBlock(), createBlock(unref(NcBreadcrumb), {
              key: dir.path,
              name: dir.name,
              title: dir.path,
              onClick: ($event) => emit2("update:path", dir.path)
            }, null, 8, ["name", "title", "onClick"]);
          }), 128))
        ]),
        _: 2
      }, [
        _ctx.showMenu ? {
          name: "actions",
          fn: withCtx(() => [
            createVNode(unref(NcActions), {
              open: actionsOpen.value,
              "onUpdate:open": _cache[2] || (_cache[2] = ($event) => actionsOpen.value = $event),
              "aria-label": unref(t)("Create directory"),
              "force-menu": true,
              "force-name": true,
              "menu-name": unref(t)("New"),
              type: "secondary",
              onClose: _cache[3] || (_cache[3] = ($event) => newNodeName.value = "")
            }, {
              icon: withCtx(() => [
                createVNode(IconPlus, { size: 20 })
              ]),
              default: withCtx(() => [
                createVNode(unref(NcActionInput), {
                  ref_key: "nameInput",
                  ref: nameInput,
                  value: newNodeName.value,
                  "onUpdate:value": _cache[1] || (_cache[1] = ($event) => newNodeName.value = $event),
                  label: unref(t)("New folder"),
                  placeholder: unref(t)("New folder name"),
                  onSubmit,
                  onInput: validateInput
                }, {
                  icon: withCtx(() => [
                    createVNode(IconFolder, { size: 20 })
                  ]),
                  _: 1
                }, 8, ["value", "label", "placeholder"])
              ]),
              _: 1
            }, 8, ["open", "aria-label", "menu-name"])
          ]),
          key: "0"
        } : void 0
      ]), 1024);
    };
  }
});
const FilePickerBreadcrumbs = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-ad24ea75"]]);
const _sfc_main$3 = {
  name: "CloseIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$3 = ["aria-hidden", "aria-label"];
const _hoisted_2$2 = ["fill", "width", "height"];
const _hoisted_3$1 = { d: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" };
const _hoisted_4$1 = { key: 0 };
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon close-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3$1, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4$1, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$2))
  ], 16, _hoisted_1$3);
}
const IconClose = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$1]]);
const _sfc_main$2 = {
  name: "MagnifyIcon",
  emits: ["click"],
  props: {
    title: {
      type: String
    },
    fillColor: {
      type: String,
      default: "currentColor"
    },
    size: {
      type: Number,
      default: 24
    }
  }
};
const _hoisted_1$2 = ["aria-hidden", "aria-label"];
const _hoisted_2$1 = ["fill", "width", "height"];
const _hoisted_3 = { d: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" };
const _hoisted_4 = { key: 0 };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("span", mergeProps(_ctx.$attrs, {
    "aria-hidden": $props.title ? null : "true",
    "aria-label": $props.title,
    class: "material-design-icon magnify-icon",
    role: "img",
    onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
  }), [
    (openBlock(), createElementBlock("svg", {
      fill: $props.fillColor,
      class: "material-design-icon__svg",
      width: $props.size,
      height: $props.size,
      viewBox: "0 0 24 24"
    }, [
      createElementVNode("path", _hoisted_3, [
        $props.title ? (openBlock(), createElementBlock("title", _hoisted_4, toDisplayString($props.title), 1)) : createCommentVNode("", true)
      ])
    ], 8, _hoisted_2$1))
  ], 16, _hoisted_1$2);
}
const IconMagnify = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render]]);
const useViews = (isAnonymous) => {
  const allViews = [
    {
      id: "files",
      label: t("All files"),
      icon: mdiFolder
    },
    {
      id: "recent",
      label: t("Recent"),
      icon: mdiClock
    },
    {
      id: "favorites",
      label: t("Favorites"),
      icon: mdiStar
    }
  ];
  const availableViews = isAnonymous.value ? allViews.filter(({ id }) => id === "files") : allViews;
  return {
    allViews,
    availableViews
  };
};
const _hoisted_1$1 = {
  key: 0,
  class: "file-picker__side"
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FilePickerNavigation",
  props: {
    currentView: {},
    filterString: {},
    isCollapsed: { type: Boolean },
    disabledNavigation: { type: Boolean }
  },
  emits: ["update:currentView", "update:filterString"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const { availableViews } = useViews(ref(getCurrentUser() === null));
    const currentViewObject = computed(() => availableViews.filter((v) => v.id === props.currentView)[0] ?? availableViews[0]);
    const updateFilterValue = (value) => emit2("update:filterString", value);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Fragment, null, {
        default: withCtx(() => [
          createVNode(unref(NcTextField), {
            class: "file-picker__filter-input",
            "model-value": _ctx.filterString,
            label: unref(t)("Filter file list"),
            "show-trailing-button": !!_ctx.filterString,
            "onUpdate:modelValue": updateFilterValue,
            onTrailingButtonClick: _cache[0] || (_cache[0] = ($event) => updateFilterValue(""))
          }, {
            "trailing-button-icon": withCtx(() => [
              createVNode(IconClose, { size: 16 })
            ]),
            default: withCtx(() => [
              createVNode(IconMagnify, { size: 16 })
            ]),
            _: 1
          }, 8, ["model-value", "label", "show-trailing-button"]),
          unref(availableViews).length > 1 && !_ctx.disabledNavigation ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            !_ctx.isCollapsed ? (openBlock(), createElementBlock("ul", _hoisted_1$1, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(availableViews), (view) => {
                return openBlock(), createElementBlock("li", {
                  key: view.id
                }, [
                  createVNode(unref(NcButton), {
                    type: _ctx.currentView === view.id ? "primary" : "tertiary",
                    wide: true,
                    onClick: ($event) => _ctx.$emit("update:currentView", view.id)
                  }, {
                    icon: withCtx(() => [
                      createVNode(unref(NcIconSvgWrapper), {
                        path: view.icon,
                        size: 20
                      }, null, 8, ["path"])
                    ]),
                    default: withCtx(() => [
                      createTextVNode(" " + toDisplayString(view.label), 1)
                    ]),
                    _: 2
                  }, 1032, ["type", "onClick"])
                ]);
              }), 128))
            ])) : (openBlock(), createBlock(unref(NcSelect), {
              key: 1,
              "aria-label": unref(t)("Current view selector"),
              clearable: false,
              searchable: false,
              options: unref(availableViews),
              value: currentViewObject.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = (v) => emit2("update:currentView", v.id))
            }, null, 8, ["aria-label", "options", "value"]))
          ], 64)) : createCommentVNode("", true)
        ]),
        _: 1
      });
    };
  }
});
const FilePickerNavigation = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b51bbddb"]]);
function getRecentNodes(client) {
  const controller = new AbortController();
  const lastTwoWeek = Math.round(Date.now() / 1e3) - 60 * 60 * 24 * 14;
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    onCancel(() => controller.abort());
    try {
      const { data } = await client.search("/", {
        signal: controller.signal,
        details: true,
        data: davGetRecentSearch(lastTwoWeek)
      });
      const nodes = data.results.map((result) => davResultToNode(result));
      resolve(nodes);
    } catch (error) {
      reject(error);
    }
  });
}
function getNodes(client, directoryPath) {
  const controller = new AbortController();
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    onCancel(() => controller.abort());
    try {
      const results = await client.getDirectoryContents(join(davRootPath, directoryPath), {
        signal: controller.signal,
        details: true,
        includeSelf: true,
        data: davGetDefaultPropfind()
      });
      const nodes = results.data.map((result) => davResultToNode(result));
      resolve({
        contents: nodes.filter(({ path }) => path !== directoryPath),
        folder: nodes.find(({ path }) => path === directoryPath)
      });
    } catch (error) {
      reject(error);
    }
  });
}
async function getFile(client, path) {
  const { data } = await client.stat(join(davRootPath, path), {
    details: true,
    data: davGetDefaultPropfind()
  });
  return davResultToNode(data);
}
const useDAVFiles = function(currentView, currentPath) {
  const client = davGetClient();
  const files = shallowRef([]);
  const folder = shallowRef(null);
  const isLoading = ref(true);
  const promise = ref(null);
  async function createDirectory(name) {
    const path = join(currentPath.value, name);
    await client.createDirectory(join(davRootPath, path));
    const directory = await getFile(client, path);
    files.value = [...files.value, directory];
    return directory;
  }
  async function loadDAVFiles() {
    if (promise.value) {
      promise.value.cancel();
    }
    isLoading.value = true;
    if (currentView.value === "favorites") {
      promise.value = getFavoriteNodes(client, currentPath.value);
    } else if (currentView.value === "recent") {
      promise.value = getRecentNodes(client);
    } else {
      promise.value = getNodes(client, currentPath.value);
    }
    const content = await promise.value;
    if (content && "folder" in content) {
      folder.value = content.folder;
      files.value = content.contents;
    } else {
      folder.value = null;
      files.value = content;
    }
    promise.value = null;
    isLoading.value = false;
  }
  watch([currentView, currentPath], () => loadDAVFiles());
  onMounted(() => loadDAVFiles());
  return {
    isLoading,
    files,
    folder,
    loadFiles: loadDAVFiles,
    createDirectory
  };
};
const useMimeFilter = function(allowedMIMETypes) {
  const splittedTypes = computed(() => allowedMIMETypes.value.map((filter) => filter.split("/")));
  const isSupportedMimeType = (mime) => {
    const mimeTypeArray = mime.split("/");
    return splittedTypes.value.some(
      ([type, subtype]) => (
        // check mime type matches or is wildcard
        (mimeTypeArray[0] === type || type === "*") && (mimeTypeArray[1] === subtype || subtype === "*")
      )
    );
  };
  return {
    isSupportedMimeType
  };
};
const _hoisted_1 = { class: "file-picker__main" };
const _hoisted_2 = {
  key: 1,
  class: "file-picker__view"
};
const __default__ = {
  name: "FilePicker"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: {
    buttons: {},
    name: {},
    allowPickDirectory: { type: Boolean, default: false },
    disabledNavigation: { type: Boolean, default: false },
    container: { default: "body" },
    filterFn: { type: Function, default: void 0 },
    mimetypeFilter: { default: () => [] },
    multiselect: { type: Boolean, default: true },
    path: { default: void 0 }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit$1 = __emit;
    const isOpen = ref(true);
    const dialogButtons = computed(() => {
      const nodes = selectedFiles.value.length === 0 && props.allowPickDirectory && currentFolder.value ? [currentFolder.value] : selectedFiles.value;
      const buttons = typeof props.buttons === "function" ? props.buttons(nodes, currentPath.value, currentView.value) : props.buttons;
      return buttons.map((button) => ({
        ...button,
        disabled: button.disabled || isLoading.value,
        callback: () => {
          isHandlingCallback = true;
          handleButtonClick(button.callback, nodes);
        }
      }));
    });
    let isHandlingCallback = false;
    const handleButtonClick = async (callback, nodes) => {
      callback(nodes);
      emit$1("close", nodes);
      isHandlingCallback = false;
    };
    const currentView = ref("files");
    const viewHeadline = computed(() => currentView.value === "favorites" ? t("Favorites") : currentView.value === "recent" ? t("Recent") : "");
    const selectedFiles = shallowRef([]);
    const savedPath = ref(window?.sessionStorage.getItem("NC.FilePicker.LastPath") || "/");
    const navigatedPath = ref("");
    watch([navigatedPath], () => {
      if (props.path === void 0 && navigatedPath.value) {
        window.sessionStorage.setItem("NC.FilePicker.LastPath", navigatedPath.value);
      }
      selectedFiles.value = [];
    });
    const currentPath = computed({
      get: () => {
        return currentView.value === "files" ? navigatedPath.value || props.path || savedPath.value : "/";
      },
      set: (path) => {
        navigatedPath.value = path;
      }
    });
    const filterString = ref("");
    const { isSupportedMimeType } = useMimeFilter(toRef(props, "mimetypeFilter"));
    const {
      files,
      folder: currentFolder,
      isLoading,
      loadFiles,
      createDirectory
    } = useDAVFiles(currentView, currentPath);
    onMounted(() => loadFiles());
    const { showHiddenFiles } = useFilesSettings();
    const filteredFiles = computed(() => {
      let filtered = files.value;
      if (!showHiddenFiles.value) {
        filtered = filtered.filter((file) => !file.basename.startsWith("."));
      }
      if (props.mimetypeFilter.length > 0) {
        filtered = filtered.filter((file) => file.type === "folder" || file.mime && isSupportedMimeType(file.mime));
      }
      if (filterString.value) {
        filtered = filtered.filter((file) => file.basename.toLowerCase().includes(filterString.value.toLowerCase()));
      }
      if (props.filterFn) {
        filtered = filtered.filter((f) => props.filterFn(f));
      }
      return filtered;
    });
    const noFilesDescription = computed(() => {
      if (currentView.value === "files") {
        return t("Upload some content or sync with your devices!");
      } else if (currentView.value === "recent") {
        return t("Files and folders you recently modified will show up here.");
      } else {
        return t("Files and folders you mark as favorite will show up here.");
      }
    });
    const onCreateFolder = async (name) => {
      try {
        const folder = await createDirectory(name);
        navigatedPath.value = folder.path;
        emit("files:node:created", files.value.filter((file) => file.basename === name)[0]);
      } catch (error) {
        console.warn("Could not create new folder", { name, error });
        showError(t("Could not create the new folder"));
      }
    };
    const handleClose = (open) => {
      if (!open && !isHandlingCallback) {
        emit$1("close");
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NcDialog), {
        open: isOpen.value,
        "onUpdate:open": [
          _cache[6] || (_cache[6] = ($event) => isOpen.value = $event),
          handleClose
        ],
        container: _ctx.container,
        buttons: dialogButtons.value,
        name: _ctx.name,
        size: "large",
        "content-classes": "file-picker__content",
        "dialog-classes": "file-picker",
        "navigation-classes": "file-picker__navigation"
      }, {
        navigation: withCtx(({ isCollapsed }) => [
          createVNode(FilePickerNavigation, {
            "current-view": currentView.value,
            "onUpdate:currentView": _cache[0] || (_cache[0] = ($event) => currentView.value = $event),
            "filter-string": filterString.value,
            "onUpdate:filterString": _cache[1] || (_cache[1] = ($event) => filterString.value = $event),
            "is-collapsed": isCollapsed,
            "disabled-navigation": _ctx.disabledNavigation
          }, null, 8, ["current-view", "filter-string", "is-collapsed", "disabled-navigation"])
        ]),
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1, [
            currentView.value === "files" ? (openBlock(), createBlock(FilePickerBreadcrumbs, {
              key: 0,
              path: currentPath.value,
              "onUpdate:path": _cache[2] || (_cache[2] = ($event) => currentPath.value = $event),
              "show-menu": _ctx.allowPickDirectory,
              onCreateNode: onCreateFolder
            }, null, 8, ["path", "show-menu"])) : (openBlock(), createElementBlock("div", _hoisted_2, [
              createElementVNode("h3", null, toDisplayString(viewHeadline.value), 1)
            ])),
            unref(isLoading) || filteredFiles.value.length > 0 ? (openBlock(), createBlock(FileList, {
              key: 2,
              path: currentPath.value,
              "onUpdate:path": [
                _cache[3] || (_cache[3] = ($event) => currentPath.value = $event),
                _cache[5] || (_cache[5] = ($event) => currentView.value = "files")
              ],
              "selected-files": selectedFiles.value,
              "onUpdate:selectedFiles": _cache[4] || (_cache[4] = ($event) => selectedFiles.value = $event),
              "allow-pick-directory": _ctx.allowPickDirectory,
              "current-view": currentView.value,
              files: filteredFiles.value,
              multiselect: _ctx.multiselect,
              loading: unref(isLoading),
              name: viewHeadline.value
            }, null, 8, ["path", "selected-files", "allow-pick-directory", "current-view", "files", "multiselect", "loading", "name"])) : filterString.value ? (openBlock(), createBlock(unref(NcEmptyContent), {
              key: 3,
              name: unref(t)("No matching files"),
              description: unref(t)("No files matching your filter were found.")
            }, {
              icon: withCtx(() => [
                createVNode(IconFile)
              ]),
              _: 1
            }, 8, ["name", "description"])) : (openBlock(), createBlock(unref(NcEmptyContent), {
              key: 4,
              name: unref(t)("No files in here"),
              description: noFilesDescription.value
            }, {
              icon: withCtx(() => [
                createVNode(IconFile)
              ]),
              _: 1
            }, 8, ["name", "description"]))
          ])
        ]),
        _: 1
      }, 8, ["open", "container", "buttons", "name"]);
    };
  }
});
const FilePicker = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a79cb502"]]);
export {
  FilePicker as default
};
