/*!
 * diff two vNodes to generate patch
 * @bqliu
 */

import { VNode, VNodeProps, VText } from "./vnode";
import { PatchType, ValidPatch } from "./patch";

// root must be a VNode, not VText
export default function diff(newVNode: VNode, oldVNode: VNode): ValidPatch {
  const patch = diffCore(newVNode, oldVNode);

  if (!patch) {
    return null;
  }

  const oldVNodeChildren = oldVNode.children || [ ];
  
  patch.children = [ ];

  if (newVNode.children) {
    newVNode.children.forEach((vNode, index) => {
      const oldVNode = oldVNodeChildren[index];
      const patchChildren = <Array<ValidPatch>>patch.children
      // newVNode and oldVNode must be VNode
      if (vNode && oldVNode && typeof vNode !== 'string' && typeof oldVNode !== 'string') {
        patchChildren[index] = diff(vNode, oldVNode);
        return;
      }
      // newVNode and oldVNode may be VText/null/VNode
      // but they can't be all VNode, use newVNode as the patch
      if (typeof vNode === 'string' && typeof oldVNode === 'string') {
        if (vNode === oldVNode) {
          patchChildren[index] = null;
          return;
        }
        patchChildren[index] = {
          type: PatchType.TEXT,
          payload: vNode
        };
        return;
      }
      // otherwise, REPLACE
      patchChildren[index] = {
        type: PatchType.REPLACE,
        payload: vNode
      };
    })
  }
  return patch;
}

function diffCore(newVNode: VNode | VText | null, oldVNode: VNode | VText | null): ValidPatch {
  // if oldVNode is not exist, the patch is newVNode
  // if oldVNode is VText, the patch is newVNode
  // if newNode is not exist, the patch is newVNode(i.e, null)
  // if newVNode is VText, the patch is newVnode
  if (
    !oldVNode || isVText(oldVNode) ||
    !newVNode || isVText(newVNode)
  ) {
    // if text change
    if (isVText(oldVNode) && isVText(newVNode)) {
      if (oldVNode === newVNode) {
        return null
      }
      return {
        type: PatchType.TEXT,
        payload: <VText>newVNode
      }
    }
    return {
      type: PatchType.REPLACE,
      payload: newVNode
    };
  }

  // props changed
  // must be VNode
  // compare the props
  const { tagName: newTagName, props: newProps } = <VNode>newVNode;
  const { tagName: oldTagName, props: oldProps } = <VNode>oldVNode;

  // tag diff
  if (oldTagName !== newTagName) {
    return {
      type: PatchType.REPLACE,
      payload: newVNode
    }
  }

  const propsPatch = diffProps(newProps, oldProps);
  
  return propsPatch;
}

function diffProps(newProps?: VNodeProps, oldProps?: VNodeProps): ValidPatch {
  // do nothing
  if (oldProps === newProps) {
    return null
  }
  if (!oldProps || !newProps) {
    return {
      type: PatchType.PROPS,
      payload: newProps || null // don't use undefined
    }
  }
  // const patchedProps: VNodeProps = <VNodeProps>{ }

  // only old Or new props all exist, comparation is meaningful
  // use newProps, instead of diff
  // of course, if diff, we can get minimal prop patch, even null(no prop changed)
  const payload = Object.keys(newProps).reduce((acc, prop) => {
    acc[<keyof VNodeProps>prop] = newProps[<keyof VNodeProps>prop]

    return acc
  }, <VNodeProps>{ })

  return {
    type: PatchType.PROPS,
    payload
  }
}

function isVText(x: any): boolean {
  return typeof x === 'string';
}
