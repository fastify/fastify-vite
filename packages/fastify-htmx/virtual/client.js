import htmx from 'htmx.org'

void {
  ...import.meta.glob('/**/*.css'),
  ...import.meta.glob('/**/*.svg'),
  ...import.meta.glob('/**/*.client.js'),
}

window.htmx = htmx
