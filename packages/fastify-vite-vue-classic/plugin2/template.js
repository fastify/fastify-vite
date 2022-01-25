import * as vueTemplateCompiler from 'vue-template-compiler'
import { createRollupError } from './utils/error'
import { compileTemplate } from './template/compileTemplate'
import hash from 'hash-sum'

export function compileSFCTemplate (
  source,
  block,
  filename,
  { isProduction, vueTemplateOptions = {} },
  pluginContext,
) {
  const { tips, errors, code } = compileTemplate({
    source,
    filename,
    compiler: vueTemplateCompiler,
    transformAssetUrls: true,
    transformAssetUrlsOptions: {
      forceRequire: true,
    },
    isProduction,
    isFunctional: !!block.attrs.functional,
    optimizeSSR: false,
    prettify: false,
    preprocessLang: block.lang,
    ...vueTemplateOptions,
    compilerOptions: {
      whitespace: 'condense',
      ...(vueTemplateOptions.compilerOptions || {}),
    },
  })

  if (tips) {
    tips.forEach((warn) =>
      pluginContext.warn({
        id: filename,
        message: typeof warn === 'string' ? warn : warn.msg,
      }),
    )
  }

  if (errors) {
    const generateCodeFrame = vueTemplateCompiler.generateCodeFrame
    errors.forEach((error) => {
      // 2.6 compiler outputs errors as objects with range
      if (
        generateCodeFrame &&
        vueTemplateOptions.compilerOptions?.outputSourceRange
      ) {
        const { msg, start, end } = error
        return pluginContext.error(
          createRollupError(filename, {
            message: msg,
            frame: generateCodeFrame(source, start, end),
          }),
        )
      } else {
        pluginContext.error({
          id: filename,
          message: typeof error === 'string' ? error : error.msg,
        })
      }
    })
  }

  // rewrite require calls to import on build
  return {
    code:
      transformRequireToImport(code) + '\nexport { render, staticRenderFns }',
    map: null,
  }
}

export function transformRequireToImport (code) {
  const imports = {}
  let strImports = ''

  code = code.replace(
    /require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g,
    (_, name) => {
      if (!(name in imports)) {
        // #81 compat unicode assets name
        imports[name] = `__$_require_${hash(name)}__`
        strImports += 'import ' + imports[name] + ' from ' + name + '\n'
      }

      return imports[name]
    },
  )

  return strImports + code
}
