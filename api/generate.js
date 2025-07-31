// In file: /api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        // Ensure the output is always JSON
        responseMimeType: "application/json",
      }
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Google AI API Error:", errorBody);
        return res.status(apiResponse.status).json({ error: `API call failed: ${errorBody}` });
    }

    const data = await apiResponse.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        // Handle cases where the AI might refuse to answer (e.g., safety settings)
        return res.status(500).json({ error: "The AI did not generate a response." });
    }
    
    // Send the AI's content back to the frontend
    res.status(200).json(data);

  } catch (error) {
    console.error("Server-side error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
