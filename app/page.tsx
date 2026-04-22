import items from '@/data/items.json';
import SearchBrowser from './SearchBrowser';

export default function HomePage() {
  return <SearchBrowser items={items} />;
}
