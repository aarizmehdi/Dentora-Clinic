export interface SOAPNoteResponse {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export async function generateSOAPNote(
  patientName: string,
  clinicalFindings: string
): Promise<SOAPNoteResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DeepSeek API key is missing. Please check your .env file.');
  }

  const prompt = `
You are an expert dental scribe AI. 
Based on the following clinical charting findings for patient "${patientName}", generate a professional, highly accurate SOAP (Subjective, Objective, Assessment, Plan) progress note.

Clinical Findings Charted:
${clinicalFindings || 'Routine exam, no significant findings.'}

Instructions:
- Write the note in standard dental/medical terminology.
- Be concise but thorough.
- Do NOT include any conversational text outside of the JSON response.
- You MUST respond with a valid JSON object matching this exact schema:
{
  "subjective": "string",
  "objective": "string",
  "assessment": "string",
  "plan": "string"
}
`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Low temperature for clinical accuracy
        response_format: { type: 'json_object' } // Force JSON mode
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON string returned by the model
    return JSON.parse(content) as SOAPNoteResponse;
  } catch (error) {
    console.error('Failed to generate SOAP note:', error);
    throw error;
  }
}
