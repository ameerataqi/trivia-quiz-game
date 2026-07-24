/**
 * The AI opponent, played by `openai/gpt-oss-20b:free` via OpenRouter.
 *
 * The model is shown the same four options as the player and must commit to
 * one letter. Anything that goes wrong — no key, timeout, quota, an
 * unparseable reply — resolves to `{ ok: false }` and simply counts as the AI
 * failing to answer, so the game never blocks on the model.
 *
 * The key is read from EXPO_PUBLIC_OPENROUTER_API_KEY (set it in .env.local
 * for local play, or as an environment variable on Vercel). Being an
 * EXPO_PUBLIC_ value it ships inside the client bundle — acceptable for a
 * free-tier model, but do not reuse a key you care about.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const AI_MODEL = 'openai/gpt-oss-20b:free';
const TIMEOUT_MS = 25000;

const LETTERS = ['A', 'B', 'C', 'D'];

export function hasAiKey() {
  return !!process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
}

/** Pull the model's chosen letter out of its reply. */
function parseChoice(text) {
  if (typeof text !== 'string') return null;
  // Prefer a lone letter ("C", "C.", "C)"), else the first A-D word boundary.
  const exact = text.trim().match(/^\(?([ABCD])[).\s]*$/i);
  if (exact) return exact[1].toUpperCase();
  const anywhere = text.match(/\b([ABCD])\b/);
  return anywhere ? anywhere[1].toUpperCase() : null;
}

/**
 * The free-tier pool intermittently 429s even at low volume, so failed calls
 * are retried a couple of times. The player is usually still reading the
 * question, so the retries cost nothing visible.
 */
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Asks the model one question, retrying transient failures.
 *
 * @param {object} question normalised question ({ question, options })
 * @returns {Promise<{ok: boolean, letter?: string, answer?: string, reason?: string}>}
 */
export async function askAi(question) {
  let last = { ok: false, reason: 'unknown' };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    last = await askOnce(question);
    if (last.ok) return last;
    // Only transient failures are worth retrying.
    const transient =
      last.reason === 'network' ||
      last.reason === 'timeout' ||
      /^http-(429|5\d\d)$/.test(last.reason || '');
    if (!transient || attempt === MAX_ATTEMPTS) break;
    await wait(RETRY_DELAY_MS);
  }

  return last;
}

async function askOnce(question) {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, reason: 'missing-key' };

  const optionLines = question.options
    .map((option, i) => `${LETTERS[i]}) ${option}`)
    .join('\n');

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller?.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content:
              'You are a trivia contestant. Answer the multiple-choice question with ONLY the letter of your choice: A, B, C or D. No explanation.',
          },
          {
            role: 'user',
            content: `${question.question}\n\n${optionLines}\n\nYour answer (one letter):`,
          },
        ],
      }),
    });

    if (!response.ok) return { ok: false, reason: `http-${response.status}` };

    const payload = await response.json();
    const letter = parseChoice(payload?.choices?.[0]?.message?.content);
    if (!letter) return { ok: false, reason: 'unparseable' };

    const index = LETTERS.indexOf(letter);
    return { ok: true, letter, answer: question.options[index] };
  } catch (error) {
    return { ok: false, reason: error?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default askAi;
