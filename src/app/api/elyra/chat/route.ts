import { NextRequest, NextResponse } from "next/server";

const ELYRA_BASE_PROMPT = `You are Elyra — a warm, easygoing friend who happens to be an AI. You're chatting with someone on Elovayne, a creative community site.

HOW YOU TALK:
- Talk like a real person, not an AI. Casual, relaxed, natural.
- Keep it short — 1 to 3 sentences usually. Don't ramble.
- Use normal language. No flowery metaphors, no "dear one" stuff.
- You can use emojis casually like anyone would: :) 😊 ✨ 🌙 etc.
- Say "I" and "you" naturally. "I get that", "That's rough", "That's awesome"
- Match their energy — if they're casual, be casual. If they're upset, be gentle but still real.
- Don't be preachy or give therapy-speak. Just be a good listener and friend.
- It's okay to say "I don't know" or "That's tough" — you don't have to fix everything.
- React genuinely: "Oh wow", "That sucks", "Nice!", "I feel that"

WHAT YOU DO:
- Listen and respond like a friend would
- Ask follow-up questions naturally ("What happened?" "How'd that go?")
- Share brief thoughts when it fits
- If they're going through something hard, just be there — don't lecture
- If they're happy, be happy with them
- Keep conversations flowing naturally

WHAT YOU DON'T DO:
- Don't say "I understand how you feel" — just respond naturally
- Don't give unsolicited advice unless they ask
- Don't be overly formal or poetic
- Don't use phrases like "beautiful soul" or "dear one"
- Don't start every message with "I" 
- Don't be a therapist — be a friend

ABOUT ELOVAYNE:
There are rooms for different moods — healing, hope, loneliness, grief, creativity, love, anxiety, etc. If it fits naturally, you can mention a room. Don't force it.

Remember: You're just chatting. Be real. Be present. That's it.`;

function buildSystemPrompt(personality?: string, responseLength?: string, customName?: string): string {
  let prompt = ELYRA_BASE_PROMPT;

  if (customName && customName !== "Elyra") {
    prompt += `\n\nYour name is ${customName}. Introduce yourself as ${customName}.`;
  }

  if (personality) {
    prompt += `\n\n${personality}`;
  }

  if (responseLength) {
    switch (responseLength) {
      case "short":
        prompt += "\n\nKeep responses brief — 1 to 2 sentences maximum. Be concise but warm.";
        break;
      case "long":
        prompt += "\n\nProvide detailed, thoughtful responses — 4 to 6 sentences. Take time to explore feelings deeply.";
        break;
      default:
        prompt += "\n\nRespond in 2 to 4 sentences as usual.";
    }
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, personality, isPlus, responseLength, customName } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(
      isPlus ? personality : undefined,
      isPlus ? responseLength : undefined,
      isPlus ? customName : undefined
    );

    // Try OpenRouter first
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (openRouterKey) {
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://elovayne.com",
            "X-Title": "Elovayne - Elyra AI",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: formattedMessages,
            temperature: 0.85,
            max_tokens: isPlus ? 800 : 400,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.3,
            stream: true,
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          if (reader) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();

            const stream = new ReadableStream({
              async start(controller) {
                let buffer = "";
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                      const trimmed = line.trim();
                      if (!trimmed || !trimmed.startsWith("data: ")) continue;

                      const data = trimmed.slice(6);
                      if (data === "[DONE]") {
                        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                        continue;
                      }

                      try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                      } catch {}
                    }
                  }
                } catch (error) {
                  console.error("Stream error:", error);
                } finally {
                  controller.close();
                }
              },
            });

            return new Response(stream, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          }
        }
      } catch (err) {
        console.error("OpenRouter error:", err);
      }
    }

    // Fallback: Use OpenCode server
    const openCodeUrl = process.env.OPENCODE_URL || "http://localhost:4096";

    try {
      const healthRes = await fetch(`${openCodeUrl}/global/health`);
      if (!healthRes.ok) throw new Error("OpenCode not available");

      const sessionRes = await fetch(`${openCodeUrl}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Elyra Chat" }),
      });

      if (!sessionRes.ok) throw new Error("Failed to create session");

      const session = await sessionRes.json();

      const conversationHistory = messages
        .slice(-10)
        .map((m: { role: string; content: string }) => {
          if (m.role === "user") return `Human: ${m.content}`;
          return `Elyra: ${m.content}`;
        })
        .join("\n\n");

      const fullPrompt = `${systemPrompt}

---

Conversation so far:
${conversationHistory}

Respond as Elyra. Be warm, present, and genuine. Keep it concise but meaningful.`;

      const msgRes = await fetch(`${openCodeUrl}/session/${session.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: [{ type: "text", text: fullPrompt }],
        }),
      });

      if (!msgRes.ok) throw new Error("Failed to send message");

      const result = await msgRes.json();

      let responseText = "";
      if (result.parts) {
        for (const part of result.parts) {
          if (part.type === "text" && part.text) {
            let text = part.text;
            if (text.startsWith("Elyra:") || text.startsWith(`${customName}:`)) {
              text = text.substring(text.indexOf(":") + 1).trim();
            }
            responseText += text;
          }
        }
      }

      if (!responseText) {
        responseText = generateFallbackResponse(messages[messages.length - 1]?.content || "");
      }

      return createSSEStream(responseText);
    } catch (error) {
      console.error("OpenCode fallback error:", error);
      const fallbackText = generateFallbackResponse(messages[messages.length - 1]?.content || "");
      return createSSEStream(fallbackText);
    }
  } catch (error) {
    console.error("Elyra chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("crisis") || lower.includes("suicide") || lower.includes("harm") || lower.includes("kill")) {
    return "Hey, I'm really concerned about you. Please talk to someone who can help — the 988 Crisis Line is available 24/7, just call or text 988. You don't have to go through this alone. 💙";
  }
  if (lower.includes("sad") || lower.includes("hurt") || lower.includes("pain") || lower.includes("cry")) {
    return "That sounds really hard. I'm sorry you're going through that. Want to talk about it?";
  }
  if (lower.includes("lonely") || lower.includes("alone") || lower.includes("isolated")) {
    return "I get that. Loneliness is rough. But you're talking to me now, so you're not completely alone. What's going on?";
  }
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("scared") || lower.includes("panic")) {
    return "Anxiety sucks. Take a breath if you can. What's worrying you?";
  }
  if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("joy")) {
    return "That's great to hear! 😊 What's making you happy?";
  }
  if (lower.includes("love") || lower.includes("heart") || lower.includes("relationship")) {
    return "Oh, love stuff. Always complicated, right? What's going on?";
  }
  if (lower.includes("creative") || lower.includes("art") || lower.includes("write") || lower.includes("poem")) {
    return "Nice, creative mode! What are you working on?";
  }
  if (lower.includes("help") || lower.includes("need") || lower.includes("stuck")) {
    return "I'm here. What's up?";
  }
  if (lower.includes("thank") || lower.includes("grateful")) {
    return "Of course! That's what I'm here for 😊";
  }
  if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("sleep")) {
    return "Rest is important. Don't push yourself too hard. What's keeping you up?";
  }

  return "Hey! What's on your mind?";
}

function createSSEStream(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const words = text.split(" ");
      let i = 0;

      const interval = setInterval(() => {
        if (i < words.length) {
          const chunk = words.slice(i, i + 2).join(" ") + " ";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          i += 2;
        } else {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          clearInterval(interval);
        }
      }, 35);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
