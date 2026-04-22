'use client';

import { useMemo, useState } from 'react';

type Item = {
  id: string;
  title: string;
  transliteration: string;
  gloss: string;
  description: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function SearchBrowser({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) =>
      [it.id, it.title, it.transliteration, it.gloss, it.description]
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
      <p className="item-meta">{filtered.length} of {items.length} entries</p>
      <ul className="item-list">
        {filtered.map((it) => (
          <li key={it.id}>
            <a href={`${basePath}/items/${it.id}/`}>
              {it.id} — {it.title}
            </a>
            <div className="item-meta">
              <em>{it.transliteration}</em> · {it.gloss}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
