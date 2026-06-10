import { stripTypeScriptTypes } from 'node:module'
import * as acorn from 'acorn'
import * as walk from 'acorn-walk'

export function parseStateKeys(code: string): string[] {
  const jsCode = stripTypeScriptTypes(code, { sourceMap: false })
  const ast = acorn.parse(jsCode, { sourceType: 'module', ecmaVersion: 2020 })

  let objectKeys: string[] = []

  walk.simple(ast, {
    ExportNamedDeclaration(node: acorn.ExportNamedDeclaration) {
      if (!node.declaration) {
        return
      }
      if (node.declaration.type === 'FunctionDeclaration') {
        for (const subNode of node.declaration.body.body) {
          if (subNode.type === 'ReturnStatement' && subNode.argument?.type === 'ObjectExpression') {
            objectKeys = extractObjectKeys(subNode.argument)
          }
        }
      } else if (node.declaration.type === 'VariableDeclaration') {
        for (const subNode of node.declaration.declarations) {
          if (
            subNode.type === 'VariableDeclarator' &&
            subNode.init?.type === 'ArrowFunctionExpression' &&
            subNode.init.body.type === 'ObjectExpression'
          ) {
            objectKeys = extractObjectKeys(subNode.init.body)
          }
        }
      }
    },
  })

  return objectKeys
}

function extractObjectKeys(node: acorn.ObjectExpression): string[] {
  const keys: string[] = []
  for (const prop of node.properties) {
    if (prop.type === 'Property' && prop.key.type === 'Identifier') {
      keys.push(prop.key.name)
    }
  }
  return keys
}
