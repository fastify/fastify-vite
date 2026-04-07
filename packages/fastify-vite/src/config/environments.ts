function createClientEnvironment(dev: boolean, outDir: string) {
  return {
    build: {
      outDir: `${outDir}/client`,
      minify: !dev,
      sourcemap: dev,
      manifest: true,
    },
  }
}

function createSSREnvironment(dev: boolean, outDir: string, clientModule: string) {
  return {
    build: {
      outDir: `${outDir}/server`,
      ssr: true,
      minify: !dev,
      sourcemap: dev,
      emitAssets: true,
      rollupOptions: {
        input: {
          index: clientModule,
        },
      },
    },
  }
}

export { createClientEnvironment, createSSREnvironment }
