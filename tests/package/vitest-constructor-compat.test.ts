import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { glob } from 'glob';

const projectRoot = resolve(import.meta.dirname, '../..');

const BROWSER_CONSTRUCTORS = new Set([
  'FileReader',
  'Image',
  'IntersectionObserver',
  'MutationObserver',
  'ResizeObserver',
  'WebSocket',
  'Worker',
  'XMLHttpRequest',
]);

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  let current = expression;
  while (
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
};

const isViFnCall = (expression: ts.Expression): boolean => {
  const current = unwrapExpression(expression);
  return (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression) &&
    ts.isIdentifier(current.expression.expression) &&
    current.expression.expression.text === 'vi' &&
    current.expression.name.text === 'fn'
  );
};

const findViFnConstructorMocks = (source: string, fileName: string): string[] => {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const variableInitializers = new Map<string, ts.Expression[]>();
  const findings: string[] = [];

  const collectVariables = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const initializers = variableInitializers.get(node.name.text) ?? [];
      initializers.push(node.initializer);
      variableInitializers.set(node.name.text, initializers);
    }
    ts.forEachChild(node, collectVariables);
  };
  collectVariables(sourceFile);

  const inspectCalls = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'vi' &&
      node.expression.name.text === 'stubGlobal' &&
      node.arguments.length >= 2
    ) {
      const [globalNameNode, replacementNode] = node.arguments;
      const globalName =
        globalNameNode && ts.isStringLiteralLike(globalNameNode) ? globalNameNode.text : undefined;
      const replacement = replacementNode ? unwrapExpression(replacementNode) : undefined;
      const usesViFn =
        replacement &&
        (isViFnCall(replacement) ||
          (ts.isIdentifier(replacement) &&
            (variableInitializers.get(replacement.text) ?? []).some(isViFnCall)));

      if (globalName && BROWSER_CONSTRUCTORS.has(globalName) && usesViFn) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        findings.push(`${fileName}:${line + 1} ${globalName}`);
      }
    }
    ts.forEachChild(node, inspectCalls);
  };
  inspectCalls(sourceFile);

  return findings;
};

describe('Vitest 构造器替身兼容性', () => {
  it('能够识别通过标识符间接注入的 vi.fn 构造器', () => {
    const source = `
      const ResizeObserverMock = vi.fn(() => ({ observe() {}, disconnect() {} }));
      vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    `;

    expect(findViFnConstructorMocks(source, 'fixture.test.ts')).toEqual([
      'fixture.test.ts:3 ResizeObserver',
    ]);
  });

  it('所有浏览器构造器替身都使用真实 class', async () => {
    const testFiles = await glob('tests/**/*.ts', {
      cwd: projectRoot,
      absolute: true,
      windowsPathsNoEscape: true,
    });
    const findings = (
      await Promise.all(
        testFiles.map(async file => findViFnConstructorMocks(await readFile(file, 'utf8'), file))
      )
    ).flat();

    expect(findings).toEqual([]);
  });
});
