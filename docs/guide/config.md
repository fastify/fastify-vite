
# Configuration

**fastify-vite** tries to intefere as little as possible in configuring your
Vite apps. 

So if you want to just have `vite.config.js` for all Vite settings,
that will just work as expected. However, you can also use the `vite` key
when passing options to the `fastify.register()` call.

[Here](...) you can see the internal `options.js`, which lists all defaults too.

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Required</strong>
<br><br>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">dev</code>
—— <code>process.env.NODE​&lowbar;ENV !== 'production'</code>
<br><br>
<code class="h inline-block">hydration.global</code>
—— <code>'$global'</code>
<br><br>
<code class="h inline-block">hydration.payload</code>
—— <code>'$payload'</code>
<br><br>
<code class="h inline-block">hydration.data</code>
 —— <code>'$data'</code>
<br><br>
<code class="h inline-block">root</code>
—— The Vite client app's source root
<br><br>
<code class="h inline-block">renderer</code>
—— <b>fastify-vite</b>'s <a href="./renderers">renderer adapter</a>
<br><br>
</td>
</tr>
</table>

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Optional</strong>
<br><br>
</td>
<td>
<code class="h inline-block">entry.client</code>
—— The Vite client app's client entry point
<br><br>
<code class="h inline-block">entry.server</code>
—— The Vite client app's client entry point
</td>
</tr>
</table>

<!--
root: process.cwd()
entry.client
entry.server
renderer: null
vite: null
-->

<p>adasda</p>