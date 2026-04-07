---
"@fastify/vite": major
---

Remove html-rewriter-wasm dependency

Replaces the stale html-rewriter-wasm dependency (last updated Feb 2022) with regex-based
string operations. This removes a WebAssembly dependency that was marked as inactive by Snyk.

**Breaking change:** The undocumented `#varName#` attribute placeholder syntax has been removed.
This feature only existed in tests and was not documented or used in production code. If you
were using `<element attr="#varName#">` syntax, switch to the standard comment syntax
`<!-- varName -->` instead.

The `createHtmlTemplateFunction` export is now synchronous instead of async. Existing code
using `await` will continue to work, but you can remove the `await` for a minor performance
improvement.
