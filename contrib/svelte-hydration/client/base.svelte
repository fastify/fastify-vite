<script>
import './base.css'
import routes from './routes.js'
import { todoList } from './state.js'
import { Router, Route } from "svelte-navigator";

export let url = ""
export let data

// Hydrate todoList from the SSR context data
$todoList = [...$todoList, ...data.todoList]
</script>

<Router url="{url}">
  {#each routes as { path, component: Component }}
    <Route path="{path}" component="{Component}" />
  {/each}
</Router>
