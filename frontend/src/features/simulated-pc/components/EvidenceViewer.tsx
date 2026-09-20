import { FileImage, FileText, Hexagon, Activity, FileSearch } from 'lucide-react';
import type { EvidenceItem } from '../types';
import { cn } from '@/lib/utils';

interface CiteMode {
  /** Authored substring the cited line must contain; undefined = the
      exhibit itself is the citation. */
  match?: string;
  onCite: (line: string) => void;
}

interface EvidenceViewerProps {
  item?: EvidenceItem;
  cite?: CiteMode | null;
}

const kindIcons: Record<EvidenceItem['kind'], typeof FileText> = {
  text: FileText,
  hex: Hexagon,
  packets: Activity,
  image: FileImage,
};

function renderImage(content: string, title: string) {
  const src = content.startsWith('data:') || content.startsWith('http')
    ? content
    : `data:image/png;base64,${content}`;
  return (
    <div className="flex flex-col items-center">
      <img
        src={src}
        alt={title}
        className="max-h-96 max-w-full border border-hairline object-contain"
      />
    </div>
  );
}

/* In cite mode each line is a tappable citation candidate — mobile-safe,
   block-level, no drag. */
function CitableLines({ content, cite, tone }: { content: string; cite: CiteMode; tone: string }) {
  return (
    <pre className={cn('overflow-auto border border-hairline bg-stock-drift p-2 font-mono text-xs', tone)}>
      {content.split('\n').map((line, i) => (
        <button
          key={i}
          onClick={() => cite.onCite(line)}
          className={cn(
            'block min-h-[32px] w-full whitespace-pre-wrap px-2 py-1 text-left transition-colors',
            cite.match && !line.includes(cite.match)
              ? 'hover:bg-stock-green/60'
              : 'hover:bg-seal/60'
          )}
        >
          {line || ' '}
        </button>
      ))}
    </pre>
  );
}

function renderBlock(content: string, tone: string, cite?: CiteMode | null) {
  if (cite) return <CitableLines content={content} cite={cite} tone={tone} />;
  return (
    <pre className={cn('overflow-auto whitespace-pre-wrap border border-hairline bg-stock-drift p-4 font-mono text-xs', tone)}>
      {content}
    </pre>
  );
}

export function EvidenceViewer({ item, cite }: EvidenceViewerProps) {
  if (!item) {
    return (
      <div className="plate flex h-full items-center justify-center p-6">
        <span className="register">Select an exhibit to view</span>
      </div>
    );
  }

  const Icon = kindIcons[item.kind] ?? FileText;

  return (
    <div className="plate flex h-full flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
        <Icon className="h-5 w-5 text-seal-ink" />
        <h4 className="font-semibold text-ink">{item.title}</h4>
        <span className="plate-id ml-auto">{item.kind}</span>
      </div>
      {cite && (
        <p className="mb-3 flex items-center gap-2 border border-dashed border-seal-ink bg-seal/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-seal-ink">
          <FileSearch className="h-4 w-4" />
          Cite mode — tap the proving line
        </p>
      )}
      {item.description && (
        <p className="mb-3 text-sm text-ink-soft">{item.description}</p>
      )}
      <div className="flex-1 overflow-auto">
        {item.kind === 'image' && renderImage(item.content, item.title)}
        {item.kind === 'image' && cite && (
          <button
            onClick={() => cite.onCite(item.title)}
            className="mt-3 min-h-[44px] w-full border border-ink bg-ink px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-stock hover:bg-seal hover:text-seal-ink"
          >
            Cite this exhibit
          </button>
        )}
        {item.kind === 'hex' && renderBlock(item.content, 'text-confirm', cite)}
        {item.kind === 'packets' && renderBlock(item.content, 'text-seal-ink', cite)}
        {item.kind === 'text' && renderBlock(item.content, 'text-ink-soft', cite)}
      </div>
    </div>
  );
}
