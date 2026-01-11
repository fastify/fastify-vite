export interface RendererInfo {
  path: string
}

export interface SetupOptions {
  root: string
  renderer: RendererInfo
}

/**
 * Creates an HTML template function from source HTML.
 * The returned function accepts an object with template variables
 * and returns the compiled HTML string.
 */
export declare function createHtmlTemplateFunction(
  source: string,
): Promise<(context?: Record<string, unknown>) => string>

/**
 * Ensures the Vite config file exists, copying from renderer blueprint if needed.
 * @returns The path to the config file
 */
export declare function ensureConfigFile(base: string, options: SetupOptions): Promise<string>

/**
 * Ejects the renderer blueprint files to the project root.
 */
export declare function ejectBlueprint(base: string, options: SetupOptions): Promise<void>
