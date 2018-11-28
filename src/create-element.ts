/*!
 * use config to create vNode
 * @bqliu
 */

import { VNode, VText, VNodeProps } from './vnode'

export default function createElement(
  tagName: string,
  props?: VNodeProps,
  children?: Array<VNode | VText | null>
): VNode {
  return {
    tagName,
    props,
    children
  }
};
