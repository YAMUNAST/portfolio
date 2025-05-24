const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();

const certsJson = path.join(__dirname, 'certificates.json');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'views', 'projects.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/certificates', (req, res) => res.sendFile(path.join(__dirname, 'views', 'certificates.html')));

app.get('/certificates-data', (req, res) => {
  fs.readFile(certsJson, (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

// Send Email Route
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yamunast2003@gmail.com', // ✅ Replace with your Gmail
      pass: 'ydmx uwxo yjwc byyj'     // ✅ Replace with your Gmail App Password
    }
  });

  const mailOptions = {
    from: email,
    to: 'yamunast2003@gmail.com',
    subject: `New message from ${name}`,
    text: `Sender: ${name}\nEmail: ${email}\n\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending error:', error);
      res.send('Email failed to send.');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Email sent successfully!');
    }
  });
});

// Certificate Uploading Routes
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

app.post('/replace', upload.single('certificate'), (req, res) => {
  const { filename } = req.body;
  fs.readFile(certsJson, (err, data) => {
    if (err) return res.redirect('/certificates');
    let certs = JSON.parse(data);
    const cert = certs.find(c => c.filename === filename);
    if (cert) {
      fs.unlink(path.join(__dirname, 'uploads', cert.filename), () => {});
      cert.filename = req.file.filename;
    }
    fs.writeFile(certsJson, JSON.stringify(certs, null, 2), () => {
      res.redirect('/certificates');
    });
  });
});

app.post('/update-title', (req, res) => {
  const { filename, newTitle } = req.body;
  fs.readFile(certsJson, (err, data) => {
    if (err) return res.sendStatus(500);
    let certs = JSON.parse(data);
    const cert = certs.find(c => c.filename === filename);
    if (cert) cert.title = newTitle;
    fs.writeFile(certsJson, JSON.stringify(certs, null, 2), () => {
      res.sendStatus(200);
    });
  });
});

app.post('/delete', (req, res) => {
  const { filename } = req.body;
  fs.readFile(certsJson, (err, data) => {
    if (err) return res.sendStatus(500);
    let certs = JSON.parse(data);
    certs = certs.filter(c => c.filename !== filename);
    fs.unlink(path.join(__dirname, 'uploads', filename), () => {
      fs.writeFile(certsJson, JSON.stringify(certs, null, 2), () => {
        res.sendStatus(200);
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
