/*!
 * use vNode to create element
 * @bqliu
 */

import { VNode, VText } from './vnode'

function renderTextNode(text: VText): Node {
  return document.createTextNode(text)
}

// root must be a DOM Element
export default function renderToHTML(vNode: VNode | null): DocumentFragment {
  const fragment: DocumentFragment = document.createDocumentFragment();
  if (!vNode) {
    return fragment
  }
  const { tagName, props, children } = vNode;
  const el: HTMLElement = document.createElement(tagName);

  if (props) {
    const { id, className } = props;

    if (id) { el.id = id }
    if (className) { el.className = className }
  }

  if (children) {
    children.forEach((vNode) => {
      if (typeof vNode === 'string') {
        el.appendChild(renderTextNode(vNode))
        return
      }
      el.appendChild(renderToHTML(vNode));
    })
  }

  fragment.appendChild(el)
  
  return fragment;
}
