import htmx from 'htmx.org'

void {
  ...import.meta.glob('/**/*.{jsx,tsx}'),
}

window.htmx = htmx
