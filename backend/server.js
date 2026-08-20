import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/generate-report', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || transcript.trim() === '') {
    return res.json({
      name: 'Not provided',
      primarySymptom: 'Not provided',
      duration: 'Not provided',
      severity: 'N/A',
      additionalSymptoms: 'None reported',
      doctorSummary: 'No transcript recorded during call.'
    });
  }

  try {
    const prompt = `Extract medical details from this conversation transcript into JSON format:
    Transcript:
    "${transcript}"

    Return ONLY a valid JSON object with these keys:
    {
      "name": "string",
      "primarySymptom": "string",
      "duration": "string",
      "severity": "number or string",
      "additionalSymptoms": "string",
      "doctorSummary": "string"
    }`;

    // Active production model on Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' }
    });

    const reportData = JSON.parse(completion.choices[0].message.content);
    res.json(reportData);

  } catch (error) {
    console.error("Groq Analysis Error:", error);
    res.status(500).json({ error: "Failed to generate medical report.", details: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT} using Free Groq API!`);
});