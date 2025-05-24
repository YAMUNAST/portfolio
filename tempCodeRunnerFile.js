const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const certsJson = path.join(__dirname, 'certificates.json');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/certificates', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'certificates.html'));
});

app.get('/certificates-data', (req, res) => {
  fs.readFile(certsJson, (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('certificate'), (req, res) => {
  const { title } = req.body;
  const newCert = { title, filename: req.file.filename };

  fs.readFile(certsJson, (err, data) => {
    const certs = err ? [] : JSON.parse(data);
    certs.push(newCert);
    fs.writeFile(certsJson, JSON.stringify(certs, null, 2), () => {
      res.redirect('/certificates');
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
