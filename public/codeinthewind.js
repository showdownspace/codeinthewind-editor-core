function codeInTheWind() {
  let curtain = document.createElement("div");
  curtain.setAttribute(
    "style",
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  `
  );
  curtain.innerHTML = `Initializing editor…`;
  document.body.appendChild(curtain);

  let editorPlugins = new WeakMap();

  let currentEditor;
  setInterval(() => {
    if (window.MonacoEditor !== currentEditor) {
      currentEditor = window.MonacoEditor;
      if (!currentEditor) return;
      console.log("MonacoEditor changed");
      if (curtain) {
        curtain.remove();
        curtain = null;
      }
      let plugin = editorPlugins.get(currentEditor);
      if (!plugin) {
        plugin = createEditorPlugin(currentEditor);
        editorPlugins.set(currentEditor, plugin);
      }
    }
  }, 1000);

  function createEditorPlugin(editor) {
    const editorId = `editor-${Date.now()}-${Math.random()}`;
    console.log("Initializing editor plugin", editorId);

    let synchronizationStarted = false;

    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      const uri = model.uri.toString();
      const code = model.getValue();
      if (!synchronizationStarted) return;
      window.parent.postMessage(
        { editorContentChanged: { editorId, code, uri } },
        "*"
      );
    });

    // to parent: { editorLoaded: { editorId } }
    // from parent: { initializeEditorSync: { editorId, initialCode } }
    // to parent: { editorContentChanged: { editorId, code, uri } }

    window.addEventListener("message", (event) => {
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data) return;
      if (data.initializeEditorSync) {
        const { editorId, initialCode } = data.initializeEditorSync;
        if (editorId !== editorId) return;
        editor.setValue(initialCode);
        synchronizationStarted = true;
      }
    });

    window.parent.postMessage({ editorLoaded: { editorId } }, "*");
  }
}

codeInTheWind();
