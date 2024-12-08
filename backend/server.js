const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Code execution API
app.post('/execute', (req, res) => {
  const { language, code } = req.body;

  // Define file extension based on language
  const extensions = { python: 'py', c: 'c', cpp: 'cpp' };
  const fileExt = extensions[language];
  if (!fileExt) return res.status(400).json({ output: 'Unsupported language' });

  // Temporary file path using os.tmpdir for cross-platform compatibility
  const tempFilePath = path.join(os.tmpdir(), `temp.${fileExt}`);

  // Write code to a temporary file
  require('fs').writeFileSync(tempFilePath, code);

  // Define command to execute
  let command;
  if (language === 'python') {
    command = `python3 ${tempFilePath}`;
  } else if (language === 'c') {
    command = `gcc ${tempFilePath} -o ${tempFilePath.replace('.c', '')} && ${tempFilePath.replace('.c', '')}`;
  } else if (language === 'cpp') {
    command = `g++ ${tempFilePath} -o ${tempFilePath.replace('.cpp', '')} && ${tempFilePath.replace('.cpp', '')}`;
  } else {
    return res.status(400).json({ output: 'Unsupported language' });
  }

  // Execute the command
  exec(command, (err, stdout, stderr) => {
    // Cleanup temporary files (use try-catch to avoid crashes)
    try {
      require('fs').unlinkSync(tempFilePath);
      if (fileExt !== 'py') require('fs').unlinkSync(tempFilePath.replace(`.${fileExt}`, ''));
    } catch (cleanupErr) {
      console.error("Error cleaning up temp files:", cleanupErr);
    }

    if (err || stderr) {
      return res.json({ output: stderr || err.message });
    }
    res.json({ output: stdout });
  });
});

app.listen(5000, () => console.log('Server running at http://localhost:5000'));
