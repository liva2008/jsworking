//cell编辑器Id
let cellId = 0;
//cell编辑器列表Object
let editorStorage = {
    //editor1: CodeMirrorEditor
};
let cellStorage = {};
//记录最后一次添加单元语言类型
let currentSelectLanguage = 'python';
//编辑器宽度
let editorWidth = 0;
//当前单元
let currentCell = '';
//单元数量
let cellCount = 0;

let date = new Date();

let fileid = date.getTime();

let filename = `untitled`;

//存储文件结构
let fileStorage = {
    filename: filename,
    createtime: date.toLocaleString(),
    cellcount: cellCount,
    cells: [{ type: '', source: '' }]
};

function newFile() {
    store();
    x0p({
        title: '请输入新建文件名',
        type: 'input',
        inputType: 'text',
        inputPlaceholder: filename,
        inputColor: '#F29F3F',
        inputValidator:
            function (button, text) {
                //console.log(text);
                if (button == 'info') {
                    filename = text ? text : filename;
                    date = new Date();
                    fileid = date.getTime();
                    document.getElementById('workspace').innerHTML = '';
                    fileStorage = {
                        filename: filename,
                        createtime: date.toLocaleString(),
                        cellcount: cellCount,
                        cells: [{ type: '', source: '' }]
                    };
                }
            }
    });
}

function openFile(evt) {
    let open = document.getElementById('open');
    open.click();
    open.onchange = function (e) {

        var files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        if (files[0].name.match(/\.jsw$/i)) {
            filename = files[0].name.substring(0, files[0].name.indexOf("."));
            let reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onload = function () {
                date = new Date();
                fileid = date.getTime();
                document.getElementById('workspace').innerHTML = '';
                fileStorage = JSON.parse(this.result);
                load();
            }
        }
        else {
            alert('抱歉，不支持该文件，请选择.jsw文件！');
        }
    }
}

function load() {
    fileStorage = JSON.parse(window.localStorage.getItem(fileid)) || fileStorage;
    //console.log(fileStorage);
    for (let i = 0; i < fileStorage.cellcount; i++) {
        cellId = i;
        lang = fileStorage.cells[i].type;
        if (lang == 'html' || lang == 'image') {
            lang = 'text/html';
        } else if (lang == 'mermaid' || lang == 'markmap') {
            lang = 'markdown';
        } else if (lang == 'echarts' || lang == 'typescript') {
            lang = 'javascript';
        }
        append(lang, fileStorage.cells[i].type);
        editorStorage[`editorcell${cellId}`].setValue(fileStorage.cells[i].source);
    }
}

function store() {
    console.time('memory')
    let currentNode = document.getElementById('workspace');
    let children = currentNode.children;
    fileStorage.cellcount = children.length;
    for (let i = 0; i < children.length; i++) {
        fileStorage.cells[i] = {};
        fileStorage.cells[i]['source'] = editorStorage[`editor${children[i].id}`].getValue();
        fileStorage.cells[i]['type'] = document.getElementById(`language${children[i].id}`).value;
    }
    console.timeEnd('memory');
    console.time("storage");
    window.localStorage.setItem(fileid, JSON.stringify(fileStorage));
    console.timeEnd("storage");
}

function fileSaveAs() {
    store();
    let blob = new Blob(
        [JSON.stringify(fileStorage)],
        {
            type: "text/plain;charset=utf-8"
        });

    x0p({
        title: '请输入另存为文件名',
        type: 'input',
        inputType: 'text',
        inputPlaceholder: filename,
        inputColor: '#F29F3F',
        inputValidator:
            function (button, text) {
                //console.log(text);
                if (button == 'info') {
                    saveAs(blob, `${text ? text : filename}.jsw`)
                }
            }
    });
}

window.setInterval(store, 1000 * 60 * 10);

//初始化编辑器宽度
window.onload = function () {
    editorWidth = Math.round((document.body.scrollWidth - 20) * 0.96 * 0.90);
    //console.log(editorWidth);
    load();
    setStatus();
}

//窗口大小改变时调整编辑器宽度
window.addEventListener('resize',
    function () {
        editorWidth = Math.round((document.body.scrollWidth - 20) * 0.96 * 0.90);
        console.log(editorWidth);
        for (let i in editorStorage) {
            editorStorage[i].setSize(editorWidth, null);
        }
    })

//Ctrl+mousewheel窗口缩放时调整编辑器宽度
let mousewheel = false;
let ctrlkey = false;
window.onmousewheel = function (e) {
    mousewheel = true;
    if (mousewheel && ctrlkey) {
        mousewheel = false;
        ctrlkey = false;
        editorWidth = Math.round((document.body.scrollWidth - 20) * 0.96 * 0.90);
        for (let i in editorStorage) {
            editorStorage[i].setSize(editorWidth, null);
        }
    }
}

//窗口缩放时调整编辑器宽度
/*
window.setInterval(function () {
    console.time('editorWidth');
    editorWidth = Math.round((document.body.scrollWidth - 20) * 0.96 * 0.90);
    //console.log(editorWidth);
    for (let i in editorStorage) {
        editorStorage[i].setSize(editorWidth, null);
    }
    console.timeEnd('editorWidth');
}, 100);
*/

//Shift+Enter快捷键根据currentSelectLanguage添加单元
window.addEventListener('keydown', function (e) {
    if (e.ctrlKey) {
        ctrlkey = true;
    }

    if (e.altKey) {
        switch (e.keyCode) {
            case 49:
                append('python', 'python');
                break;
            case 50:
                append('javascript', 'javascript');
                break;
            case 51:
                append('javascript', 'typescript');
                break;
            case 52:
                append('text/html', 'html');
                break;
            case 53:
                append('markdown', 'markdown');
                break;
            case 54:
                append('markdown', 'markmap');
                break;
            case 55:
                append('markdown', 'mermaid');
                break;
            case 56:
                append('javascript', 'echarts');
                break;
            case 57:
                openImage(0, 'text/html', 'image', 'last');
                break;
        }
    }
    if (e.shiftKey && e.keyCode == 13) {
        //console.log('shift+Enter')
        let lang = currentSelectLanguage;
        if (lang == 'html' || lang == 'image') {
            lang = 'text/html';
        } else if (lang == 'mermaid' || lang == 'markmap') {
            lang = 'markdown';
        } else if (lang == 'echarts' || lang == 'typescript') {
            lang = 'javascript';
        }
        append(lang, currentSelectLanguage);
    }
})

function getContent(id) {
    console.log(editorStorage[id].getValue())
}

//第一个参数就是原来的字符串，第二个是宽度，第四个就是回调方法
function cutImageBase64(base64, w, callback) {
    var newImage = new Image();
    var quality = 0.6; //压缩系数0-1之间
    newImage.src = base64;
    //let end = base64.indexOf(';base64,');
    //console.log(end);
    //let type = base64.substring(0, end).substring(5);
    //console.log(type);
    newImage.setAttribute("crossOrigin", 'Anonymous'); //url为外域时需要
    var imgWidth, imgHeight;
    newImage.onload = function () {
        imgWidth = this.width;
        imgHeight = this.height;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        if (imgWidth > w) {
            canvas.width = w;
            canvas.height = w * imgHeight / imgWidth;
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            quality = 0.8;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
        //采用webp格式存储
        var base64 = canvas.toDataURL("image/webp", quality);
        /*
        if (type == 'image/png') {
            var base64 = canvas.toDataURL(); //压缩语句
        } else {
            var base64 = canvas.toDataURL(type, quality); //压缩语句
            var base641 =  canvas.toDataURL("image/webp", quality); 
            console.log(base64.length, base641.length);
        }
        
        // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
        while (base64.length / 1024 > 150) {
            quality -= 0.01;
            base64 = canvas.toDataURL(type, quality);
        }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        while (base64.length / 1024 < 50) {
            quality += 0.001;
            base64 = canvas.toDataURL(type, quality);
        }
        */
        callback(base64, canvas.width, canvas.height); //必须通过回调函数返回，否则无法及时拿到该值
    }
}

function openImage(Id, language, display, pos) {
    let image = document.getElementById('image');
    image.click();
    let content = '';
    image.onchange = function (e) {

        var files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        if (pos == 'last') {
            append(language, display);
        } else if (pos == 'before') {
            appendBefore(Id, language, display);
        } else if (pos == 'after') {
            appendAfter(Id, language, display);
        }

        for (let file of files) {
            if (file.name.match(/(\.svg|\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i)) {
                if (file.name.match(/(\.svg)$/i)) {
                    //SVG文件 
                    let reader = new FileReader();
                    let filename = file.name;
                    reader.readAsText(file, 'utf-8');
                    reader.onload = function () {

                        let base64 = reader.result;
                        content += `
<div>
<center>${base64}</center>
<center><label>${filename}</label></center>
</div>
`;
                        editorStorage[`editorcell${cellId}`].setValue(content);
                        runCell(`cell${cellId}`);
                    }
                }
                else {
                    let reader = new FileReader();
                    let filename = file.name;
                    reader.readAsDataURL(file);
                    reader.onload = function () {

                        let base64 = reader.result;
                        //console.log(base64);

                        cutImageBase64(base64, 800, postImage);

                        function postImage(base64, w, h) {
                            content += `
<div>
<center><img title="${filename}" width="${w}" height="${h}" border=1 alt="${filename}" src="${base64}"></center>
<center><label>${filename}</label></center>
</div>
`;
                            editorStorage[`editorcell${cellId}`].setValue(content);
                            runCell(`cell${cellId}`);
                        }

                    }
                }
            } else {
                alert("不支持该文件，请选择图片文件！");
            }
        }
    }

    image.value = '';
}

//单元模板
function cellTemplate(cellId, language, display) {
    let res = `
<div class="table">
    <div class="row">
        <div class="one">
            <div class="dropdown">
                <button class="dropbtn1" title='在上方添加单元'>+</button>
                <div class="dropdown-content">
                    <a onclick="appendBefore('${cellId}','python','python')" style="font-family: FiraCode;">Python&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+1)</a>
                    <a onclick="appendBefore('${cellId}','javascript','javascript')" style="font-family: FiraCode;">Javascript&nbsp;(Alt+2)</a>
                    <a onclick="appendBefore('${cellId}','javascript', 'typescript')" style="font-family: FiraCode;">Typescript&nbsp;(Alt+3)</a>
                    <a onclick="appendBefore('${cellId}','text/html', 'html')" style="font-family: FiraCode;">HTML&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+4)</a>
                    <a onclick="appendBefore('${cellId}','markdown','markdown')" style="font-family: FiraCode;">Markdown&nbsp;&nbsp;&nbsp;(Alt+5)</a>
                    <a onclick="appendBefore('${cellId}','markdown','markmap')" style="font-family: FiraCode;">Markmap&nbsp;&nbsp;&nbsp;&nbsp;(Alt+6)</a>
                    <a onclick="appendBefore('${cellId}','markdown', 'markmap')" style="font-family: FiraCode;">Mermaid&nbsp;&nbsp;&nbsp;&nbsp;(Alt+7)</a>
                    <a onclick="appendBefore('${cellId}','javascript', 'echarts')" style="font-family: FiraCode;">Echarts&nbsp;&nbsp;&nbsp;&nbsp;(Alt+8)</a>
                    <a onclick="openImage('${cellId}','text/html', 'image', 'before')" style="font-family: FiraCode;">Image&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+9)</a>
                </div>
            </div>
        </div>

        <div class="two" style="text-align: right;">
            <label>[${cellId.substring(4)}]</label>&nbsp;&nbsp;
            <label>
            <select name="language${cellId}" id="language${cellId}" onChange="changeMode('${cellId}')">
                <option value="python" ${display == 'python' ? 'selected' : ''}>Python</option>
                <option value="javascript" ${display == 'javascript' ? 'selected' : ''}>JavaScript</option>
                <option value="typescript" ${display == 'typescript' ? 'selected' : ''}>Typescript</option>
                <option value="html" ${display == 'html' ? 'selected' : ''}>HTML</option>
                <option value="markdown" ${display == 'markdown' ? 'selected' : ''}>Markdown</option>
                <option value="markmap" ${display == 'markmap' ? 'selected' : ''}>Markmap</option>
                <option value="mermaid" ${display == 'mermaid' ? 'selected' : ''}>Mermaid</option>
                <option value="echarts" ${display == 'echarts' ? 'selected' : ''}>Echarts</option>
                <option value="image" ${display == 'image' ? 'selected' : ''}>Image</option>
            </select>    
            </label>&nbsp;&nbsp;
            <button onclick="deleteCell('${cellId}')" title="删除单元">-</button>&nbsp;&nbsp;
        </div>
    </div>
    <div class="row">
        <div class="one" style="vertical-align: bottom;">
            <button class="dropbtn1" title='向上移动单元' onclick="moveUp('${cellId}')">∧</button><br>
            <button class="dropbtn1" title='向下移动单元' onclick="moveDown('${cellId}')">∨</button><br>
            <button class="dropbtn1"  title='运行当前单元' onclick="runCell('${cellId}')">▶</button><br>
            <button class="dropbtn1"  title='编辑当前单元' onclick="hideRun('${cellId}')">■</button><br>
            <div class="dropdown">
                <button class="dropbtn1" title='在下方添加单元'>+</button>
                <div class="dropdown-content">
                    <a onclick="appendAfter('${cellId}','python','python')" style="font-family: FiraCode;">Python&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+1)</a>
                    <a onclick="appendAfter('${cellId}','javascript','javascript')" style="font-family: FiraCode;">Javascript&nbsp;(Alt+2)</a>
                    <a onclick="appendAfter('${cellId}','javascript','typescript')" style="font-family: FiraCode;">Typescript&nbsp;(Alt+3)</a>
                    <a onclick="appendAfter('${cellId}','text/html','html')" style="font-family: FiraCode;">HTML&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+4)</a>
                    <a onclick="appendAfter('${cellId}','markdown','markdown')" style="font-family: FiraCode;">Markdown&nbsp;&nbsp;&nbsp;(Alt+5)</a>
                    <a onclick="appendAfter('${cellId}','markdown','markmap')" style="font-family: FiraCode;">Markmap&nbsp;&nbsp;&nbsp;&nbsp;(Alt+6)</a>
                    <a onclick="appendAfter('${cellId}','markdown','mermaid')" style="font-family: FiraCode;">Mermaid&nbsp;&nbsp;&nbsp;&nbsp;(Alt+7)</a>
                    <a onclick="appendAfter('${cellId}','javascript','echarts')" style="font-family: FiraCode;">Echarts&nbsp;&nbsp;&nbsp;&nbsp;(Alt+8)</a>
                    <a onclick="openImage('${cellId}','text/html','image', 'after')" style="font-family: FiraCode;">Image&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Alt+9)</a>
                </div>
            </div>
        </div>
        <div class="two">
            <div id='edit${cellId}'>
            <textarea id='editor${cellId}' name='editor${cellId}' style="width: 100%;" rows=10></textarea>
            </div>
            <div id='output${cellId}' style="display:none;">
                
            </div>
        </div>
    </div>
</div>`;
    return res;
}

//创建单元编辑器
function runEditor(cellId, language, cell, display) {
    let editor = language == 'text/html' ?
        CodeMirror.fromTextArea(document.getElementById(`editor${cellId}`), {
            lineNumbers: true,
            mode: language,
            indentWithTabs: false
        }) :
        CodeMirror.fromTextArea(document.getElementById(`editor${cellId}`), {
            lineNumbers: true,
            mode: language,
            indentUnit: 4
        });
    //设置编辑器宽度
    editor.setSize(editorWidth, null);
    editor.on('keydown', function (cm, e) {
        if (e.ctrlKey && e.keyCode == 13) {
            //console.log(e.target.parentNode.parentNode.previousSibling.id, 'ctrl+Enter')
            //console.log(editorStorage[e.target.parentNode.parentNode.previousSibling.id].getValue());
            runCell(e.target.parentNode.parentNode.previousSibling.id.substring(6))
        }
    })
    //设置当前单元
    currentCell = cellId;
    currentSelectLanguage = display;
    //更新全局变量
    editorStorage[`editor${cellId}`] = editor;
    cellStorage[`editor${cellId}`] = cell;
    //设置状态栏
    setStatus();
    //设置当前编辑器焦点
    editor.focus();
}

//隐藏运行
function hideRun(cellId) {
    document.getElementById('edit' + cellId).style.display = '';
    document.getElementById(`output${cellId}`).style.display = 'none';
}

function hideAllRun() {
    for (let c in cellStorage) {
        hideRun(cellStorage[c].id);
    }
}

//运行所有单元
function runAllCell() {
    for (let c in cellStorage) {
        runCell(cellStorage[c].id);
    }
}

//运行单元
function runCell(cellId) {
    let language = document.getElementById('language' + cellId).value;
    let code = editorStorage[`editor${cellId}`].getValue();
    //console.log(cellId, language, code);

    if (language == 'python') {
        runPython(cellId, code);
    } else if (language == 'javascript') {
        runJavascript(cellId, code);
    } else if (language == 'html') {
        runHtml(cellId, code);
    } else if (language == 'markdown') {
        runMarkdown(cellId, code);
    } else if (language == 'markmap') {
        runMarkmap(cellId, code);
    } else if (language == 'mermaid') {
        runMermaid(cellId, code);
    } else if (language == 'echarts') {
        runEcharts(cellId, code);
    } else if (language == 'image') {
        runImage(cellId, code);
    } else if (language == 'typescript') {
        runTypescript(cellId, code);
    }
}


//运行python
function runPython(cellId, code) {
    // init Pyodide
    let pyodideWorker = new Worker('./pythonworker.js');
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';

    let oIframe = document.createElement('iframe');
    oIframe.id = "pyFrame" + cellId;
    oIframe.name = "pyFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./python.html`;
    output.appendChild(oIframe);
    pyodideWorker.onmessage = (e) => {
        oIframe.contentWindow.postMessage({
            "content": e.data.results,
            type: e.data.type,
            name: oIframe.name
        }, '*');

    };

    oIframe.onload = () => {
        pyodideWorker.postMessage({
            python: code,
            key: ''
        });
    }
    document.getElementById(`output${cellId}`).style.display = '';
}

//运行Javascript
function runJavascript(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';

    let oIframe = document.createElement('iframe');
    oIframe.id = "jsFrame" + cellId;
    oIframe.name = "jsFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./javascriptworker.html`;
    output.appendChild(oIframe);

    oIframe.onload = function () {
        //window.frames['jsFrame' + cellId].document.write(`<script>${code}<\/script>`);
        oIframe.contentWindow.postMessage({
            "content": `<script>${code}<\/script>`,
            name: oIframe.name
        }, '*');
    }
    document.getElementById(`output${cellId}`).style.display = '';
}

//运行Typescript
function runTypescript(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';

    let oIframe = document.createElement('iframe');
    oIframe.id = "tsFrame" + cellId;
    oIframe.name = "tsFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./typescriptworker.html`;
    output.appendChild(oIframe);

    oIframe.onload = function () {
        //window.frames['jsFrame' + cellId].document.write(`<script>${code}<\/script>`);
        oIframe.contentWindow.postMessage({
            "content": `${code}`,
            name: oIframe.name
        }, '*');
    }
    document.getElementById(`output${cellId}`).style.display = '';
}

//运行Html
function runHtml(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';

    let oIframe = document.createElement('iframe');
    oIframe.id = "hmFrame" + cellId;
    oIframe.name = "hmFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./htmlworker.html`;
    output.appendChild(oIframe);
    code = code.replace(/<\/script>/g, "<\/script>");
    oIframe.onload = function () {
        //window.frames['jsFrame' + cellId].document.write(`<script>${code}<\/script>`);
        oIframe.contentWindow.postMessage({
            "content": `${code}`,
            name: oIframe.name
        }, '*');
    }
    document.getElementById(`output${cellId}`).style.display = '';
}


//运行Markdown
function runMarkdown(cellId, code) {
    let markdowndWorker = new Worker("./markdownworker.js");
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';
    let oIframe = document.createElement('iframe');
    oIframe.id = "mdFrame" + cellId;
    oIframe.name = "mdFrame" + cellId;
    oIframe.width = "100%";
    oIframe.scrolling = 'no';
    oIframe.frameBorder = 0;
    oIframe.src = `./markdown.html`;
    output.appendChild(oIframe);

    markdowndWorker.onmessage = (e) => {
        oIframe.contentWindow.postMessage({
            "content": e.data.content,
            name: oIframe.name
        }, '*');

    }

    oIframe.onload = function () {
        markdowndWorker.postMessage({
            'content': code
        });

    }
    document.getElementById(`output${cellId}`).style.display = '';
    document.getElementById('edit' + cellId).style.display = 'none';
}

function runMarkmap(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';
    let oIframe = document.createElement('iframe');
    oIframe.id = "mmFrame1" + cellId;
    oIframe.name = "mmFrame1" + cellId;
    oIframe.width = "100%";
    oIframe.scrolling = "no";
    oIframe.frameBorder = 0;
    oIframe.src = `./markmapworker.html`;
    oIframe.onload = function () {
        oIframe.contentWindow.postMessage({
            "content": code,
            name: oIframe.name
        }, '*');
    }
    output.appendChild(oIframe);
    document.getElementById(`output${cellId}`).style.display = '';
    document.getElementById('edit' + cellId).style.display = 'none';
}

function runMermaid(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';
    let oIframe = document.createElement('iframe');
    oIframe.id = "mmFrame" + cellId;
    oIframe.name = "mmFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./mermaidworker.html`;
    oIframe.onload = function () {
        oIframe.contentWindow.postMessage({
            "content": code,
            name: oIframe.name
        }, '*');
    }
    output.appendChild(oIframe);
    document.getElementById(`output${cellId}`).style.display = '';
    document.getElementById('edit' + cellId).style.display = 'none';
}

function runEcharts(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';
    let oIframe = document.createElement('iframe');
    oIframe.id = "ecFrame" + cellId;
    oIframe.name = "ecFrame" + cellId;
    oIframe.width = "100%";
    oIframe.scrolling = "no";
    oIframe.frameBorder = 0;
    oIframe.src = `./echartsworker.html`;
    oIframe.onload = function () {
        oIframe.contentWindow.postMessage({
            content: part1 + code + part2,
            name: oIframe.name
        }, '*');
    }
    output.appendChild(oIframe);
    document.getElementById(`output${cellId}`).style.display = '';
    document.getElementById('edit' + cellId).style.display = 'none';
}

//运行本地Image
function runImage(cellId, code) {
    let output = document.getElementById(`output${cellId}`)
    output.innerHTML = '';

    let oIframe = document.createElement('iframe');
    oIframe.id = "imFrame" + cellId;
    oIframe.name = "imFrame" + cellId;
    oIframe.width = "100%";
    oIframe.frameBorder = 0;
    oIframe.scrolling = 'no';
    oIframe.src = `./imageworker.html`;
    output.appendChild(oIframe);
    code = code.replace(/<\/script>/g, "<\/script>");
    oIframe.onload = function () {
        //window.frames['jsFrame' + cellId].document.write(`<script>${code}<\/script>`);
        oIframe.contentWindow.postMessage({
            "content": `${code}`,
            name: oIframe.name
        }, '*');
    }
    document.getElementById(`output${cellId}`).style.display = '';
    document.getElementById('edit' + cellId).style.display = 'none';
}

//改变单元类型
function changeMode(cellId) {
    let lang = document.getElementById(`language${cellId}`).value;
    if (lang == 'html' || lang == 'image') {
        lang = 'text/html';
    } else if (lang == 'mermaid' || lang == 'markmap') {
        lang = 'markdown';
    } else if (lang == 'echarts' || lang == 'typescript') {
        lang = 'javascript';
    }
    editorStorage[`editor${cellId}`].setOption('mode', lang);
}

//在当前节点之后插入节点
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;

    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

//在下方添加单元
function appendAfter(id, language, display) {
    let currentNode = document.getElementById(id);
    //console.log(currentNode.parentNode);
    let cell = document.createElement('div');
    cellId++;
    cell.id = 'cell' + cellId;
    currentCell = cell.id;
    cell.className = 'cell';
    cell.addEventListener('click', (e) => {
        cell.style.borderLeftColor = 'red';
        //document.getElementById(currentCell).style.borderLeftColor = 'black';
        let c = document.querySelector(`#${currentCell}`);
        if (c) c.style.borderLeftColor = 'black';
        currentCell = cell.id;
        setStatus();
    })
    cell.innerHTML = cellTemplate('cell' + cellId, language, display);

    insertAfter(cell, currentNode);
    runEditor('cell' + cellId, language, cell, display);
}

//在上方添加单元
function appendBefore(id, language, display) {
    let currentNode = document.getElementById(id);
    //console.log(currentNode.parentNode);
    let cell = document.createElement('div');
    cellId++;
    cell.id = 'cell' + cellId;
    currentCell = cell.id;
    cell.className = 'cell';
    cell.addEventListener('click', (e) => {
        cell.style.borderLeftColor = 'red';
        //document.getElementById(currentCell).style.borderLeftColor = 'black';
        let c = document.querySelector(`#${currentCell}`);
        if (c) c.style.borderLeftColor = 'black';
        currentCell = cell.id;
        setStatus();
    })
    cell.innerHTML = cellTemplate('cell' + cellId, language, display);
    let pNode = currentNode.parentNode;
    pNode.insertBefore(cell, currentNode);
    runEditor('cell' + cellId, language, cell, display);
}

//在末尾添加节点
function append(language, display) {
    let currentNode = document.getElementById('workspace');
    //console.log(currentNode.parentNode);
    let cell = document.createElement('div');
    cellId++;
    cell.id = 'cell' + cellId;
    currentCell = cell.id;
    cell.className = 'cell';
    cell.addEventListener('click', (e) => {
        //console.time('select1')
        cell.style.borderLeftColor = 'red';
        //document.getElementById(currentCell).style.borderLeftColor = 'black';
        let c = document.querySelector(`#${currentCell}`);
        if (c) c.style.borderLeftColor = 'black';
        currentCell = cell.id;
        setStatus();
        /* 遍历方法
        cell.style.borderLeftColor = 'red';
        for (let c in cellStorage) {
            if (cellStorage[c].id != cell.id) {
                cellStorage[c].style.borderLeftColor = 'black';
            }
        }
        currentCell = cell.id;
        setStatus();
        */
        //console.timeEnd('select1');
    })
    cell.innerHTML = cellTemplate('cell' + cellId, language, display);
    currentNode.appendChild(cell);
    runEditor('cell' + cellId, language, cell, display);
}

//删除单元
function deleteCell(id) {
    x0p('确认', `要删除[${id.substring(4)}]单元吗？`, 'warning', function (button, text) {
        if (button == 'warning') {
            let currentNode = document.getElementById(id);
            let p = currentNode.parentNode;
            p.removeChild(currentNode);

            delete editorStorage[`editor${id}`];
            delete cellStorage[`editor${id}`];

            setStatus();
        }
    });
}

//上移单元
function moveUp(id) {
    /*
    let currentNode = document.getElementById(id);
    let clone = currentNode.cloneNode(true)
    let pNode = currentNode.parentNode;
    let prev = currentNode.previousSibling;
    if(prev == null) alert('he');
    pNode.replaceChild(clone, prev);
    pNode.replaceChild(prev, currentNode);
    runEditor(id, 'python');
    */
    let currentNode = $(`#${id}`)
    let prev = currentNode.prev();
    prev.before(currentNode);
}

//下移单元
function moveDown(id) {
    let currentNode = $(`#${id}`)
    let next = currentNode.next();
    next.after(currentNode);
}

function setStatus() {
    let status = document.querySelector(".status");
    cellCount = Object.keys(cellStorage).length;
    status.innerHTML = `&nbsp;&nbsp;<a href="https://beian.miit.gov.cn" target='_blank'>鄂ICP备2021012082号</a> | 当前单元数量：${cellCount} | 
        当前单元：[${currentCell.substring(4)}]`;
    //console.log(cellStorage);
    //console.log(editorStorage);
    //console.log(JSON.stringify(editorStorage).length);
}

function aboutMessage() {
    alert(`
jsWorking极速工作 V3.0@2021
交互式Web工作平台。\n
所用软件声明：
pyodide
Typescript
monacoeditor
codemirror
markdown-it
reveal.js
highlight.js
Mathjax
mermaid.js
markmap.js
echarts
pdf.js
dexie.js
streamSaver
jquery
FiraCode
CascadiaCode
SourceCodePro
JetBrainsMono\n
主要开发人员：
liva2008,liva2008@qq.com
`);
}

function aboutDialog() {
    let dlg = document.getElementById('aboutdialog');
    let btn = document.getElementById('closedialog');
    btn.onclick = function (e) {
        dlg.close(1);
        //alert(dlg.returnValue)
    }
    if (typeof dlg.showModal === "function") {
        dlg.showModal();

    } else {
        aboutMessage();
    }
}

function whiteboard() {
    let sw = document.getElementById('wbcheckbox');
    let wb = document.getElementById('whiteboard');
    if (sw.checked) {
        wb.style.display = '';
    } else {
        wb.style.display = 'none';
    }
}

function recordscreen() {
    let sw = document.getElementById('rscheckbox');
    let wb = document.getElementById('recordscreen');
    if (sw.checked) {
        if (!!navigator.getDisplayMedia || (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
            wb.style.display = '';
            startscreen();
        }
        else {
            sw.checked = false;
            alert("不支持录屏");
        }
    } else {
        if (isRecordScreen) {
            stopscreen();
            wb.style.display = 'none';
        }

    }
}

let stream;
let mediaRecorder;
let recordedChunks = [];
let isRecordScreen = false;
async function startscreen() {
    isRecordScreen = true;
    let sw = document.getElementById('rscheckbox');
    let wb = document.getElementById('recordscreen');
    let video = document.querySelector('#rsv');
    recordedChunks = [];

    var displayMediaStreamConstraints = {
        video: true,
        audio: true
    };
    if (navigator.mediaDevices.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints)
    }
    else {
        stream = await navigator.getDisplayMedia(displayMediaStreamConstraints);
    }

    video.srcObject = stream;

    stream.addEventListener('ended', function () {
        sw.checked = false;
        wb.style.display = 'none';
        stopscreen();
    }, false);

    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            sw.checked = false;
            wb.style.display = 'none';
            stopscreen();
        }, false);
    });


    var options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: "video/webm"
    };
    mediaRecorder = new MediaRecorder(stream, options);

    function handleDataAvailable(event) {
        //console.log("data-available");
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            //console.log(recordedChunks);
        } else {
            // ...
        }
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(100);
}

function stopscreen() {
    isRecordScreen = false;
    let video = document.querySelector('#rsv');
    //停止录屏
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;

    mediaRecorder.stop();

    var blob = new Blob(recordedChunks, {
        type: "video/webm"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename + ".webm";
    a.click();
    window.URL.revokeObjectURL(url);

}

async function recordvideo() {
    let sw = document.getElementById('rvcheckbox');
    let wb = document.getElementById('recordvideo');
    if (sw.checked) {
        await checkRecordVideo();
        if (hasMicrophone || hasWebcam) {
            wb.style.display = '';
            startvideo();
        }
        else {
            sw.checked = false;
            alert("不支持录像");
        }
    } else {
        if (isRecordVideo) {
            stopvideo();
            wb.style.display = 'none';
        }

    }
}

//检测是否有摄像头，麦克风,扬声器
var hasMicrophone = false;
var hasSpeakers = false;
var hasWebcam = false;
async function checkRecordVideo() {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        let devices = await navigator.mediaDevices.enumerateDevices();
        console.log('device', devices);
        devices.forEach(function (device) {
            console.log(device.kind);
            if (device.kind === 'videoinput') {
                hasWebcam = true;
            }
            else if (device.kind === 'audioinput') {
                hasMicrophone = true;
            }
            else if (device.kind === 'audiooutput') {
                hasSpeakers = true;
            }
        });
    }
}

let stream1;
let mediaRecorder1;
let recordedChunks1 = [];
let isRecordVideo = false;
async function startvideo() {
    isRecordVideo = true;
    let sw = document.getElementById('rvcheckbox');
    let wb = document.getElementById('recordvideo');
    let video = document.querySelector('#rvv');
    recordedChunks1 = [];

    var displayMediaStreamConstraints = {
        video: hasWebcam,
        audio: hasMicrophone && hasSpeakers
    };

    if (navigator.mediaDevices.getUserMedia) {
        stream1 = await navigator.mediaDevices.getUserMedia(displayMediaStreamConstraints)
    }
    else {
        stream1 = await navigator.getUserMedia(displayMediaStreamConstraints);
    }

    video.srcObject = stream1;

    stream1.addEventListener('ended', function () {
        sw.checked = false;
        wb.style.display = 'none';
        stopvideo();
    }, false);

    stream1.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            sw.checked = false;
            wb.style.display = 'none';
            stopvideo();
        }, false);
    });


    var options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: "video/webm"
    };
    mediaRecorder1 = new MediaRecorder(stream1, options);

    function handleDataAvailable(event) {
        //console.log("data-available");
        if (event.data.size > 0) {
            recordedChunks1.push(event.data);
            //console.log(recordedChunks);
        } else {
            // ...
        }
    }

    mediaRecorder1.ondataavailable = handleDataAvailable;
    mediaRecorder1.start(100);
}

function stopvideo() {
    isRecordVideo = false;
    let video = document.querySelector('#rvv');
    //停止录屏
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;

    mediaRecorder1.stop();

    var blob = new Blob(recordedChunks1, {
        type: "video/webm"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename + ".webm";
    a.click();
    window.URL.revokeObjectURL(url);
}