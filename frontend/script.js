require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  // Create Monaco Editor instance
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: 'print("Hello, World!")',
    language: 'python', // Set the language to Python
    theme: 'vs-dark', // Use 'vs-light' for a light theme
    automaticLayout: true,
  });

  // Register Python language (basic setup, could be extended)
  monaco.languages.register({ id: 'python' });

  // Define a simple completion provider for Python
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: function () {
      return {
        suggestions: [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:content})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Prints the content to the console.',
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'def ${1:function_name}(${2:args}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Defines a new function.',
          },
          // You can add more Python keywords and functions here
        ],
      };
    },
  });

  // Handle the "Run" button click to execute the Python code
  document.getElementById('run').addEventListener('click', () => {
    const code = editor.getValue(); // Get the code from Monaco editor
    fetch('http://localhost:5000/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', code }), // Send code to the backend for execution
    })
      .then((response) => response.json()) // Parse response as JSON
      .then((data) => {
        // Display output in the 'output' div
        document.getElementById('output').innerText = data.output;
      })
      .catch((err) => {
        // Handle any errors that may occur
        console.error(err);
      });
  });
});
