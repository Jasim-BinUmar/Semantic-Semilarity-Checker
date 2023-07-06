const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const { spawn } = require('child_process');
const ejs = require("ejs");
const { resolve } = require("path");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var bertResult = "";
var RoBertResult = "";
var XlNetResult = "";
let text1 = "", text2 = "";
let callbackCount = 0; // Track the number of completed callbacks

app.get("/", function (req, res) {
  res.render('index', { bertOutputResult: bertResult, roBertOutputResult: RoBertResult, xlNetOutputResult: XlNetResult });
  bertResult = "";
  RoBertResult="";
  XlNetResult="";
  text1="";
  text2="";
});

// Set up multer middleware for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Handle file uploads for text1 and text2
app.post('/uploadFiles', upload.array('files', 2), (req, res) => {
  const files = req.files;

  if (files.length === 2) {
    const file1Path = files[0].path;
    const file2Path = files[1].path;

    // Execute Python script to extract text from file 1
    const pythonProcess1 = spawn('python', ['textExtract.py', file1Path]);

    // Collect output from the Python script for file 1
    let extractedText1 = '';
    pythonProcess1.stdout.on('data', (data) => {
      extractedText1 += data.toString();
    });

    // Execute Python script to extract text from file 2
    const pythonProcess2 = spawn('python', ['textExtract.py', file2Path]);

    // Collect output from the Python script for file 2
    let extractedText2 = '';
    pythonProcess2.stdout.on('data', (data) => {
      extractedText2 += data.toString();
    });

    // Send the extracted texts as the response
    pythonProcess2.on('close', () => {
      text1 = extractedText1.trim(); // Remove leading/trailing whitespace
      text2 = extractedText2.trim(); // Remove leading/trailing whitespace
      if (text1 !== "" && text2 !== "") 
      {

        callBertPythonScript(text1, text2, function (bertResult) {}).then(
          callXLNetPythonScript(text1, text2, function (XlNetResult) {}).then(
            callRoBertPythonScript(text1, text2, function (RoBertResult) {
              res.redirect('/');
            }))) 
        
        
      }

      
    });
  } 
  else 
  {
    res.status(400).send('Please upload two files');
  }
});

function callBertPythonScript(text1, text2, callback) 
{
  return new Promise((resolve) => {
    try {
      const pythonScript = spawn('python', ['bertModel.py', text1, text2]);
  
      pythonScript.stdout.on('data', (data) => {
        bertResult += data.toString();
      });
  
      pythonScript.on('close', (code) => {
        if (code === 0) {
          callback(bertResult);
        } else {
          console.error(`Python script execution failed with code ${code}`);
        }
      });
    } catch (error) {
      console.error(`Error executing Python script: ${error.message}`);
    }
  });

}

function callXLNetPythonScript(text1, text2, callback) 
{
  return new Promise((resolve) =>{
    try {
      const pythonScript = spawn('python', ['XLNetModel.py', text1, text2]);
  
      pythonScript.stdout.on('data', (data) => {
        XlNetResult += data.toString();
      });
  
      pythonScript.on('close', (code) => {
        if (code === 0) {
          callback(XlNetResult);
        } else {
          console.error(`Python script execution failed with code ${code}`);
        }
      });
    } catch (error) {
      console.error(`Error executing Python script: ${error.message}`);
    }
  });
  
}

function callRoBertPythonScript(text1, text2, callback) 
{
  return new Promise((resolve) => {
    try {
      const pythonScript = spawn('python', ['RoBERTModel.py', text1, text2]);
  
      pythonScript.stdout.on('data', (data) => {
        RoBertResult += data.toString();
      });
  
      pythonScript.on('close', (code) => {
        if (code === 0) {
          callback(RoBertResult);
        } else {
          console.error(`Python script execution failed with code ${code}`);
        }
      });
    } catch (error) {
      console.error(`Error executing Python script: ${error.message}`);
    }

  });
  
}



app.listen(3000, function () {
  console.log("Server started at port 3000");
});
