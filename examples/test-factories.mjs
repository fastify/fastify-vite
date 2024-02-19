import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { execaCommand } from 'execa'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const pluginFn = main.default || main
    const server = await main(dev)
    await server.vite.devServer?.close()
    const response = await server.inject({ method: 'GET', url: '/' })
    assert.strictEqual(response.statusCode, 200)
   }
}

export function makeSSRBuildTest ({ cwd, clientModules, serverModules }) {
  return async () => {
    const {
      scripts: {
        ['build:client']: buildClient,
        ['build:server']: buildServer
      }
    } = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'))
    
    const { stdout: clientStdout } = await execaCommand(`npx ${buildClient}`, { cwd })
    const { stdout: serverStdout } = await execaCommand(`npx ${buildServer}`, { cwd })

    assert.ok(clientStdout.includes(`${clientModules} modules transformed`))
    assert.ok(serverStdout.includes(`${serverModules} modules transformed`))
  }
}

export function makeSPABuildTest ({ cwd, clientModules }) {
  return async () => {
    const { scripts: { build } } = JSON.parse(
      await readFile(join(cwd, 'package.json'), 'utf8')
    )
    const { stdout } = await execaCommand(`npx ${build}`, { cwd })
    assert.ok(stdout.includes(`${clientModules} modules transformed`))
  }
}
