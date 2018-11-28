import { VNode, VText, VNodeProps } from "./vnode";
import renderToHTML from "./render-to-html";

interface IPatch<T, U> {
  type: T,
  payload?: U,
  children?: Array<Patch | null>
}

export enum PatchType {
  REPLACE,    // include: remove => new vNode is null && replace => new vNode is the payload
  PROPS,      // if some props changed
  TEXT,       // if the core content changed
  REORDER     // if the order changed(not consider now)
};

type PatchReplacePayload = VNode | VText | null
type PatchPropsPayload = VNodeProps | null
type PatchTextPayload = VText | null
type PatchReorderPayload = VNode | VText | null

type PatchReplace = IPatch<PatchType.REPLACE, PatchReplacePayload>
type PatchProps = IPatch<PatchType.PROPS, PatchPropsPayload>
type PatchText = IPatch<PatchType.TEXT, PatchTextPayload>
type PatchReorder = IPatch<PatchType.REORDER, PatchReorderPayload>

export type Patch = PatchReplace | PatchProps | PatchText | PatchReorder

// if null, do nothing
// if Patch, see the Patch comment
export type ValidPatch = Patch | null

export type Patches = Array<ValidPatch>

function removeNode(node: Node): void {
  const parentNode = node.parentNode;
  if (!parentNode) {
    return;
  }
  parentNode.removeChild(node);
}

function replaceNode(newNode: Node, oldNode: Node): void {
  const parentNode = oldNode.parentNode;
  if (!parentNode) {
    return;
  }
  parentNode.replaceChild(newNode, oldNode);
}

function patchChildren(node: Node, patch: Patch) {
  if (patch.children) {
    const domChildNodes = [].slice.call(node.childNodes);
    patch.children.forEach((patch, index) => {
      applyPatch(domChildNodes[index], patch);
    })
  }
}

export function applyPatch(dom: Node | null, patch: Patch | null): void {
  if (!dom || !patch) {
    return;
  }
  const { type } = patch;
  switch (type) {
    case PatchType.REPLACE: {
      // use payload to replace
      const payload = <PatchReplacePayload>patch.payload;
      if (!payload) {
        // remove
        removeNode(dom);
      } else if (typeof payload === 'string') {
        dom.textContent = payload;
      } else {
        const fragment = renderToHTML(payload);
        replaceNode(fragment, dom);
      }
      break;
    }
    case PatchType.TEXT: {
      const payload = <PatchTextPayload>patch.payload;
      if (!payload) {
        break;
      }
      // use payload to modify content
      dom.textContent = payload;
      break;
    }
    case PatchType.PROPS: {
      if (dom.nodeType !== Node.ELEMENT_NODE) {
        // not element node, no prop changed
        break;
      }

      const payload = <PatchPropsPayload>patch.payload;
      if (!payload) {
        break;
      }
      // because of type...
      // hard to specify......
      const { id, className } = payload;
      if (id) { (<Element>dom).id = id }
      if (className) { (<Element>dom).className = className }
      // modify DOM props
      break;
    }
    case PatchType.REORDER:
      // reorder children
      break;
    default:
      throw new Error(`Patch is invalid PatchType: ${type}`)
  }
  patchChildren(dom, patch);
}
