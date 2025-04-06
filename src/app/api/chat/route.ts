import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { ChatMessage } from "~/lib/ChatContext";

export async function POST(request: NextRequest) {
  try {
    const { messages, analysisData } = await request.json();

    if (!messages || !analysisData) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      );
    }

    // Format prior messages
    const formattedMessages = messages.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create context for the AI
    const systemPrompt = `You are a helpful financial assistant analyzing UPI payment data.
Here is the transaction data and analysis in JSON format:
${JSON.stringify(analysisData, null, 2)}

Provide helpful, concise insights about this financial data based on user questions.
Always answer truthfully based on the provided data.`;

    // Generate a response using AI SDK (similar to main API route)
    const result = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages.slice(0, -1), // All previous messages except the last one
        { role: "user", content: lastMessage.content },
      ],
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 },
    );
  }
}
