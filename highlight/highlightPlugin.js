const highlightPlugin = (md) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content.trim()
    if (token.info.length > 0) {
      console.log(hljs.highlightAuto(code, [token.info]).value);
      return `<pre><code class="hljs javascript">${hljs.highlightAuto(code, [token.info]).value}</code></pre>`
    }
    return temp(tokens, idx, options, env, slf)
  }
}