// app.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const checkInternet = async () => {
    try {
        await axios.get('http://www.google.com');
        return true;
    } catch (error) {
        return false;
    }
};

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Files will be stored in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

app.get('/', async (req, res) => {
    const internetStatus = await checkInternet() ? 'Internet Connected' : 'No Internet Connection';
    const htmlResponse = `<h1>${internetStatus}</h1><a href="/upload">Upload File</a><br><a href="/files">View Uploaded Files</a>`;
    res.send(htmlResponse);
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html')); // Send the HTML form for file upload
});

// Modify the delete endpoint to redirect back to the /files page after deletion
app.get('/delete/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.redirect('/files?deleted=' + encodeURIComponent(filename)); // Redirect with deletion message
    } else {
        res.status(404).send('File not found');
    }
});

// Modify the /files route to show the updated file list along with deletion message if available
app.get('/files', (req, res) => {
    const deletedFile = req.query.deleted; // Get the deleted file name from the query parameter
    const deletionMessage = deletedFile ? `File ${deletedFile} deleted successfully` : '';

    const uploadedFiles = fs.readdirSync('uploads').map(file => ({ name: file }));
    const fileList = uploadedFiles.length > 0 ? uploadedFiles.map(file => `
        <li>${file.name} 
            <a href="/download/${file.name}">(Download)</a>
            <a href="/delete/${file.name}" onclick="return confirm('Are you sure you want to delete this file?')"> (Delete)</a>
        </li>
    `).join('') : 'No files uploaded yet.';

    const htmlResponse = `
        <h1>Uploaded Files</h1>
        <p>${deletionMessage}</p>
        <a href="/">Home</a><br>
        <ul>${fileList}</ul>
    `;
    res.send(htmlResponse);
});

app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.download(filePath); // Initiating file download
});

const uploadedFilesList = []; // To store uploaded file names



// app.post('/upload', (req, res) => {
//     upload.single('file')(req, res, (err) => {
//         if (err) {
//             return res.status(500).send('Error uploading file');
//         }
//         res.send('File uploaded successfully');
//     });
// });


// Function to check if a file already exists
const fileExists = (fileName) => {
    const uploadedFiles = fs.readdirSync('uploads');
    return uploadedFiles.includes(fileName);
};

app.post('/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).send('Error uploading file');
        }

        const uploadedFileName = req.file.originalname;
        if (fileExists(uploadedFileName)) {
            return res.status(409).send('File already exists');
        }

        res.send('File uploaded successfully');
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
