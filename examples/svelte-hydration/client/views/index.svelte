<script>
import { Link } from 'svelte-navigator'
import { todoList } from '../state.js'

export let value

function addItem () {
  $todoList = [...$todoList, value]
  value = ''
}
</script>

<ul>
  {#each $todoList as item, i}
    <li>{item}</li>
  {/each}
  </ul>
<div>
  <input bind:value />
  <button on:click={addItem}>Add</button>
</div>
<p>
  <Link to="/other">Go to another page</Link>
</p>
