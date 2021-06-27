function initHighlighting() {
	  console.log("initHighlighting");
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    ArrayProto.forEach.call(blocks, highlightBlock);
}
修改说明，需要多次解析，故将
initHighlighting.called = true;
改为
initHighlighting.called = false;

