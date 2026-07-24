import { decodeHtml } from '../utils/decodeHtml';
import { shuffle } from '../utils/shuffle';
import { getCategoryCode } from '../data/categories';

const BASE_URL = 'https://opentdb.com/api.php';
const TOKEN_URL = 'https://opentdb.com/api_token.php';

/** OpenTDB allows one request per IP every 5 seconds; leave headroom. */
const MIN_REQUEST_GAP_MS = 5400;
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RATE_LIMIT_RETRIES = 3;

/** OpenTDB's documented response codes. */
const RESPONSE_CODE = {
  SUCCESS: 0,
  NO_RESULTS: 1,
  INVALID_PARAMETER: 2,
  TOKEN_NOT_FOUND: 3,
  TOKEN_EMPTY: 4,
  RATE_LIMIT: 5,
};

/** Error carrying a player-facing message, so screens never invent their own. */
export class TriviaError extends Error {
  constructor(message, { code, retryable = true } = {}) {
    super(message);
    this.name = 'TriviaError';
    this.code = code;
    this.retryable = retryable;
  }
}

// ---------------------------------------------------------------------------
// Request queue
//
// Every call funnels through one promise chain so two screens can never fire
// concurrent requests and trip the rate limit. Each request also waits out the
// remainder of the gap since the previous one.
// ---------------------------------------------------------------------------

let chain = Promise.resolve();
let lastRequestAt = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function enqueue(task) {
  const run = chain.then(async () => {
    const sinceLast = Date.now() - lastRequestAt;
    if (lastRequestAt && sinceLast < MIN_REQUEST_GAP_MS) {
      await wait(MIN_REQUEST_GAP_MS - sinceLast);
    }
    lastRequestAt = Date.now();
    return task();
  });

  // Keep the chain alive even if this task rejects, so one failure does not
  // wedge every later request.
  chain = run.catch(() => {});
  return run;
}

async function fetchJson(url) {
  // AbortController is available in Expo/RN and on web; guard anyway.
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  try {
    const response = await fetch(url, { signal: controller?.signal });
    if (!response.ok) {
      throw new TriviaError(`The trivia service returned an error (${response.status}).`, {
        code: response.status,
      });
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TriviaError) throw error;
    if (error?.name === 'AbortError') {
      throw new TriviaError('The trivia service took too long to respond.');
    }
    throw new TriviaError('Could not reach the trivia service. Check your connection.');
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Session token
//
// Without a token OpenTDB samples randomly, so playing twice can serve the
// same question. A token makes the service remember what it has already given
// us and never repeat until the pool is exhausted.
// ---------------------------------------------------------------------------

let sessionToken = null;

async function requestToken() {
  try {
    const payload = await enqueue(() => fetchJson(`${TOKEN_URL}?command=request`));
    sessionToken = payload?.token || null;
  } catch (error) {
    // A token is an optimisation, not a requirement — carry on without it.
    sessionToken = null;
  }
  return sessionToken;
}

async function resetToken() {
  if (!sessionToken) return null;
  try {
    await enqueue(() => fetchJson(`${TOKEN_URL}?command=reset&token=${sessionToken}`));
  } catch (error) {
    sessionToken = null;
  }
  return sessionToken;
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

let localId = 0;

/**
 * Converts one OpenTDB result into the shape the game already renders.
 *
 * OpenTDB gives a correct answer and three incorrect ones separately, so the
 * four options are combined and shuffled here — otherwise the correct answer
 * would always sit in the same slot.
 *
 * Note there is no explanation in the API response; `explanation` is
 * deliberately absent rather than invented.
 */
function normalise(raw) {
  const correctAnswer = decodeHtml(raw.correct_answer);
  const incorrect = (raw.incorrect_answers || []).map(decodeHtml);
  const options = shuffle([correctAnswer, ...incorrect]);

  localId += 1;

  return {
    id: `otdb-${localId}`,
    question: decodeHtml(raw.question),
    options,
    correctAnswer,
    category: decodeHtml(raw.category),
    difficulty: capitalise(raw.difficulty),
    source: 'opentdb',
  };
}

function capitalise(value) {
  if (!value) return 'Medium';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** A question is only usable if it has exactly four distinct options. */
export function isUsable(q) {
  return (
    q &&
    typeof q.question === 'string' &&
    q.question.length > 0 &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    new Set(q.options).size === 4 &&
    q.options.includes(q.correctAnswer)
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function buildUrl({ amount, category, difficulty, token }) {
  const params = [`amount=${amount}`, 'type=multiple'];

  const code = getCategoryCode(category);
  if (code) params.push(`category=${code}`);
  if (difficulty) params.push(`difficulty=${String(difficulty).toLowerCase()}`);
  if (token) params.push(`token=${token}`);

  return `${BASE_URL}?${params.join('&')}`;
}

/**
 * Fetches questions from the Open Trivia Database.
 *
 * @param {object}  options
 * @param {number}  options.amount     how many to request (OpenTDB caps at 50)
 * @param {string}  options.category   category name, or 'All' for any
 * @param {string}  options.difficulty 'Easy' | 'Medium' | 'Hard', or null for any
 * @returns {Promise<Array<object>>} normalised, decoded, option-shuffled questions
 */
export async function fetchQuestions({ amount = 12, category, difficulty } = {}) {
  const capped = Math.max(1, Math.min(50, amount));

  if (!sessionToken) await requestToken();

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const url = buildUrl({ amount: capped, category, difficulty, token: sessionToken });
    const payload = await enqueue(() => fetchJson(url));

    switch (payload.response_code) {
      case RESPONSE_CODE.SUCCESS: {
        const questions = (payload.results || []).map(normalise).filter(isUsable);
        if (!questions.length) {
          throw new TriviaError('That combination returned no usable questions.');
        }
        return questions;
      }

      case RESPONSE_CODE.RATE_LIMIT:
        // The queue already spaces requests; this covers another app or tab on
        // the same IP. Wait out a full window and try again.
        if (attempt === MAX_RATE_LIMIT_RETRIES) {
          throw new TriviaError('The trivia service is rate limiting us. Try again in a moment.');
        }
        await wait(MIN_REQUEST_GAP_MS);
        break;

      case RESPONSE_CODE.TOKEN_EMPTY:
        // Every question for this filter has been served — reset and refetch.
        await resetToken();
        break;

      case RESPONSE_CODE.TOKEN_NOT_FOUND:
        // Token expired (they last ~6h of inactivity) — get a new one.
        sessionToken = null;
        await requestToken();
        break;

      case RESPONSE_CODE.NO_RESULTS:
        throw new TriviaError(
          'Not enough questions for that category and difficulty. Try another combination.',
          { retryable: false },
        );

      case RESPONSE_CODE.INVALID_PARAMETER:
        throw new TriviaError('That request was not valid.', { retryable: false });

      default:
        throw new TriviaError('The trivia service sent something unexpected.');
    }
  }

  throw new TriviaError('Could not load questions. Try again.');
}

export default fetchQuestions;
