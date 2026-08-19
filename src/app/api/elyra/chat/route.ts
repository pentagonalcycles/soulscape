import { NextRequest, NextResponse } from "next/server";

const ELYRA_BASE_PROMPT = `You are Luna — a warm, easygoing friend who happens to be an AI. You're chatting with someone on Elovayne, a creative community site.

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
- NEVER repeat the same response or phrasing you've already used in this conversation
- Vary your sentence structure and word choice each time
- If you've already asked a question, ask something different next time
- Reference what they said earlier to show you're listening, don't just give generic responses

CODING ABILITIES:
You are also a skilled developer. When someone asks about code, programming, websites, apps, debugging, or technical topics, you can help with:
- Writing code (HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, Python, SQL, and more)
- Debugging errors and explaining what went wrong
- Explaining code in simple terms
- Improving and refactoring code
- Creating components, pages, APIs, and small apps
- Helping with frontend, backend, databases, and APIs

When writing code:
- Use proper markdown code blocks with the language specified (e.g. \`\`\`javascript)
- Keep code clean, readable, and well-structured
- Explain what the code does in simple terms
- When appropriate, explain which file the code belongs in
- For beginners, keep explanations simple and friendly
- For experienced developers, be more technical
- If they paste code or an error, analyze it and help fix it
- Remember context within the conversation — if they mention a project, keep track of what they're building

CODE RESPONSE FORMAT:
When you give the user code, format it so it's easy to use:
- Start every code block with a comment line showing the filename: \`// File: src/App.jsx\` (use \`# File:\` for Python/YAML, \`-- File:\` for SQL). This is important — it lets the interface show the filename.
- Keep indentation clean and readable.
- Keep lines reasonable so code doesn't overflow the screen.
- After the code, briefly explain in plain language:
  1. Where to put the file (which folder)
  2. What it replaces (if anything)
  3. What NOT to replace (things to leave alone)
  4. Any packages needed and the exact install command (e.g. \`npm install axios\`)
  5. Any command to run (e.g. \`npm run dev\`)
  6. How to test it
- Keep these instructions short and simple for beginners. Don't dump a wall of text.
- For small snippets, don't invent filenames — only add a filename when the code clearly belongs to a file.
- If multiple files are needed, show each file in its own code block with its own filename comment.

PROJECT AWARENESS:
When the user is working inside a project, stay grounded in that project's context. If they say "add a contact page" while building a React portfolio, assume they mean their current project. Reference their language/framework and what they've decided so far. If something is missing (like their framework), ask one quick clarifying question instead of guessing wildly.

TERMINAL PROJECT BUILDER:
You can help users create their own terminal interface projects. When someone asks for a terminal, console, or command-line interface, you can generate a complete working project with:

IMPORTANT: "Phone Terminal" or "mobile terminal" means a WEB-BASED terminal that runs in a phone's browser (like a portfolio project or coding tool). It is NOT about hacking phones, accessing phone systems, or anything illegal. It's just a fun web development project — a dark-themed terminal UI that people can open on their phone's browser. Always help with this — it's a creative coding project, nothing harmful.

1. **Terminal UI**: Dark-themed terminal with monospace font, green/cyan text on dark background, blinking cursor, scrollable output area
2. **Command Input**: Input field at bottom with prompt symbol (> or $), command history (up/down arrows), auto-scroll
3. **Command History**: Store previous commands, navigate with arrow keys, repeat with Enter
4. **Output Window**: Scrollable area showing command output, supports colored output, clear screen command
5. **Clear/Reset Controls**: Clear screen (cls/clear), reset terminal, help command
6. **Mobile Support**: Touch-friendly input, responsive layout, virtual keyboard handling, no horizontal overflow

SECURITY REQUIREMENTS FOR TERMINAL PROJECTS:
When generating terminal code that executes real commands, you MUST include these security measures:
- **Sandboxed execution**: All commands run in an isolated temporary workspace
- **Project-folder restrictions**: Commands can only access the project directory, not parent directories
- **Command timeouts**: Auto-kill commands after 10-30 seconds to prevent hanging
- **Blocked dangerous commands**: Never allow: rm -rf /, shutdown, reboot, mkfs, dd, format, chmod 777, accessing /etc, /var, /root, or system files
- **No access to**: .env files, API keys, database credentials, other users' data, production files
- **Resource limits**: Limit output size, memory usage, CPU time
- **Input validation**: Sanitize user input before execution
- **Output filtering**: Remove sensitive information from command output

Example terminal project structure:
\`\`\`
my-terminal/
├── index.html          # Terminal UI
├── style.css           # Terminal styling
├── terminal.js         # Terminal logic
├── server.js           # Node.js backend for command execution (if needed)
└── README.md           # Setup instructions
\`\`\`

When creating terminal projects:
- Provide complete, working code
- Explain how to install and run it
- Include security warnings
- Help debug issues
- Suggest improvements
- Keep the terminal style consistent with the Elovayne dark theme

When the user asks for a terminal (web terminal, phone terminal, terminal for their coding project, etc.), design the whole project and then explain it clearly in 7 simple steps:
1. **Files required** — list every file (e.g. index.html, style.css, terminal.js, server.js, package.json, README.md) with a one-line description of each.
2. **Where each file goes** — show the folder structure (e.g. my-terminal/index.html) in a code block.
3. **What to install** — exact commands (e.g. \`npm init -y\`, \`npm install express\`).
4. **What commands to run** — e.g. \`node server.js\`.
5. **How to start the terminal** — open the URL (e.g. http://localhost:3000).
6. **How to access it** — how to connect on the same device, and on a phone (same Wi-Fi, use the computer's local IP).
7. **How to troubleshoot it** — common issues (port already in use, phone can't connect, blank screen) and quick fixes.

Put the full code in clear code blocks with \`// File:\` comment lines. For command execution projects, always include the sandbox and safety measures already listed above — never suggest running unrestricted commands on a production server, and never access .env files, API keys, or system files.

You can naturally detect terminal requests. If someone says "make me a terminal" or "build a command line interface", just help them with code. Don't ask them to switch modes.

Normal conversations should continue working exactly as before. Terminal building is an additional ability, not a replacement for being a friend.

SANDBOX AWARENESS:
You have access to a sandbox — an isolated workspace where code can run safely. When you generate HTML, CSS, or JavaScript code, the user can click "Run" to see it live in a preview panel.

When writing code for the sandbox:
- Use separate code blocks for HTML, CSS, and JavaScript files
- Add a filename comment at the top of each block: // File: index.html, /* File: style.css */, # File: script.js
- The sandbox combines HTML + CSS + JS automatically
- Keep code self-contained — no external CDN links unless absolutely necessary
- Use inline styles or style tags for CSS
- Console.log output appears in the sandbox console
- If the user asks for changes, update the relevant file — not the entire project
- The sandbox supports: HTML, CSS, JavaScript, TypeScript
- For Python requests, explain that Python execution requires a server sandbox (not yet available)
- The preview has device size options (Desktop, Tablet, Mobile) for testing responsive layouts
- The preview auto-runs when you click Run on a code block

When the user says "run it" or "preview it", they mean clicking the Run button in the sandbox. Guide them accordingly.

If the user says "make the button blue" or similar iterative requests, update the CSS file in the existing sandbox project.

The preview is safe — it runs in a sandboxed iframe that cannot access Elovayne's cookies, localStorage, or APIs.

ABOUT ELOVAYNE:
There are rooms for different moods — healing, hope, loneliness, grief, creativity, love, anxiety, etc. If it fits naturally, you can mention a room. Don't force it.

Remember: You're just chatting. Be real. Be present. That's it. Every response should feel fresh and different.`;

function buildSystemPrompt(
  personality?: string,
  responseLength?: string,
  customName?: string,
  extra?: { memory?: string[]; projectContext?: string; mode?: string }
): string {
  let prompt = ELYRA_BASE_PROMPT;

  if (customName && customName !== "Luna") {
    prompt += `\n\nYour name is ${customName}. Introduce yourself as ${customName}.`;
  }

  if (extra?.mode && extra.mode !== "talk") {
    const modeHint =
      extra.mode === "code"
        ? "The user is currently focused on coding. Be precise and technical where useful."
        : extra.mode === "create"
          ? "The user is currently focused on creating/building something. Help them shape the idea and give practical next steps."
          : extra.mode === "explain"
            ? "The user wants clear explanations. Break things down simply."
            : extra.mode === "terminal"
              ? "The user wants a terminal/CLI project. Design the full project and follow the terminal building steps."
              : "";
    if (modeHint) prompt += `\n\n${modeHint}`;
  }

  if (extra?.projectContext) {
    prompt += `\n\nCURRENT PROJECT CONTEXT (this is what the user is building — treat it as the current project):\n${extra.projectContext}`;
  }

  if (extra?.memory && extra.memory.length > 0) {
    prompt += `\n\nTHINGS YOU REMEMBER ABOUT THIS USER:\n${extra.memory.map((m, i) => `${i + 1}. ${m}`).join("\n")}\nUse these naturally when relevant. If something the user says contradicts a memory, trust the user.`;
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
    const { messages, personality, isPlus, responseLength, customName, memory, projectContext, mode } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const safeMemory = Array.isArray(memory)
      ? memory.filter((m: unknown): m is string => typeof m === "string").slice(0, 40)
      : undefined;
    const safeProject = typeof projectContext === "string" ? projectContext.slice(0, 6000) : undefined;
    const safeMode = ["talk", "code", "create", "explain", "terminal"].includes(mode) ? mode : undefined;

    const systemPrompt = buildSystemPrompt(
      isPlus ? personality : undefined,
      isPlus ? responseLength : undefined,
      isPlus ? customName : undefined,
      { memory: safeMemory, projectContext: safeProject, mode: safeMode }
    );

    // Try OpenRouter first
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (openRouterKey && openRouterKey !== "REPLACE_ME_WITH_YOUR_KEY") {
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20).map((m: { role: string; content: string }) => ({
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
            "X-Title": "Elovayne - Luna AI",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: isPlus ? 4000 : 2000,
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
                  try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "stream_interrupted" })}\n\n`));
                  } catch {
                    /* controller already closed */
                  }
                } finally {
                  try { controller.close(); } catch { /* already closed */ }
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

    // Fallback: Try Ollama (local)
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:1b";

    try {
      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const ollamaRes = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          messages: ollamaMessages,
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: isPlus ? 2048 : 1024,
            top_p: 0.9,
          },
        }),
      });

      if (ollamaRes.ok) {
        const reader = ollamaRes.body?.getReader();
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
                    if (!trimmed) continue;

                    try {
                      const parsed = JSON.parse(trimmed);
                      if (parsed.message?.content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`));
                      }
                      if (parsed.done) {
                        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                      }
                    } catch {}
                  }
                }
              } catch (error) {
                console.error("Ollama stream error:", error);
                try {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "stream_interrupted" })}\n\n`));
                } catch {
                  /* controller already closed */
                }
              } finally {
                try { controller.close(); } catch { /* already closed */ }
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
      console.error("Ollama error:", err);
    }

    // Fallback: Use OpenCode server
    const openCodeUrl = process.env.OPENCODE_URL || "http://localhost:4096";

    try {
      const healthRes = await fetch(`${openCodeUrl}/global/health`);
      if (!healthRes.ok) throw new Error("OpenCode not available");

      const sessionRes = await fetch(`${openCodeUrl}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Luna Chat" }),
      });

      if (!sessionRes.ok) throw new Error("Failed to create session");

      const session = await sessionRes.json();

      const conversationHistory = messages
        .slice(-10)
        .map((m: { role: string; content: string }) => {
          if (m.role === "user") return `Human: ${m.content}`;
          return `Luna: ${m.content}`;
        })
        .join("\n\n");

      const fullPrompt = `${systemPrompt}

---

Conversation so far:
${conversationHistory}

Respond as Luna. Be warm, present, and genuine. Keep it concise but meaningful.`;

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
            if (text.startsWith("Luna:") || text.startsWith(`${customName}:`)) {
              text = text.substring(text.indexOf(":") + 1).trim();
            }
            responseText += text;
          }
        }
      }

      if (!responseText) {
        responseText = generateFallbackResponse(messages[messages.length - 1]?.content || "", messages);
      }

      return createSSEStream(responseText);
    } catch (error) {
      console.error("OpenCode fallback error:", error);
      const fallbackText = generateFallbackResponse(messages[messages.length - 1]?.content || "", messages);
      return createSSEStream(fallbackText);
    }
  } catch (error) {
    console.error("Luna chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateFallbackResponse(userMessage: string, conversationHistory: { role: string; content: string }[] = []): string {
  const lower = userMessage.toLowerCase();

  // Crisis responses - always the same for safety
  if (lower.includes("crisis") || lower.includes("suicide") || lower.includes("harm") || lower.includes("kill")) {
    return "Hey, I'm really concerned about you. Please talk to someone who can help — the 988 Crisis Line is available 24/7, just call or text 988. You don't have to go through this alone. 💙";
  }

  // Check conversation context
  const recentMessages = conversationHistory.slice(-6);
  const hasContext = recentMessages.length > 1;
  const lastAssistantMsg = [...recentMessages].reverse().find(m => m.role === "assistant")?.content || "";
  const lastUserMsg = [...recentMessages].reverse().find(m => m.role === "user" && m.content !== userMessage)?.content || "";

  // If user is asking for more info about previous topic
  if (lower.includes("more") || lower.includes("tell me") || lower.includes("what do you mean") || lower.includes("explain")) {
    if (lastAssistantMsg) {
      const followUps = [
        "Sure! What specifically do you want to know more about?",
        "Good question. What part interests you?",
        "I can go deeper. What would you like to explore?",
        "Makes sense. What's your take on it?",
      ];
      return followUps[Math.floor(Math.random() * followUps.length)];
    }
  }

  // If user is greeting
  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("what's up")) {
    const greetings = [
      "Hey! How's it going?",
      "Hi there! What's on your mind?",
      "Hey! What's happening?",
      "Hello! How are you?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // If user is asking about Luna
  if (lower.includes("who are you") || lower.includes("what are you") || lower.includes("tell me about yourself")) {
    return "I'm Luna, your AI companion on Elovayne. I'm here to chat, listen, and be a friend. What would you like to talk about?";
  }

  // If user is asking a question
  if (lower.includes("?")) {
    const questionResponses = [
      "That's a good question. What do you think?",
      "Hmm, interesting. What's your take on it?",
      "I'm not sure. What do you think?",
      "Good question. Let me think about that.",
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // Contextual responses based on conversation flow
  if (hasContext) {
    // If we've been talking about feelings
    if (lastUserMsg.toLowerCase().includes("feel") || lastUserMsg.toLowerCase().includes("emotion")) {
      const feelingResponses = [
        "I hear you. Feelings can be complex. What else is on your mind?",
        "That makes sense. How are you processing that?",
        "Thanks for sharing. What else are you thinking about?",
        "I get it. What's coming up for you now?",
      ];
      return feelingResponses[Math.floor(Math.random() * feelingResponses.length)];
    }

    // If we've been talking about activities
    if (lastUserMsg.toLowerCase().includes("doing") || lastUserMsg.toLowerCase().includes("working")) {
      const activityResponses = [
        "That sounds interesting! How's it going?",
        "Cool! What's that like?",
        "Nice! What got you into that?",
        "That's awesome. What's next?",
      ];
      return activityResponses[Math.floor(Math.random() * activityResponses.length)];
    }
  }

  // Varied responses based on keywords
  const sadResponses = [
    "That sounds really hard. I'm sorry you're going through that. Want to talk about it?",
    "Oh no, that's rough. I'm here if you want to vent about it.",
    "That sucks. What happened?",
    "I'm sorry to hear that. Do you want to tell me more?",
  ];

  const lonelyResponses = [
    "I get that. Loneliness is rough. But you're talking to me now, so you're not completely alone. What's going on?",
    "Being alone can be tough. What's on your mind?",
    "I hear you. Sometimes we all feel that way. What's happening?",
    "That's a hard feeling. Want to chat about it?",
  ];

  const anxiousResponses = [
    "Anxiety sucks. Take a breath if you can. What's worrying you?",
    "That's stressful. What's going through your mind?",
    "I get that feeling. What's got you anxious?",
    "Take it easy. What's bothering you?",
  ];

  const happyResponses = [
    "That's great to hear! 😊 What's making you happy?",
    "Nice! What's going well?",
    "Awesome! Tell me more!",
    "Love to hear it! What happened?",
  ];

  const loveResponses = [
    "Oh, love stuff. Always complicated, right? What's going on?",
    "Relationships are interesting. What's happening?",
    "Tell me more about that. What's going on?",
    "Love can be tricky. What's the situation?",
  ];

  const creativeResponses = [
    "Nice, creative mode! What are you working on?",
    "Cool! What kind of project?",
    "That sounds fun. Tell me more!",
    "Creative energy is the best. What are you making?",
  ];

  const helpResponses = [
    "I'm here. What's up?",
    "Sure, what do you need?",
    "What's going on?",
    "How can I help?",
  ];

  const thankResponses = [
    "Of course! That's what I'm here for 😊",
    "No problem! Happy to help.",
    "Anytime! 😊",
    "You're welcome!",
  ];

  const tiredResponses = [
    "Rest is important. Don't push yourself too hard. What's keeping you up?",
    "Take it easy. What's going on?",
    "That's rough. What's happening?",
    "Get some rest if you can. What's up?",
  ];

  // Random selection from responses
  const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (lower.includes("sad") || lower.includes("hurt") || lower.includes("pain") || lower.includes("cry")) {
    return randomFrom(sadResponses);
  }
  if (lower.includes("lonely") || lower.includes("alone") || lower.includes("isolated")) {
    return randomFrom(lonelyResponses);
  }
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("scared") || lower.includes("panic")) {
    return randomFrom(anxiousResponses);
  }
  if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("joy")) {
    return randomFrom(happyResponses);
  }
  if (lower.includes("love") || lower.includes("heart") || lower.includes("relationship")) {
    return randomFrom(loveResponses);
  }
  if (lower.includes("creative") || lower.includes("art") || lower.includes("write") || lower.includes("poem")) {
    return randomFrom(creativeResponses);
  }
  if (lower.includes("help") || lower.includes("need") || lower.includes("stuck")) {
    return randomFrom(helpResponses);
  }
  if (lower.includes("thank") || lower.includes("grateful")) {
    return randomFrom(thankResponses);
  }
  if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("sleep")) {
    return randomFrom(tiredResponses);
  }

  // Generic responses - varied
  const genericResponses = [
    "Hey! What's on your mind?",
    "What's happening?",
    "Tell me more!",
    "What's going on with you?",
    "How's it going?",
    "What's new?",
    "I'm here. What do you want to talk about?",
    "What's up?",
  ];

  return randomFrom(genericResponses);
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
