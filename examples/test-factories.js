import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { assert, expect } from 'vitest'
import { execaCommand } from 'execa'

export function makeIndexTest ({ main, dev }) {
  return async () => {
    const server = await main(dev)
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toBe(200)
    await server.vite.devServer?.close()
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
  
    expect(clientStdout).toContain(`✓ ${clientModules} modules transformed`)
    expect(serverStdout).toContain(`✓ ${serverModules} modules transformed`)
  }
}

export function makeSPABuildTest ({ cwd, clientModules }) {
  return async () => {
    const { scripts: { build } } = JSON.parse(
      await readFile(join(cwd, 'package.json'), 'utf8')
    )
    const { stdout } = await execaCommand(`npx ${build}`, { cwd })
    expect(stdout).toContain(`✓ ${clientModules} modules transformed`)
  }
}
