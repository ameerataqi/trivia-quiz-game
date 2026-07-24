/**
 * OpenTDB returns question text with HTML entities in it — you see things like
 * `&quot;` and `&#039;` on screen instead of `"` and `'`.
 *
 * React Native has no DOM, so there is no innerHTML trick available here; this
 * decodes numeric entities (decimal and hex) plus the named ones the trivia
 * bank actually uses.
 */

const NAMED = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  shy: '',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  deg: '°',
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  auml: 'ä',
  ouml: 'ö',
  uuml: 'ü',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  ntilde: 'ñ',
  ccedil: 'ç',
  aring: 'å',
  oslash: 'ø',
  szlig: 'ß',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  copy: '©',
  reg: '®',
  trade: '™',
  frac12: '½',
  frac14: '¼',
  times: '×',
  divide: '÷',
  prime: '′',
  Prime: '″',
};

/**
 * @param {string} input possibly entity-encoded text
 * @returns {string} plain text safe to render
 */
export function decodeHtml(input) {
  if (typeof input !== 'string' || input.indexOf('&') === -1) return input ?? '';

  return input.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (match, body) => {
    // Numeric: &#39; (decimal) or &#x27; (hex)
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch (e) {
        return match;
      }
    }

    // Named — case-sensitive first (&Prime vs &prime), then lowercase.
    const named = NAMED[body] ?? NAMED[body.toLowerCase()];
    return named !== undefined ? named : match;
  });
}

export default decodeHtml;
