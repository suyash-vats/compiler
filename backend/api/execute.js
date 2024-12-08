// api/execute.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const { language, code } = req.body;

  // Define file extension based on language
  const extensions = { python: 'py', c: 'c', cpp: 'cpp' };
  const fileExt = extensions[language];
  if (!fileExt) {
    return res.status(400).json({ output: 'Unsupported language' });
  }

  // Temporary file path
  const tempFilePath = path.join(__dirname, `temp.${fileExt}`);

  // Write code to a temporary file
  fs.writeFileSync(tempFilePath, code);

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
    // Cleanup temporary files
    fs.unlinkSync(tempFilePath);
    if (fileExt !== 'py') fs.unlinkSync(tempFilePath.replace(`.${fileExt}`, ''));

    if (err || stderr) {
      return res.json({ output: stderr || err.message });
    }
    res.json({ output: stdout });
  });
};
