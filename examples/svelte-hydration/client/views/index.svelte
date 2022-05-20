<script>
import { Link } from 'svelte-routing'
export let data = null
</script>

<ul>
  {#each data.todoList as item, i}
    <li>{item}</li>
  {/each}
  </ul>
<div>
  <!--input ref={input} /-->
  <!--button onClick={addItem}>Add</button-->
</div>
<p>
  <Link to="/other">Go to another page</Link>
</p>
