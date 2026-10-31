interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const html = parseMarkdown(content);

  return (
    <div
      className={`prose prose-invert prose-sm max-w-none
        prose-headings:text-slate-100 prose-headings:font-semibold
        prose-p:text-slate-300 prose-p:leading-relaxed
        prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-sky-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
        prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
        prose-blockquote:border-l-slate-600 prose-blockquote:text-slate-400
        prose-strong:text-slate-200
        prose-ul:text-slate-300 prose-ol:text-slate-300
        prose-li:text-slate-300
        prose-hr:border-slate-700
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function parseMarkdown(md: string): string {
  let html = escapeHtml(md);

  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_m, code) =>
    `<pre class="overflow-x-auto p-4 text-xs font-mono"><code>${code.trimEnd()}</code></pre>`
  );

  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="max-w-full rounded" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/^---+$/gm, '<hr />');

  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed === '' ||
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('</')
    ) {
      result.push(line);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }

  return result.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
