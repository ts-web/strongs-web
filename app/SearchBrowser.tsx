'use client';

import { useMemo, useState } from 'react';

type Item = {
  id: string;
  lemma: string;
  xlit: string;
  gloss: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SearchBrowser({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items.slice(0, 200);
    return items.filter((it) =>
      [it.id, it.lemma, it.xlit, it.gloss]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [q, items]);

  return (
    <section>
      <h1>Browse entries</h1>
      <input
        type="search"
        placeholder="Search id, word, gloss…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <p className="item-meta">
        {q ? `${filtered.length} of ${items.length}` : `Showing first ${filtered.length} of ${items.length}`}
      </p>
      <ul className="item-list">
        {filtered.map((it) => (
          <li key={it.id}>
            <a href={`${basePath}/items/${it.id}/`}>
              {it.id} — {it.lemma}
            </a>
            <div className="item-meta">
              <em>{it.xlit}</em> · {it.gloss}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
