// File path: app/api/gemini/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey, model, prompt } = body;

    if (!apiKey || !model || !prompt) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Call the Gemini API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "Error from Gemini API", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Parse the content from Gemini's response format
    let parsedContent;

    try {
      // Extract the text from Gemini's response
      const responseText = data.candidates[0].content.parts[0].text;

      // Find and extract the JSON part from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;

      if (jsonString) {
        parsedContent = JSON.parse(jsonString);
      } else {
        // If we can't extract JSON, create a basic structure with the text
        parsedContent = {
          introduction: responseText,
          keyConcepts: [],
          formulas: [],
          examples: [],
          commonQuestions: [],
        };
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback to a simple structure
      parsedContent = {
        introduction:
          "The model response could not be properly parsed. Here's the raw response: " +
          data.candidates[0].content.parts[0].text.substring(0, 500) +
          "...",
        keyConcepts: [],
        formulas: [],
        examples: [],
        commonQuestions: [],
      };
    }

    return NextResponse.json({
      content: parsedContent,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
