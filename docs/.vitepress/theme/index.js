import DefaultTheme from 'vitepress/dist/client/theme-default'

import './styles/vars.css'
import './styles/nav-bar.css'
import './styles/layout.css'
import './styles/code.css'
import './styles/demo.css'
import './styles/custom-blocks.css'
import './styles/sidebar-links.css'
import './styles/prism.css'
import './styles/utils.css'

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', true)
}

export default {
  ...DefaultTheme
}
