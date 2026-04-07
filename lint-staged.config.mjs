import path from 'node:path'

const vueExampleDirs = [
  'examples/vue-hydration',
  'examples/vue-next-mini',
  'examples/vue-streaming',
  'examples/vue-vanilla',
  'examples/vue-vanilla-spa',
  'examples/vue-vanilla-ts',
]

const lintableExtensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'])

const formattableExtensions = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.vue',
  '.json',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
  '.html',
  '.css',
  '.scss',
  '.less',
])

function quote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`
}

function joinArgs(args) {
  return args.map(quote).join(' ')
}

export default {
  '**/*': (stagedFiles) => {
    const commands = []
    const uniqueFiles = [...new Set(stagedFiles)].sort()

    const lintFiles = uniqueFiles.filter((file) => lintableExtensions.has(path.extname(file)))
    if (lintFiles.length > 0) {
      commands.push(`pnpm exec oxlint --fix ${joinArgs(lintFiles)}`)
    }

    for (const dir of vueExampleDirs) {
      const eslintFiles = uniqueFiles.filter((file) => {
        if (!file.startsWith(`${dir}/`)) {
          return false
        }

        return ['.js', '.mjs', '.ts', '.vue'].includes(path.extname(file))
      })

      if (eslintFiles.length > 0) {
        const relativeFiles = eslintFiles.map((file) => path.relative(dir, file))
        commands.push(`pnpm --dir ${quote(dir)} exec eslint --fix ${joinArgs(relativeFiles)}`)
      }
    }

    const formatFiles = uniqueFiles.filter((file) => formattableExtensions.has(path.extname(file)))
    if (formatFiles.length > 0) {
      commands.push(`pnpm exec oxfmt --write ${joinArgs(formatFiles)}`)
    }

    return commands
  },
}
