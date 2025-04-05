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
      model: google("gemini-2.0-flash-thinking-exp-01-21"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the attached HTML/CSV/PDF file containing a UPI transaction statement. Extract all transactions and provide a comprehensive analysis in a structured JSON format with the following:

1. transactions: Array of transactions with these fields:
   - date (YYYY-MM-DD)
   - time (HH:MM:SS or null if unavailable)
   - description (transaction details)
   - amount (numeric value, negative for debits, positive for credits)
   - upi_id (transaction reference or null if unavailable)
   - category (categorize each transaction: 'food', 'shopping', 'entertainment', 'utilities', 'transport', 'health', 'education', 'travel', 'subscription', 'other')

2. summary: Object containing:
   - total_spent (total of all negative transactions)
   - total_received (total of all positive transactions)
   - net_change (net change in balance)
   - transaction_count (total number of transactions)
   - start_date (earliest transaction date)
   - end_date (latest transaction date)

3. category_breakdown: Object with category names as keys and the following for each:
   - total (total amount spent in this category)
   - percentage (percentage of total spending)
   - count (number of transactions in this category)

4. insights: Array of objects with:
   - type ('saving_opportunity', 'spending_pattern', 'anomaly', 'tip')
   - description (clear explanation of the insight)
   - impact (estimated financial impact if applicable, null if not)

5. recommendations: Array of objects with:
   - category (which spending category this applies to)
   - action (recommended action to save money)
   - potential_savings (estimated monthly savings)

Exclude any entries that are not actual transactions (e.g., opening balance, service fees). Ensure the output is valid JSON parsable by Javascript. Do not include any preamble, postamble or conversational text, only the JSON object.`,
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

    // Return results to the client (no server-side storage)
    console.log("Analysis complete, returning results");
    return Response.json(result);
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
