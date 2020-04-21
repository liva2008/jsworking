//文件类型
let fileType = "doc";
//当前文件名
let currentFilename = "undefined";
//当前光标所在行号
let currentCursorPosition = 0;
//ppt主题
let theme = "black";
//PPT当前页
let currentPage;
//编辑器
let monacoEditor;
//编辑器内容改变标志
let contentChange = false;
let isView = true;
//解析器
let md = markdownit();
//md.use(markdownitMathjax());
//语法高亮
md.use(highlightjs);
//md.use(highlightPlugin)
//md.use(highlightlines);

hljs.initHighlightingOnLoad();
hljs.initLineNumbersOnLoad({
    singleLine: true
});

//窗口调整
window.onresize = function () {
    let h = document.body.clientHeight - 42;
    let list = document.getElementById("preview");
    list.style.height = h + "px";
}

//初始化
window.onload = function () {
    let h = document.body.clientHeight - 42;
    let list = document.getElementById("preview");
    list.style.height = h + "px";

    //设置插件路径
    require.config({
        paths: {
            'vs': 'vs'
        }
    });
    //绑定对象并赋值
    require(['vs/editor/editor.main'], function () {
        //container为要绑定的对象
        monacoEditor = monaco.editor.create(document.getElementById('editor'), {
            value: window.localStorage.getItem("jsWorking"),
            language: 'markdown',
            theme: 'vs-light',
            automaticLayout: true,
            fontSize: 24,
            fontFamily: 'Cascadia Code',
            renderIndentGuides: true,
            tabCompletion: 'on',
            snippetSuggestions: "inline",
            wordWrap:'off',
            folding:true,
            foldingStrategy: 'auto'
        });
        monacoEditor.onDidChangeModelContent(function (e) {
            //编辑器内容修改触发的事件
            contentChange = true;
            //console.log(e);
            //render1();

            console.time("storage");
            //暂存内容
            window.localStorage.setItem("jsWorking", monacoEditor.getValue());
            console.timeEnd("storage");
        });

        //鼠标事件
        monacoEditor.onMouseDown(function (e) {
            //this.console.log(e);
            //获得光标所在行号
            currentCursorPosition = monacoEditor.getPosition().lineNumber;
            render1();
            //console.log(currentCursorPosition);
        });
    });

    let editor = document.getElementById("editor");
    let preview = document.getElementById("preview");
    let open = document.getElementById('open');
    let save = document.getElementById('save');
    let exp = document.getElementById('export');
    let view = document.getElementById('view');
    let fullview = document.getElementById('fullview');

    //键盘事件
    editor.onkeydown = function (e) {
        //获得光标所在行号
        currentCursorPosition = monacoEditor.getPosition().lineNumber;
        //console.log(currentCursorPosition);

        //回车触发渲染事件
        //this.console.log(e);
        //if (e.keyCode == 13) {
        render1();
        //}
    }

    open.addEventListener('change', myOpen);
    save.addEventListener('click', mySave);
    exp.addEventListener("click", this.myExport);
    view.addEventListener("click", myView);
    fullview.addEventListener("click", myFullView);
}

//预览
function myView() {
    let mytable = document.getElementById('mytable');
    let view = document.getElementById('view');
    let fullview = document.getElementById('fullview');

    if (view.checked) {
        mytable.rows[0].cells[0].style.width = "60%";
        mytable.rows[0].cells[0].style.display = "";
        mytable.rows[0].cells[1].style.width = "40%";
        mytable.rows[0].cells[1].style.display = "";
        fullview.checked = false;
        isView = true;
    } else {
        mytable.rows[0].cells[0].style.width = "100%";
        mytable.rows[0].cells[0].style.display = "";
        mytable.rows[0].cells[1].style.width = "0";
        mytable.rows[0].cells[1].style.display = "none";
        isView = false;
    }
    monacoEditor.layout();
}

//全窗口预览
function myFullView() {
    let mytable = document.getElementById('mytable');
    let view = document.getElementById('view');
    let fullview = document.getElementById('fullview');

    if (fullview.checked) {
        mytable.rows[0].cells[0].style.width = "0";
        mytable.rows[0].cells[0].style.display = "none";
        mytable.rows[0].cells[1].style.width = "100%";
        mytable.rows[0].cells[1].style.display = "";
        view.checked = false;
        isView = true;
    } else {
        mytable.rows[0].cells[0].style.width = "100%";
        mytable.rows[0].cells[0].style.display = "";
        mytable.rows[0].cells[1].style.width = "0";
        mytable.rows[0].cells[1].style.display = "none";
        isView = false;
    }
    monacoEditor.layout();
}

//编辑器内容修改时重新渲染
function render1() {
    
    //预览开关
    if (!isView) return;

    let content = monacoEditor.getValue();
    let originContent = content;

    let reg = new RegExp("^<!--ppt-->")
    //console.log(reg.test(content));
    preview.innerHTML = '';
    if (reg.test(content)) {
        fileType = "ppt";
        //console.log(content);
        //利用光标所在行currentCursorPostion计算所在ppt页码
        let contentArray = content.split("\n");
        console.log(contentArray.length);
        let page = [];
        let firstPage = true;
        contentArray.forEach((v, i, a) => {
            if (v.indexOf("<!--page-->") != -1) {
                if (firstPage) {
                    firstPage = false;
                } else {
                    page.push(i + 1);

                }
            }

        });
        page.push(contentArray.length + 1);

        let pageNo = 0;
        for (let i = 0; i < page.length; i++) {
            if (currentCursorPosition < page[i]) {
                pageNo = i;
                break;
            }

        }

        /*
        if((pageNo === currentPage)&&(!contentChange))
            return true;

        //更新当前页码和内容改变标志
        currentPage = pageNo;
        contentChange = false;
        */
        
        content.replace(/theme:(.*)$/gm, function (match, param, offset, string) {
            //console.log("theme",match, param, offset, string, "end");
            theme = param;
        });


        content = md.render(content);
        //ppt演示
        //preview.innerHTML = `<iframe width="99%" height="98%" src="ppt.html#/1"></iframe>`;
        //console.log(content);
        // 去掉ppt标签
        content = content.replace("<p>&lt;!--ppt--&gt;</p>", "");
        content = content.replace(/<p>theme:(.*)$/gm, "");
        // 替换page标签
        content = content.replace(/<p>&lt;!--page--&gt;<\/p>/g, "</section><section>");
        //删除第一个</section>
        content = content.replace("</section>", "");
        //最后面添加</section>
        content += "</section>";
        //同时支持html
        content = content.replace(/&lt;/g, "<");
        content = content.replace(/&gt;/g, ">");
        //替换原始svg
        //给svg加个标记
        content = content.replace(/<svg/g, "\"<svg");
        //console.log(content);
        originContent.replace(/<svg(.*)<\/svg>$/gm, function (match, param, offset, string) {
            //console.log("svg",match, param, offset, string, "end");
            content = content.replace(/"<svg(.*)\/svg>/, match);
        });


        let oIframe = document.createElement('iframe');
        oIframe.width = "99%";
        oIframe.height = "98%";
        oIframe.src = `./ppt.html#/${pageNo}`;
        preview.appendChild(oIframe);

        oIframe.onload = function () {
            oIframe.contentWindow.postMessage({"theme":theme, "content":content}, '*');
        }
    } else {
        //doc文档
        fileType = "doc";

        //Markdown渲染
        console.time("markdown");
        

        content = md.render(content);
        //同时支持html
        content = content.replace(/&lt;/g, "<");
        content = content.replace(/&gt;/g, ">");
        //替换原始svg
        //给svg加个标记
        content = content.replace(/<svg/g, "\"<svg");
        //console.log(content);
        originContent.replace(/<svg(.*)<\/svg>$/gm, function (match, param, offset, string) {
            //console.log("svg",match, param, offset, string, "end");
            content = content.replace(/"<svg(.*)\/svg>/, match);
        });
        //console.log(content);
        preview.innerHTML = content;
        console.timeEnd("markdown");

        //公式渲染
        console.time("formula");
        MathJax.texReset();
        MathJax.typesetClear();
        MathJax.typesetPromise([preview]).catch();
        console.timeEnd("formula");

        //语法高亮
        console.time("highlight");
        hljs.initLineNumbersOnLoad({
            singleLine: true
        });
        console.timeEnd("highlight");
    }
}

// 文件打开
function myOpen(evt) {
    var files = evt.target.files;

    if (!files || files.length === 0) {
        return;
    }
    currentFilename = files[0].name.substring(0, files[0].name.indexOf("."));
    //alert(files[0]);
    let reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function () {
        //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
        console.log(this.result);
        monacoEditor.setValue(this.result);
        render1();
    }
}

//文件保存.md
function mySave() {
    let blob = new Blob([monacoEditor.getValue()], {
        type: "text/plain;charset=utf-8"
    });

    //saveAs(blob, "test.md");
    const fileStream = streamSaver.createWriteStream(currentFilename + ".md", {
        size: blob.size
    });
    const readableStream = blob.stream()

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
        return readableStream.pipeTo(fileStream)
            .then(() => console.log('done writing'))
    }

    // Write (pipe) manually
    window.writer = fileStream.getWriter()

    const reader = readableStream.getReader()
    const pump = () => reader.read()
        .then(res => res.done ?
            writer.close() :
            writer.write(res.value).then(pump))

    pump()
}

//文件导出
function myExport() {


    let blob;
    if (fileType === "doc") {
        blob = new Blob([docHtml()], {
            type: "text/plain;charset=utf-8"
        });
    } else if (fileType === "ppt") {
        blob = new Blob([pptHtml()], {
            type: "text/plain;charset=utf-8"
        });
    }

    //saveAs(blob, "test.md");
    const fileStream = streamSaver.createWriteStream(currentFilename + ".html", {
        size: blob.size
    });
    const readableStream = blob.stream()

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
        return readableStream.pipeTo(fileStream)
            .then(() => console.log('done writing'))
    }

    // Write (pipe) manually
    window.writer = fileStream.getWriter()

    const reader = readableStream.getReader()
    const pump = () => reader.read()
        .then(res => res.done ?
            writer.close() :
            writer.write(res.value).then(pump))

    pump()
}

function docHtml() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="google" value="notranslate">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${currentFilename}</title>

    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/monokai.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.6.0/dist/highlightjs-line-numbers.min.js">
    </script>
    <style>
        /* for block of numbers */
        .hljs-ln-numbers {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;

            text-align: center;
            color: #ccc;
            border-right: 5px solid #CCC;
            vertical-align: top;
            padding-right: 5px;

            /* your custom style here */
        }

        /* for block of code */
        .hljs-ln-code {
            padding-left: 10px;
            padding-right: 10px;
        }
    </style>

    </head>

    <body>
        ${preview.innerHTML}
    </body>

</html>`;
}

function pptHtml() {
    let originContent = monacoEditor.getValue();
    let c = md.render(originContent);

    // 去掉ppt标签
    c = c.replace("<p>&lt;!--ppt--&gt;</p>", "");
    c = c.replace(/<p>theme:(.*)$/gm, "");
    // 替换page标签
    c = c.replace(/<p>&lt;!--page--&gt;<\/p>/g, "</section><section>");
    //删除第一个</section>
    c = c.replace("</section>", "");
    //最后面添加</section>
    c += "</section>";

    //同时支持html
    c = c.replace(/&lt;/g, "<");
    c = c.replace(/&gt;/g, ">");
    //替换原始svg
    //给svg加个标记
    c = c.replace(/<svg/g, "\"<svg");
    //console.log(content);
    originContent.replace(/<svg(.*)<\/svg>$/gm, function (match, param, offset, string) {
        //console.log("svg",match, param, offset, string, "end");
        c = c.replace(/"<svg(.*)\/svg>/, match);
    });

    let html = `
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>${currentFilename}</title>
    <script>
        MathJax = {
            tex: {
                inlineMath: [
                    ['$', '$'],
                    ['\\(', '\\)']
                ]
            },
            startup: {
                ready: function () {
                    MathJax.startup.defaultReady();
                }
            }
        }
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/monokai.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.6.0/dist/highlightjs-line-numbers.min.js">
    </script>
    <style>
    /* for block of numbers */
    .hljs-ln-numbers {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        text-align: center;
        color: #ccc;
        border-right: 5px solid #CCC;
        vertical-align: top;
        padding-right: 5px;

        /* your custom style here */
    }

    /* for block of code */
    .hljs-ln-code {
        padding-left: 10px;
        padding-right: 10px;
    }
    </style>
    <link rel="stylesheet" href="https://cdn.bootcss.com/reveal.js/3.8.0/css/reveal.min.css">
    <link rel="stylesheet" href="https://cdn.bootcss.com/reveal.js/3.8.0/css/theme/${theme}.min.css">
    
    <script>
        hljs.initHighlightingOnLoad();
        hljs.initLineNumbersOnLoad({
            singleLine: true
        });
    </script>
</head>

<body>
    <div class="reveal">
        <div class="slides">
            ${c}
        </div>
    </div>
    <script src="https://cdn.bootcss.com/reveal.js/3.8.0/js/reveal.min.js"></script>
    <script>
    Reveal.initialize({
        hash: true,
        dependencies: []
    });
    </script>
</body>

</html>
`;
    return html;
}