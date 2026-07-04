const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#039': "'",
  nbsp: ' ',
}

// WordPress returns post titles (and other *.rendered fields) with HTML
// entities encoded, e.g. "&#8211;" for an en dash. This decodes the common
// numeric and named entities without needing a DOM (works on the server too).
export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X'
      const code = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[entity] ?? match
  })
}
