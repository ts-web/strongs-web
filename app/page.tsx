import index from '@/data/index.json';
import SearchBrowser from './SearchBrowser';

export default function HomePage() {
  return <SearchBrowser items={index} />;
}
