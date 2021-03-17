import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';

function depthToString(depth: number): string {
  return Array(depth).fill('  ').join('');
}

function paramsToHtml(value: ReactTestRendererJSON, depth: number = 0): string {
  if (!value.props) {
    return '';
  }

  const depth1 = depthToString(depth + 1);
  const depth2 = depthToString(depth + 2);
  const params = Object.entries(value.props)
    .filter(([, value]) => value != null)
    .map(([key, value]) => {
      if (typeof value === 'function') {
        return `${key}={[Function]}`;
      }

      if (typeof value === 'object') {
        const name = value.constructor.name;
        const object = JSON.stringify(value, null, 2)
          .replace(/\n/g, `\n${depth2}`)
          .trim();

        return `${key}={\n${depth2}${name} ${object}\n${depth1}}`;
      }

      return `${key}="${value}"`;
    })
    .join(`\n${depth1}`);

  if (!params) {
    return '';
  }

  return `\n${depth1}${params}\n${depthToString(depth)}`;
}

function childrenToHtml(value: ReactTestRendererJSON, depth: number = 0): string {
  if (!value.children) {
    return '/';
  }

  const depth1 = depthToString(depth);
  const depth2 = depthToString(depth + 1);
  const children = value.children
    .map((v) => jsonToHtml(v, depth + 1))
    .join(`\n${depth2}`);

  return `>\n${depth2}${children}\n${depth1}</${value.type}`;
}

function jsonToHtml(
  value: ReactTestRendererJSON | string | ReactTestRendererJSON[] | null,
  depth: number = 0,
): string {
  if (!value) {
    return '';
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Array) {
    return value.map((v) => jsonToHtml(v, depth + 1)).join('\n');
  }

  return `<${value.type}${paramsToHtml(value, depth)}${childrenToHtml(value, depth)}>`;
}

export function treeToSnapshot(tree: ReactTestRenderer): string {
  return `\n${jsonToHtml(tree.toJSON())}\n`;
}
