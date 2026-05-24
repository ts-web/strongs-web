import { Fragment } from 'react';
import entries from '@/data/entries.json';
import { notFound } from 'next/navigation';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type NoteRef = { kind: 'ref'; n: number; lemma?: string; xlit?: string; text: string };
type NoteChunk = string | NoteRef;
type Note = { type: string; chunks: NoteChunk[] };
type Entry = {
  id: string;
  n: number;
  hebrew: {
    ID?: string;
    lemma?: string;
    morph?: string;
    POS?: string;
    xlit?: string;
    gloss?: string;
    xmlLang?: string;
    value: string;
  } | null;
  greekRefs: string[];
  items: string[];
  notes: Note[];
};

const typedEntries = entries as Entry[];

export function generateStaticParams() {
  return typedEntries.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = typedEntries.find((e) => e.id === id);
  if (!entry) notFound();

  const h = entry.hebrew;

  return (
    <article className="entry">
      <a href={`${basePath}/`} className="back-link">← Back</a>
      <h1 lang={h?.xmlLang}>{h?.lemma ?? h?.value}</h1>
      <p className="item-meta">
        <strong>{entry.id}</strong>
        {h?.xlit ? <> · <em>{h.xlit}</em></> : null}
        {h?.POS ? <> · {h.POS}</> : null}
        {h?.morph ? <> · {h.morph}</> : null}
      </p>

      {entry.notes.length > 0 && (
        <dl>
          {entry.notes.map((note, i) => (
            <Fragment key={i}>
              <dt>{note.type}</dt>
              <dd>
                {note.chunks.map((chunk, j) =>
                  typeof chunk === 'string' ? (
                    <Fragment key={j}>{chunk}</Fragment>
                  ) : (
                    <a key={j} href={`${basePath}/items/H${chunk.n}/`}>
                      {chunk.xlit || chunk.lemma || `H${chunk.n}`}
                    </a>
                  ),
                )}
              </dd>
            </Fragment>
          ))}
        </dl>
      )}

      {entry.items.length > 0 && (
        <>
          <h2>Senses</h2>
          <ul className="item-list">
            {entry.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </>
      )}

      {entry.greekRefs.length > 0 && (
        <>
          <h2>Greek cross-references</h2>
          <p className="item-meta">{entry.greekRefs.join(', ')}</p>
        </>
      )}
    </article>
  );
}
