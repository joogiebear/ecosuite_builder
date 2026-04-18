import { memo } from 'react';

const LEGACY_COLORS = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
};

const FORMAT_KEYS = {
  l: 'bold',
  m: 'strikethrough',
  n: 'underline',
  o: 'italic',
  k: 'obfuscated',
};

function hexToRgb(hex) {
  const clean = String(hex || '').replace(/^#/, '');
  if (clean.length !== 3 && clean.length !== 6) return null;
  const normalized = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function gradient(text, from, to) {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  if (!fromRgb || !toRgb) return [{ text, style: {} }];
  const chars = Array.from(text);
  return chars.map((char, index) => {
    const t = chars.length === 1 ? 0 : index / (chars.length - 1);
    const color = rgbToHex({
      r: lerp(fromRgb.r, toRgb.r, t),
      g: lerp(fromRgb.g, toRgb.g, t),
      b: lerp(fromRgb.b, toRgb.b, t),
    });
    return { text: char, style: { color } };
  });
}

const GRADIENT_RE = /<(?:gradient|g):#?([0-9a-fA-F]{3,6})>([\s\S]*?)<\/(?:gradient|g):#?([0-9a-fA-F]{3,6})>/g;
const HEX_RE = /&#([0-9a-fA-F]{6})/g;

function parseLegacyAndFormatting(text) {
  const out = [];
  let style = {};
  let buffer = '';

  const flush = () => {
    if (buffer) {
      out.push({ text: buffer, style: { ...style } });
      buffer = '';
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if ((ch === '&' || ch === '§') && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      if (LEGACY_COLORS[code]) {
        flush();
        style = { color: LEGACY_COLORS[code] };
        i += 1;
        continue;
      }
      if (FORMAT_KEYS[code]) {
        flush();
        const key = FORMAT_KEYS[code];
        style = { ...style, [key]: true };
        i += 1;
        continue;
      }
      if (code === 'r') {
        flush();
        style = {};
        i += 1;
        continue;
      }
    }
    buffer += ch;
  }
  flush();
  return out;
}

function renderSegments(segments) {
  return segments.map((seg, idx) => {
    const styles = {};
    if (seg.style.color) styles.color = seg.style.color;
    if (seg.style.bold) styles.fontWeight = 700;
    if (seg.style.italic) styles.fontStyle = 'italic';
    if (seg.style.underline || seg.style.strikethrough) {
      styles.textDecoration = [
        seg.style.underline ? 'underline' : null,
        seg.style.strikethrough ? 'line-through' : null,
      ].filter(Boolean).join(' ');
    }
    if (seg.style.obfuscated) styles.filter = 'blur(1px)';
    return (
      <span key={idx} style={styles}>{seg.text}</span>
    );
  });
}

function expandGradients(raw) {
  const tokens = [];
  let lastIndex = 0;
  let match;
  GRADIENT_RE.lastIndex = 0;
  while ((match = GRADIENT_RE.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', text: raw.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'gradient', from: match[1], to: match[3], inner: match[2] });
    lastIndex = GRADIENT_RE.lastIndex;
  }
  if (lastIndex < raw.length) tokens.push({ type: 'plain', text: raw.slice(lastIndex) });
  return tokens;
}

function expandHexCodes(text) {
  return text.replace(HEX_RE, (_, hex) => `§HEX${hex.toLowerCase()}§`);
}

function MinecraftText({ value, className = '' }) {
  const raw = String(value ?? '');
  if (!raw) {
    return <span className={`mc-text empty ${className}`}>—</span>;
  }

  const withHexMarkers = expandHexCodes(raw);
  const tokens = expandGradients(withHexMarkers);

  const flatSegments = [];
  for (const token of tokens) {
    if (token.type === 'plain') {
      const parts = token.text.split(/§HEX([0-9a-f]{6})§/g);
      for (let i = 0; i < parts.length; i += 1) {
        if (i % 2 === 1) {
          const color = `#${parts[i]}`;
          const nextChunk = parts[i + 1] || '';
          const legacySegs = parseLegacyAndFormatting(nextChunk);
          for (const seg of legacySegs) {
            flatSegments.push({ text: seg.text, style: { ...seg.style, color: seg.style.color || color } });
          }
          i += 1;
        } else {
          const legacySegs = parseLegacyAndFormatting(parts[i]);
          flatSegments.push(...legacySegs);
        }
      }
    } else {
      const innerSegs = gradient(token.inner, token.from, token.to);
      flatSegments.push(...innerSegs);
    }
  }

  return (
    <span className={`mc-text ${className}`}>
      {renderSegments(flatSegments)}
    </span>
  );
}

export default memo(MinecraftText);
