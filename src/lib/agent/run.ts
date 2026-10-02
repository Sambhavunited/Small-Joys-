import Anthropic from "@anthropic-ai/sdk";
import type { ChatTurn, ClientLeadState } from "@/lib/chat-protocol";
import type { CartLine } from "@/lib/cart";
import { SYSTEM_PROMPT, websiteState } from "@/lib/agent/prompt";
import { runTool, ToolInputError, TOOLS, toolStatus, type TurnState } from "@/lib/agent/tools";

type BetaMessageParam = Anthropic.Beta.BetaMessageParam;
type BetaToolResultBlockParam = Anthropic.Beta.BetaToolResultBlockParam;
type BetaToolUseBlock = Anthropic.Beta.BetaToolUseBlock;

const MAX_ITERATIONS = 6;

export const DEFAULT_MODEL = "claude-opus-5-5";

// Server-side refusal fallback is supported on these models (Claude API).
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5", "claude-fable-5-1"]);

export function agentConfig() {
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  const effortEnv = process.env.AGENT_EFFORT?.trim();
  const effort = (["low", "medium", "high", "xhigh", "max"] as const).find((e) => e === effortEnv) ?? "low";
  return { model, effort, enabled: Boolean(process.env.ANTHROPIC_API_KEY) };
}

function escapeTags(text: string) {
  return text.replace(/</g, "‹").replace(/>/g, "›");
}

/** Build the request messages. Earlier turns are plain text; the newest turn carries the website state. */
export function buildMessages(history: ChatTurn[], state: { cart: CartLine[]; lead: ClientLeadState; page?: string }) {
  const messages: BetaMessageParam[] = [];
  const last = history.length - 1;
  history.forEach((turn, i) => {
    if (i === last && turn.role === "user") {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `<website_state>\n${websiteState(state)}\n</website_state>` },
          { type: "text", text: `<customer_message>\n${escapeTags(turn.text)}\n</customer_message>` },
        ],
      });
    } else {
      messages.push({ role: turn.role, content: turn.role === "user" ? escapeTags(turn.text) : turn.text });
    }
  });
  return messages;
}

export type AgentResult = { text: string; state: TurnState };

export async function runAgent(opts: {
  history: ChatTurn[];
  state: TurnState;
  page?: string;
  sessionId: string;
  signal?: AbortSignal;
}): Promise<AgentResult> {
  const { model, effort } = agentConfig();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 90_000 });
  const { state } = opts;
  const messages = buildMessages(opts.history, { cart: state.cart, lead: state.lead, page: opts.page });
  const useFallbacks = FALLBACK_MODELS.has(model);

  let fullText = "";
  let jsonRetries = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let iterationText = "";
    const stream = client.beta.messages.stream(
      {
        model,
        max_tokens: 16000,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        messages,
        output_config: { effort },
        cache_control: { type: "ephemeral" },
        metadata: { user_id: opts.sessionId.slice(0, 64) },
        ...(useFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      },
      { signal: opts.signal },
    );

    stream.on("text", (delta) => {
      if (!iterationText && fullText && !/\n\s*$/.test(fullText)) {
        state.emit({ t: "text", v: "\n\n" });
        fullText += "\n\n";
      }
      iterationText += delta;
      fullText += delta;
      state.emit({ t: "text", v: delta });
    });
    stream.on("streamEvent", (event) => {
      if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
        const label = toolStatus[event.content_block.name];
        if (label) state.emit({ t: "status", v: label });
      }
    });

    let message: Anthropic.Beta.BetaMessage;
    try {
      message = await stream.finalMessage();
      jsonRetries = 0;
    } catch (err) {
      // With eager input streaming, a tool input that isn't valid JSON rejects here.
      // Retry that turn a couple of times; real API errors are rethrown.
      if (err instanceof Anthropic.APIError || opts.signal?.aborted || jsonRetries++ >= 2 || iterationText) throw err;
      console.warn("Retrying turn after unparseable tool input", err);
      continue;
    }

    if (message.stop_reason === "refusal") {
      if (!iterationText) {
        const sorry =
          "I'm sorry, I can't help with that here. I'm happy to help you choose treats or gifts, or you can message Deepika directly on WhatsApp.";
        state.emit({ t: "text", v: (fullText ? "\n\n" : "") + sorry });
        fullText += (fullText ? "\n\n" : "") + sorry;
      }
      break;
    }

    const toolUses = message.content.filter((b): b is BetaToolUseBlock => b.type === "tool_use");
    // A tool input cut off at max_tokens can still parse, so never run tools unless the turn ended on tool_use.
    if (message.stop_reason !== "tool_use" || toolUses.length === 0) break;

    // Append the assistant turn unchanged (thinking blocks included) before the tool results.
    messages.push({ role: "assistant", content: message.content });

    const results: BetaToolResultBlockParam[] = [];
    for (const use of toolUses) {
      try {
        const { content, isError } = runTool(use.name, use.input, state);
        results.push({ type: "tool_result", tool_use_id: use.id, content, ...(isError ? { is_error: true } : {}) });
      } catch (err) {
        const detail =
          err instanceof ToolInputError
            ? `Invalid input for ${use.name}: ${err.message}. Raw input: ${JSON.stringify(use.input).slice(0, 500)}`
            : `Tool ${use.name} failed.`;
        if (!(err instanceof ToolInputError)) console.error("Tool error", use.name, err);
        results.push({ type: "tool_result", tool_use_id: use.id, content: detail, is_error: true });
      }
    }
    messages.push({ role: "user", content: results });

    if (iteration === MAX_ITERATIONS - 1 && !fullText) {
      const done = "Done! Let me know what else you'd like, or tap the WhatsApp button when you're ready.";
      state.emit({ t: "text", v: done });
      fullText = done;
    }
  }

  return { text: fullText.trim(), state };
}
