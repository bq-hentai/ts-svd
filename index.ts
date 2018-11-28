/*!
 * simple test of `createElement`, `renderToHTML`, `diff`, `patch`
 * @bqliu
 */

import './main.css';

import h from './src/create-element';
import { VNode } from './src/vnode';
import renderToHTML from './src/render-to-html';
import diff from './src/diff';
import { applyPatch } from './src/patch';

const vNode: VNode = h(
  'div',
  { id: 'wrapper', className: 'wrapper' },
  [
    h('span', { className: 'first' }, [ 'First child' ]),
    'Second-content',
    'Third-content',
    h('p', { className: 'fourth' }, [ 'Fourth child' ]),
    'last'
  ]
);

const rootDOMFragment = renderToHTML(vNode);

const newVNode: VNode = h(
  'div',
  { id: 'new-wrapper' },
  [
    null,
    'fake second',
    h('span', { className: 'third' }, [ 'new third child' ]),
    h(
      'span',
      { id: 'fake_fourth', className: 'fake-fourth' },
      [
        'leaf',
        h('span', { id: 'leaf_span_second' }, ['leaf-last'])
      ]
    ),
    'last'
  ]
);

const rootDOM = rootDOMFragment.firstElementChild;

if (rootDOM) {
  document.body.appendChild(rootDOM);

  setTimeout(function () {
    const patch = diff(newVNode, vNode);
    console.log('diff', patch);
    if (!patch) {
      return;
    }
    // first child must be an HTMLElement
    applyPatch(rootDOM, patch);
  }, 1 * 1000);
}
