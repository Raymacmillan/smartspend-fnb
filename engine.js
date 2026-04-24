// Make sure to replace this with your actual Groq API key for the hackathon!
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';

export const generateRecommendations = async (categories) => {
  if (!categories || categories.length === 0) return [];

  // 1. VISUAL CHECK: Verify the API key is provided
  if (!API_KEY || API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    return [{
      id: 'api-missing',
      icon: 'alert-circle-outline',
      title: 'SmartSpend Not Connected',
      subtitle: 'Intelligence engine offline',
      issue: 'The app cannot generate real-time insights because the SmartSpend engine is disconnected.',
      estFees: 'P 0.00',
      betterOption: 'Check your connection or contact FNB support if the issue persists.',
      saving: 'Analysis Offline',
      savingRaw: 0,
      severity: 'high'
    }];
  }

  try {
    // Extract richer transaction data to make advice highly specific
    const enrichedData = categories.map(c => {
      const merchants = {};
      (c.transactions || []).forEach(tx => {
        merchants[tx.description] = (merchants[tx.description] || 0) + Number(tx.amount);
      });
      // Get their top 3 specific merchants/expenses in this category
      const topMerchants = Object.entries(merchants)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => `${name} (P${amount})`);

      return {
        category: c.name || c.key,
        totalSpent: c.amount,
        transactionCount: c.transactions?.length || 0,
        topMerchants: topMerchants.length > 0 ? topMerchants : undefined
      };
    });

    const prompt = `
    You are a highly analytical financial health coach for SmartSpend (FNB Botswana). 
    Analyze the user's actual spending data below and generate 3 highly personalized, data-driven recommendations to reduce costs or optimize value. 

    CRITICAL INSTRUCTIONS:
    1. DO NOT give generic advice. Focus on detailed, educational financial planning.
    2. YOU MUST specifically reference their top merchants, transaction counts, and exact Pula amounts from the provided data.
    3. Explain EXACTLY why their current habit is a problem (The Insight) and give a clear, step-by-step plan on how to plan their finances better (The Plan).
    4. Consider Botswana context (e.g., Pula currency, BPC electricity tiers, FNB interbank fees, high ATM withdrawal fees).
    5. ONLY output valid JSON. No math expressions (like 140 * 0.4) and no comments (like //). Numbers must be fully calculated primitives.

    User Spending Data:
    ${JSON.stringify(enrichedData, null, 2)}

    Respond ONLY with a valid JSON object containing a "recommendations" array. Do not include markdown formatting like \`\`\`json.
    Each object in the array MUST follow this exact schema (strictly valid JSON, NO comments, NO math expressions):
    {
      "recommendations": [
        {
          "id": "rec-123",
          "icon": "lightbulb-on",
          "title": "Actionable title mentioning specific merchant",
          "subtitle": "Context using their actual data",
          "issue": "Educational explanation of the issue",
          "estFees": "P 150.00",
          "betterOption": "Clear, actionable step-by-step plan",
          "saving": "P 45.00/month",
          "savingRaw": 45,
          "severity": "high"
        }
      ]
    }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Groq's fast Llama 3.1 model
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;
    
    // Extract JSON safely in case the LLM wrapped it in markdown
    const jsonMatch = text.match(/```json([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

    const parsed = JSON.parse(jsonString);
    const recommendations = parsed.recommendations || (Array.isArray(parsed) ? parsed : []);

    return recommendations.sort((a, b) => b.savingRaw - a.savingRaw);
  } catch (error) {
    console.error("AI Recommendation Engine Error:", error);
    
    let issueText = `SmartSpend encountered an error: ${error.message}`;
    let betterOption = 'Check your internet connection or try again later.';
    
    if (error.message.includes('401') || error.message.includes('invalid api key')) {
      issueText = "SmartSpend intelligence engine is currently unavailable.";
      betterOption = "Please restart the app or try again later.";
    } else if (error.message.includes('429')) {
      issueText = "SmartSpend is currently analyzing too many requests.";
      betterOption = "Wait a few moments before trying again.";
    }

    // 2. VISUAL CHECK: Show API connection errors to the user
    return [{
      id: 'api-error',
      icon: 'alert-circle-outline',
      title: 'SmartSpend Analysis Failed',
      subtitle: 'Engine temporarily offline',
      issue: issueText,
      estFees: 'P 0.00',
      betterOption: betterOption,
      saving: 'Analysis Offline',
      savingRaw: 0,
      severity: 'high'
    }];
  }
};