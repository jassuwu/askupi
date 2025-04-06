import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * API route for analyzing UPI statements
 *
 * Privacy & Data handling:
 * - Files are only forwarded to Google's AI model and never stored on our servers
 * - Analysis happens entirely through the Google AI API
 * - No database or server-side storage of user data
 * - Results are returned directly to the client for local storage
 */
export async function POST(req: Request) {
  try {
    // Extract the file from the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      "Starting analysis for",
      file.name,
      "type:",
      file.type,
      "size:",
      file.size,
    );

    // Convert file to buffer to send to AI model
    const fileBuffer = await file.arrayBuffer();
    console.log("File buffer prepared, sending to AI model");

    // Send to Google AI model - file is not stored, only processed
    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the attached PDF file containing a UPI transaction statement. Extract key information and provide a minimal, compact JSON response with only essential data:

1. transactions: Array with transactions with these fields:
   - date (YYYY-MM-DD)
   - amount (numeric value, negative for debits, positive for credits)
   - description (keep brief, max 50 chars)
   - category (categorize as: 'food', 'shopping', 'entertainment', 'utilities', 'transport', 'health', 'education', 'travel', 'subscription', 'other')
   - upi_id (include only if critical, otherwise null)

2. summary: Only these essential fields:
   - total_spent (total of all negative transactions)
   - total_received (total of all positive transactions)
   - net_change (net change in balance)
   - transaction_count (total number of transactions)
   - start_date (earliest transaction date)
   - end_date (latest transaction date)

3. category_breakdown: Just category names as keys with total and percentage fields

4. insights: Maximum 3 most important insights with:
   - type ('saving_opportunity', 'spending_pattern', 'anomaly', 'tip')
   - description (keep under 80 chars)
   - impact (estimated financial impact if applicable, null if not)

5. recommendations: Maximum 3 key recommendations with:
   - category
   - action (keep under 80 chars)
   - potential_savings

Exclude any entries that are not actual transactions (e.g., opening balance, service fees). 
IMPORTANT: Format your response as PURE JSON without any markdown formatting or code blocks. Return ONLY a clean, valid JSON object - no prefix/suffix text, no backticks, no json keywords.`,
            },
            {
              type: "file",
              mimeType: file.type,
              data: fileBuffer,
              filename: file.name,
            },
          ],
        },
      ],
    });

    // Clean and parse the response
    console.log("Analysis complete, parsing results");

    let cleanedResponse = result.text;

    // Try to extract JSON if it's wrapped in code blocks
    const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      cleanedResponse = jsonMatch[1];
    }

    // Remove any non-JSON text before or after
    cleanedResponse = cleanedResponse.trim();
    // If it starts with non-JSON character, try to find the start of JSON
    if (cleanedResponse.charAt(0) !== "{") {
      const jsonStart = cleanedResponse.indexOf("{");
      if (jsonStart >= 0) {
        cleanedResponse = cleanedResponse.substring(jsonStart);
      }
    }
    // If it ends with non-JSON character, try to find the end of JSON
    if (cleanedResponse.charAt(cleanedResponse.length - 1) !== "}") {
      const jsonEnd = cleanedResponse.lastIndexOf("}");
      if (jsonEnd >= 0) {
        cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
      }
    }

    // Try to parse the cleaned response
    try {
      const parsedData = JSON.parse(cleanedResponse);
      return Response.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      return Response.json(
        {
          error: "Failed to parse analysis data",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
          rawResponse: result.text.substring(0, 1000), // Include part of the raw response for debugging
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error during file analysis:", error);

    // Check if it's an AbortError (client canceled the request)
    if (error instanceof DOMException && error.name === "AbortError") {
      return Response.json(
        { error: "Request cancelled by client" },
        { status: 499 },
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
