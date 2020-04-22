importScripts("./markdownit/markdown-it.js");
importScripts("./highlight/markdown-it-highlightjs.js");

let md = markdownit();
md.use(highlightjs);

//console.log(md.render("# hello"));

self.addEventListener('message', function (e) {
    self.postMessage(md.render(e.data));
}, false);