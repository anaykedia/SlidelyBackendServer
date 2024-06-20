import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

const submissionsFilePath = path.join(__dirname, '../data/submissions.json');

interface Submission {
    name: string;
    email: string;
    phone: string;
    github_link: string;
    stopwatch_time: string;
  }

app.use(bodyParser.json());

app.get('/ping', (req: Request, res: Response) => {
  res.json({ success: true });
});

app.post('/submit', (req: Request, res: Response) => {
  const { name, email, phone, github_link, stopwatch_time } = req.body;

  if (!name || !email || !phone || !github_link || !stopwatch_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newSubmission = { name, email, phone, github_link, stopwatch_time };

  fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read submissions' });
    }

    const submissions = JSON.parse(data);
    submissions.push(newSubmission);

    fs.writeFile(submissionsFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to save submission' });
      }

      res.status(201).json({ success: true });
    });
  });
});

app.get('/read', (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read submissions' });
    }

    const submissions = JSON.parse(data);

    if (index >= submissions.length) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submissions[index]);
  });
});

app.post('/edit', (req: Request, res: Response) => {
    const { name, email, phone, github_link, stopwatch_time, index } = req.body;
  
    // Validate input
    if (!name || !email || !phone || !github_link || !stopwatch_time || index === undefined) {
      return res.status(400).json({ error: 'All fields and index are required' });
    }
  
    // Read submissions file
    fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading submissions file:', err);
        return res.status(500).json({ error: 'Unable to read submissions' });
      }
  
      let submissions: Submission[];
      try {
        submissions = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return res.status(500).json({ error: 'Error parsing submissions JSON' });
      }
  
      // Validate index
      const indexNum = parseInt(index);
      if (isNaN(indexNum) || indexNum < 0 || indexNum >= submissions.length) {
        return res.status(400).json({ error: 'Invalid index' });
      }
  
      // Update the submission at the specified index
      submissions[indexNum] = {
        name,
        email,
        phone,
        github_link,
        stopwatch_time
      };
  
      // Write updated submissions back to the file
      fs.writeFile(submissionsFilePath, JSON.stringify(submissions, null, 2), (err) => {
        if (err) {
          console.error('Error writing submissions file:', err);
          return res.status(500).json({ error: 'Unable to save submissions' });
        }
  
        res.json({ success: true });
      });
    });
  });

app.delete('/delete/:index', (req: Request, res: Response) => {
  const index = parseInt(req.params.index);

  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading submissions file:', err);
      return res.status(500).json({ error: 'Unable to read submissions' });
    }

    let submissions: Submission[];
    try {
      submissions = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: 'Error parsing submissions JSON' });
    }

    if (index >= submissions.length) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Remove the submission at the specified index
    submissions.splice(index, 1);

    // Write the updated submissions back to the file
    fs.writeFile(submissionsFilePath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error('Error writing submissions file:', err);
        return res.status(500).json({ error: 'Unable to save submissions' });
      }

      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
