const { transform } = require('@babel/core')

// todo hmr
function transformVueJsx (
  code,
  id,
  jsxOptions,
) {
  const plugins = [
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [
      require.resolve('@babel/plugin-proposal-class-properties'),
      { loose: true },
    ],
  ]
  if (/\.tsx$/.test(id)) {
    plugins.unshift([
      require.resolve('@babel/plugin-transform-typescript'),
      { isTSX: true, allowExtensions: true, allowDeclareFields: true },
    ])
  }

  const result = transform(code, {
    presets: [[require.resolve('@vue/babel-preset-jsx'), jsxOptions]],
    sourceFileName: id,
    filename: id,
    sourceMaps: true,
    plugins,
    babelrc: false,
    configFile: false,
  })

  return {
    code: result.code,
    map: result.map,
  }
}

module.exports = {
  transformVueJsx,
}
