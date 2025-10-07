// api/generate-plan.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userProfile } = req.body;

    // API key stored securely on server
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert geriatric health and wellness advisor. Generate a comprehensive, personalized health plan for an elderly patient.

**Patient Information:**
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- Mobility Level: ${userProfile.mobilityLevel}
- Medical Conditions: ${userProfile.medicalConditions.join(', ') || 'None'}
- Dietary Requirements: ${userProfile.dietaryRestrictions.join(', ') || 'None'}
- Health Goals: ${userProfile.goals.join(', ') || 'General wellness'}

Provide comprehensive recommendations in this exact JSON format:
{
  "fitness": [
    {
      "name": "Exercise Name",
      "duration": "X minutes",
      "frequency": "X times per week",
      "description": "Detailed description",
      "safety": "Safety guidelines",
      "modifications": "Modifications"
    }
  ],
  "diet": [
    {
      "meal": "Breakfast/Lunch/Dinner/Snack",
      "option": "Meal name",
      "portions": "Portion sizes",
      "benefits": "Health benefits",
      "preparation": "Preparation instructions",
      "modifications": "Dietary modifications"
    }
  ],
  "safety": [
    {
      "category": "Category Name",
      "tips": ["tip1", "tip2", "tip3"]
    }
  ],
  "schedule": {
    "weekly": {
      "monday": {"fitness": "Activity"},
      "tuesday": {"fitness": "Activity"},
      "wednesday": {"fitness": "Activity"},
      "thursday": {"fitness": "Activity"},
      "friday": {"fitness": "Activity"},
      "saturday": {"fitness": "Activity"},
      "sunday": {"fitness": "Activity"}
    },
    "daily": {
      "morning": "Morning routine",
      "midday": "Midday routine",
      "evening": "Evening routine"
    }
  }
}

Generate at least 3-4 fitness exercises, 4 meal recommendations, 3 safety categories, and complete schedules.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0];
    }

    const recommendations = JSON.parse(jsonText.trim());

    return res.status(200).json({ success: true, recommendations });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
}