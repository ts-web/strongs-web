import fs from 'fs';
import path from 'path';
import sax from 'sax';

type Headword = {
  ID?: string;
  lemma?: string;
  morph?: string;
  POS?: string;
  xlit?: string;
  gloss?: string;
  xmlLang?: string;
  value: string;
};

export type NoteRef = {
  kind: 'ref';
  n: number;
  lemma?: string;
  xlit?: string;
  text: string;
};
export type NoteChunk = string | NoteRef;
type Note = { type: string; chunks: NoteChunk[] };

export type Entry = {
  id: string;
  n: number;
  hebrew: Headword | null;
  greekRefs: string[];
  items: string[];
  notes: Note[];
};

export type IndexRow = {
  id: string;
  lemma: string;
  xlit: string;
  gloss: string;
};

const parser = sax.parser(true, {
  trim: false,
  normalize: false,
  lowercase: true,
  xmlns: false,
  position: true,
});

// SAX state: a stack of currently-open element names, a parallel stack of
// per-element text buffers, plus the entry currently being assembled.
const elStack: string[] = [];
const textStack: string[] = [];
const entries: Entry[] = [];
let entry: Entry | null = null;
let currentNote: Note | null = null;
// While inside a <note>, plain text accrues here until a <w> ref splits it
// into a chunk boundary.
let noteBuffer = '';
// Set to the <w> ref currently open inside the active note (if any).
let pendingRef: NoteRef | null = null;

const here = () => elStack.join('/');

parser.onerror = (e) => {
  console.error('sax error', e);
  parser.resume();
};

parser.onopentag = ({ name, attributes }) => {
  elStack.push(name);
  textStack.push('');

  // Cross-references embedded inside a note (e.g. `<w src="6612" xlit="…"/>`).
  // Flush any text accumulated so far as a string chunk, then start a ref.
  if (currentNote && name === 'w' && attributes.src) {
    if (noteBuffer) {
      currentNote.chunks.push(noteBuffer);
      noteBuffer = '';
    }
    pendingRef = {
      kind: 'ref',
      n: Number(attributes.src),
      lemma: attributes.lemma as string | undefined,
      xlit: attributes.xlit as string | undefined,
      text: '',
    };
    return;
  }

  switch (here()) {
    case 'osis/osisText/div/div': {
      if (attributes.type === 'entry') {
        const n = Number(attributes.n);
        if (!n) throw new Error(`Unexpected entry n: ${attributes.n}`);
        entry = {
          id: `H${n}`,
          n,
          hebrew: null,
          greekRefs: [],
          items: [],
          notes: [],
        };
      }
      break;
    }
    case 'osis/osisText/div/div/w': {
      if (!entry) break;
      entry.hebrew = {
        ID: attributes.ID as string | undefined,
        lemma: attributes.lemma as string | undefined,
        morph: attributes.morph as string | undefined,
        POS: attributes.POS as string | undefined,
        xlit: attributes.xlit as string | undefined,
        gloss: attributes.gloss as string | undefined,
        xmlLang: attributes['xml:lang'] as string | undefined,
        value: '',
      };
      break;
    }
    case 'osis/osisText/div/div/foreign/w': {
      if (entry && attributes.gloss) entry.greekRefs.push(String(attributes.gloss));
      break;
    }
    case 'osis/osisText/div/div/note': {
      currentNote = { type: String(attributes.type ?? ''), chunks: [] };
      noteBuffer = '';
      break;
    }
  }
};

parser.ontext = (t) => {
  if (textStack.length) textStack[textStack.length - 1] += t;
  if (pendingRef) pendingRef.text += t;
  else if (currentNote) noteBuffer += t;
};

parser.onclosetag = () => {
  const text = textStack[textStack.length - 1];

  switch (here()) {
    case 'osis/osisText/div/div/w':
      if (entry?.hebrew) entry.hebrew.value = text;
      break;
    case 'osis/osisText/div/div/list/item':
      if (entry) entry.items.push(text);
      break;
    case 'osis/osisText/div/div/note':
      if (entry && currentNote) {
        if (noteBuffer) currentNote.chunks.push(noteBuffer);
        noteBuffer = '';
        entry.notes.push(currentNote);
        currentNote = null;
      }
      break;
    case 'osis/osisText/div/div/note/w':
      if (currentNote && pendingRef) {
        currentNote.chunks.push(pendingRef);
        pendingRef = null;
      }
      break;
    case 'osis/osisText/div/div':
      if (entry) {
        entries.push(entry);
        entry = null;
      }
      break;
  }

  // Pop, then bubble this element's text up to its parent so mixed content
  // like <note>foo<hi>bar</hi>baz</note> ends up as a single flat string
  // on the <note> buffer. Handlers that want isolated text already grabbed
  // it above before the bubble.
  elStack.pop();
  const childText = textStack.pop()!;
  if (textStack.length) textStack[textStack.length - 1] += childText;
};

parser.onend = () => {
  console.log(`Parsed ${entries.length} entries`);
};

const inputPath = 'vendor/strongs/hebrew/StrongHebrewG.xml';
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}. Set up submodule?`);
  process.exit(1);
}

parser.write(fs.readFileSync(inputPath, 'utf8')).close();

// Two outputs:
//   entries.json — full data, server-only (item pages)
//   index.json   — slim rows that ship to the client for search/listing
const noteText = (n: Note) =>
  n.chunks.map((c) => (typeof c === 'string' ? c : c.text)).join('');

const index: IndexRow[] = entries.map((e) => {
  const explanation = e.notes.find((n) => n.type === 'explanation');
  return {
    id: e.id,
    lemma: e.hebrew?.lemma ?? e.hebrew?.value ?? '',
    xlit: e.hebrew?.xlit ?? '',
    gloss: (explanation && noteText(explanation)) || e.items[0] || '',
  };
});

fs.mkdirSync('data', { recursive: true });
const entriesPath = path.join('data', 'entries.json');
const indexPath = path.join('data', 'index.json');
fs.writeFileSync(entriesPath, JSON.stringify(entries));
fs.writeFileSync(indexPath, JSON.stringify(index));
console.log(`Wrote ${entries.length} entries to ${entriesPath} and ${indexPath}`);
