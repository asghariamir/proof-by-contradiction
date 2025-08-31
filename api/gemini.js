// Corrected code for: /api/gemini.js

export default async function handler(request, response) {
  // 1. We only want to handle POST requests.
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Securely get your secret API key.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("FATAL: GEMINI_API_KEY environment variable not found!");
      return response.status(500).json({ error: "Server configuration error: API key is missing." });
    }

    // THIS IS THE CORRECTED LINE
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // 3. Call the Google AI API, passing the EXACT body from the frontend.
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body)
    });

    // 4. Handle the response from Google.
    const responseData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Google AI API returned an error:", responseData);
      const errorMessage = responseData.error?.message || 'Unknown error from Google AI';
      return response.status(geminiResponse.status).json({ error: errorMessage });
    }

    // 5. Send the successful AI response back to your frontend.
    return response.status(200).json(responseData);

  } catch (error) {
    console.error("Error in the API proxy function:", error);
    return response.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
}
