import items from '@/data/items.json';
import { notFound } from 'next/navigation';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function generateStaticParams() {
  return items.map((it) => ({ id: it.id }));
}

export const dynamicParams = false;

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = items.find((it) => it.id === id);
  if (!item) notFound();

  return (
    <article className="entry">
      <a href={`${basePath}/`} className="back-link">← Back</a>
      <h1>{item.title}</h1>
      <p className="item-meta">
        <strong>{item.id}</strong> · <em>{item.transliteration}</em>
      </p>
      <dl>
        <dt>Gloss</dt>
        <dd>{item.gloss}</dd>
        <dt>Description</dt>
        <dd>{item.description}</dd>
      </dl>
    </article>
  );
}
