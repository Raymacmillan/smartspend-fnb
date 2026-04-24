const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export const generateRecommendations = async (categories) => {
  if (!categories || categories.length === 0) return [];

  // Security Check
  if (!GROQ_API_KEY) {
    console.error("Missing Groq API Key");
    return [];
  }

  try {
    const enrichedData = categories.map(c => ({
      category: c.name || c.key,
      totalSpent: c.amount,
      transactionCount: c.transactions?.length || 0,
      topMerchants: (c.transactions || []).slice(0, 3).map(t => t.name)
    }));

    const prompt = `
    Analyze this Botswana spending data for SmartSpend (FNB). 
    Provide 3 personalized recommendations in JSON format.
    Context: Pula (P) currency, high ATM fees, FNB-to-FNB transfers are free.

    Data: ${JSON.stringify(enrichedData)}

    Respond ONLY with a valid JSON object containing a "recommendations" array.
    CRITICAL: The JSON must be completely valid. Do NOT include any comments or math expressions. The "savingRaw" value MUST be a plain integer.
    {
      "recommendations": [{
        "id": "rec-123",
        "icon": "lightbulb-on",
        "title": "Actionable Title",
        "subtitle": "Context from data",
        "issue": "Educational insight",
        "estFees": "P amount",
        "betterOption": "Step-by-step plan",
        "saving": "P saved/month",
        "savingRaw": 140,
        "severity": "high"
      }]
    }`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error (${response.status}): ${errorText}`);
      return [];
    }

    const result = await response.json();
    if (!result.choices || result.choices.length === 0) {
      console.error("Unexpected Groq API response:", result);
      return [];
    }

    const content = JSON.parse(result.choices[0].message.content || "{}");
    
    // Return the array (handling Groq's potential object wrapper)
    const finalArray = Array.isArray(content) ? content : content.recommendations;
    return finalArray.sort((a, b) => b.savingRaw - a.savingRaw);

  } catch (error) {
    console.error("Groq AI Error:", error);
    return []; // Return empty so the app doesn't crash
  }
};