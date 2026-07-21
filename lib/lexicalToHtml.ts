interface LexicalNode {
  type?: string
  tag?: string
  listType?: string
  format?: number | string
  fields?: { url?: string }
  text?: string
  children?: unknown
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderChildren(children: unknown): string {
  if (!Array.isArray(children)) return ''
  return children.map(renderNode).join('')
}

function renderNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as LexicalNode

  switch (n.type) {
    case 'paragraph':
      return `<p>${renderChildren(n.children)}</p>`

    case 'heading': {
      const tag = typeof n.tag === 'string' && /^h[1-6]$/.test(n.tag) ? n.tag : 'h2'
      return `<${tag}>${renderChildren(n.children)}</${tag}>`
    }

    case 'list': {
      const listTag = n.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${renderChildren(n.children)}</${listTag}>`
    }

    case 'listitem':
      return `<li>${renderChildren(n.children)}</li>`

    case 'quote':
      return `<blockquote>${renderChildren(n.children)}</blockquote>`

    case 'link': {
      const rawUrl = typeof n.fields?.url === 'string' ? n.fields.url : ''
      const safeUrl = /^(https?:|mailto:|tel:|[/#])/i.test(rawUrl) ? rawUrl : '#'
      const href = escapeHtml(safeUrl)
      return `<a href="${href}">${renderChildren(n.children)}</a>`
    }

    case 'linebreak':
      return '<br />'

    case 'text': {
      let html = escapeHtml(typeof n.text === 'string' ? n.text : '')
      const format = typeof n.format === 'number' ? n.format : 0
      if (format & 1) html = `<strong>${html}</strong>`
      if (format & 2) html = `<em>${html}</em>`
      if (format & 4) html = `<u>${html}</u>`
      return html
    }

    default:
      return renderChildren(n.children)
  }
}

export function lexicalToHtml(content: unknown): string {
  try {
    if (!content || typeof content !== 'object') return ''
    const withRoot = content as { root?: unknown }
    const root = withRoot.root && typeof withRoot.root === 'object' ? withRoot.root : content
    const children = (root as { children?: unknown }).children
    return renderChildren(children)
  } catch {
    return ''
  }
}

// One HTML string per top-level node, instead of one joined blob — for content
// that was entered as a flat stack of paragraphs (no real list/listitem nodes)
// but should still render as individual, separately-styled rows.
export function lexicalToLines(content: unknown): string[] {
  try {
    if (!content || typeof content !== 'object') return []
    const withRoot = content as { root?: unknown }
    const root = withRoot.root && typeof withRoot.root === 'object' ? withRoot.root : content
    const children = (root as { children?: unknown }).children
    if (!Array.isArray(children)) return []
    return children
      .map((node) => {
        const n = node as LexicalNode
        return n.type === 'paragraph' ? renderChildren(n.children) : renderNode(node)
      })
      .map((html) => html.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}
