/*
 * parser.js
 * 解析工作者
 *
 */

importScripts("./markdownit/markdown-it.js");
importScripts("./highlight/markdown-it-highlightjs.js");
importScripts("./markdownit/markdown-it-toc.js");
importScripts("./markdownit/markdown-it-footnote.js");
importScripts("./markdownit/markdown-it-sup.js");
importScripts("./markdownit/markdown-it-sub.js");

let md = markdownit(
    {
        html: true,
        linkify: true,
        typographer: true
    }
);
md.use(highlightjs);    //语法高亮插件
md.use(toc_plugin);     //目录插件
md.use(footnote_plugin);//脚注插件
md.use(sub_plugin);     //下标
md.use(sup_plugin);     //上标

//console.log(md.render("# hello"));

self.addEventListener('message', function (e) {
    
    let content = e.data.content;
    
	//解析doc
	content = md.render(content);
	//返回解析结果
	self.postMessage({
		'content': content
	});
}, false);