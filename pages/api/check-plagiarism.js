// pages/api/check-plagiarism.js
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

async function checkPlagiarism(text) {
    const data = new FormData();
    data.append('text', text);
  
    const options = {
      method: 'POST',
      url: 'https://plagiarism-source-checker-with-links.p.rapidapi.com/data',
      headers: {
        'x-rapidapi-key': 'b3ff772b76msh2feca31ac336371p1d7239jsndb555197ffa6',
        'x-rapidapi-host': 'plagiarism-source-checker-with-links.p.rapidapi.com',
        ...data.getHeaders()
      },
      data: data
    };
  
    try {
      const response = await axios.request(options);
      
      // Process the response to match our expected format
      return {
        percentage: response.data.percentPlagiarism || 0,
        flaggedSections: response.data.sources ? response.data.sources.map(source => ({
          text: source.matchedText,
          start: source.startIndex,
          end: source.endIndex
        })) : []
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
}

export default async function handler(req, res) {
  await runMiddleware(req, res, upload.single('file'));
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer.toString('utf8');
    const result = await checkPlagiarism(fileContent);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while checking plagiarism' });
  }
}