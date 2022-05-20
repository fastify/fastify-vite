<script>
import './base.css'
import routes from './routes.js'
import { Router, Route } from 'svelte-routing'

export let url = ""
export let data = null
</script>

<Router url="{url}">
  {#each routes as { path, component: Component }}
    <Route path="{path}">
      <Component data="{data}" />
    </Route>
  {/each}
</Router>
