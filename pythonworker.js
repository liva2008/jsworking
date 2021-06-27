importScripts('./pyodide/pyodide.js')

onmessage = async function (e) {
  try {
    const data = e.data;
    for (let key of Object.keys(data)) {
      if (key !== 'python') {
        // Keys other than python must be arguments for the python script.
        // Set them on self, so that `from js import key` works.
        self[key] = data[key];
      }
    }

    if (typeof self.__pyodideLoading === "undefined") {
      await loadPyodide({
        indexURL: './pyodide/'
      });
    }
    self.pyodide.globals.set('print', s => {
      //console.log(s);
      self.postMessage({
        results: s.toString() + "<br>",
        type: 'ok'
      });
    });
    let res = await self.pyodide.runPythonAsync(data.python);
    //self.postMessage({results : res});
  } catch (e) {
    // if you prefer messages with the error
    self.postMessage({
      results: e.message + '\n' + e.stack,
      type: 'error'
    });
    // if you prefer onerror events
    // setTimeout(() => { throw err; });
  }
}