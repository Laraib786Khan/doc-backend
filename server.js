// server.js
const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle file upload and OCR
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Use Tesseract to recognize text from the uploaded image
    const result = await Tesseract.recognize(req.file.buffer, 'eng');

    // Example function to parse key data from OCR result
    const parseDocumentData = (text) => {
      const data = {
        name: '',
        passportNumber: '',
        dateOfBirth: '',
        nationality: '',
        dateOfIssue: '',
        dateOfExpiry: ''
      };

      // Regex-based parsing to find relevant fields
      data.name = text.match(/Name:\s*(\w+\s+\w+)/i)?.[1] || "Unknown";
      data.passportNumber = text.match(/Passport No:\s*(\w+)/i)?.[1] || "Unknown";
      data.dateOfBirth = text.match(/Date of Birth:\s*([\d\/]+)/i)?.[1] || "Unknown";
      data.nationality = text.match(/Nationality:\s*(\w+)/i)?.[1] || "Unknown";
      data.dateOfIssue = text.match(/Date of Issue:\s*([\d\/]+)/i)?.[1] || "Unknown";
      data.dateOfExpiry = text.match(/Date of Expiry:\s*([\d\/]+)/i)?.[1] || "Unknown";

      return data;
    };

    // Parse extracted text
    const extractedData = parseDocumentData(result.data.text);

    res.json({ success: true, data: extractedData });
  } catch (error) {
    res.status(500).json({ error: 'OCR failed', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
