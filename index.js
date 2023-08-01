const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET request route
app.get('/get_data', (req, res) => {
  res.send('This is a GET request!');
});

// POST request route
app.post('/post_data', (req, res) => {
  const id = req.body.id;
  const password = req.body.password;

  if (!id || !password) {
    return res.status(400).json({ error: 'Invalid parameters. Please provide "id" and "password".' });
  }

  const response = {
    id,
    password,
  };

  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
