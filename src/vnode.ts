export interface VNodeProps {
  id?: string;
  className?: string;
};

export type VText = string;

export interface VNode {
  tagName: string;
  key?: string;
  props?: VNodeProps;
  children?: Array<VNode | VText | null>;
};
