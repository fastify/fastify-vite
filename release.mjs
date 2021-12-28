
// See test() for expected behavior

import check from 'brittle'
import semver from 'semver'

const help = (
  'Usage: npx zx release.mjs [patch|minor|major|premajor] [--alpha|--beta] [--dry]'
)

if (process.argv.includes('--test')) {
  await test()
} else {
  await main()
}

function bump (currentRelease, releaseType, tag) {
  const supportedReleaseTypes = ['patch', 'minor', 'major']

  let [
    parsedRelease,
    currentTag,
    tagVersion
  ] = extractTag(currentRelease)

  let bumped

  if (currentTag) {
    if (releaseType === 'premajor') {
      bumped = `${parsedRelease}-${currentTag}.${++tagVersion}`
      tag = currentTag
    } else if (releaseType === 'major') {
      bumped = parsedRelease
    } else {
      throw new Error('Tagged releases can only be incremented or bumped to major.')
    }
  } else if (releaseType === 'premajor') {
    if (!tag) {
      throw new Error('Must specify either --alpha or --beta for a new premajor release.') 
    }
    bumped = `${semver.inc(parsedRelease, 'major')}-${tag}.0`
  } else if (supportedReleaseTypes.includes(releaseType)) {
    bumped = semver.inc(parsedRelease, releaseType)
  } else {
    throw new Error(`Supported release types: ${supportedReleaseTypes.join(', ')}.`)
  }

  return [bumped, tag]
}

async function main () {
  if (!process.argv[3]) {
    throw new Error(help)
  }

  const { dry, tag } = parseFlags()
  const pkgInfo = await fs.readFile('packages/fastify-vite/package.json', 'utf8')
  const [newVersion, newTag] = await bump(JSON.parse(pkgInfo).version, process.argv[3], tag)

  for (const examplePackage of await globby('examples/*/package.json')) {
    const pkgInfo = JSON.parse(await fs.readFile(examplePackage, 'utf8'))
    for (const [dep, version] of Object.entries(pkgInfo.dependencies)) {
      if (dep.includes('fastify-vite')) {
        pkgInfo.dependencies[dep] = `^${newVersion}`
      }
    }
    await fs.writeFile(examplePackage, JSON.stringify(pkgInfo, null, 2))
  }

  for (const rendererPackage of await globby('packages/fastify-vite*/package.json')) {
    const pkgInfo = JSON.parse(await fs.readFile(rendererPackage, 'utf8'))
    pkgInfo.version = newVersion
    await fs.writeFile(rendererPackage, JSON.stringify(pkgInfo, null, 2))
    if (!dry && !process.argv.includes('--dry')) {
      if (newTag) {
        await $`npm publish ./${path.dirname(rendererPackage)} --tag ${newTag}`
      } else {
        await $`npm publish ./${path.dirname(rendererPackage)}`
      }
    }
  }
}

function test () {
  check('patch', ({is}) => {
    is(bump('0.0.1', 'patch') , '0.0.2')
  })
  check('minor', ({is}) => {
    is(bump('0.0.1', 'minor') , '0.1.0')
  })
  check('major', ({is}) => {
    is(bump('0.0.1', 'major') , '1.0.0')
  })
  check('new premajor', ({is}) => {
    is(bump('0.0.1', 'premajor', 'alpha') , '1.0.0-alpha.0')
  })
  check('premajor increment', ({is}) => {
    is(bump('1.0.0-alpha.0', 'premajor') , '1.0.0-alpha.1')
  })
  check('premajor to major', ({is}) => {
    is(bump('1.0.0-alpha.0', 'major') , '1.0.0')
  })
}

function extractTag (version) {
  const match = version.match(/^(.+?)(?:-((?:alpha)|(?:beta))\.(\d+))?$/)
  if (match) {
    return [match[1], match[2], Number(match[3])]
  } else {
    return [match[1], null, 0]
  }
}

function parseFlags () {
  const dry = process.argv.includes('--dry')
  const alpha = process.argv.includes('--alpha')
  const beta = process.argv.includes('--beta')
  return {
    dry,
    tag: (alpha && 'alpha') || (beta && 'beta') || null,
  }
}
