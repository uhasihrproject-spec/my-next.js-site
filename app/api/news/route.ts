import { NextResponse } from "next/server";

/**
 * Crypto news proxy.
 *
 * CryptoCompare's free news API now requires an API key, so news is sourced
 * from public RSS feeds and parsed server-side (no CORS, no key needed).
 */

interface Article {
  id: string;
  title: string;
  url: string;
  imageurl: string;
  source: string;
  published_on: number;
}

const FEEDS = [
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph" },
  { url: "https://decrypt.co/feed", source: "Decrypt" },
  { url: "https://bitcoinmagazine.com/feed", source: "Bitcoin Magazine" },
];

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1] : "";
}

function parseFeed(xml: string, source: string): Article[] {
  const items = xml.split(/<item[\s>]/i).slice(1);
  const out: Article[] = [];
  for (const raw of items) {
    const block = raw.split(/<\/item>/i)[0];
    const title = decode(tag(block, "title"));
    let url = decode(tag(block, "link"));
    if (!url) {
      const g = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      url = g ? decode(g[1]) : "";
    }
    if (!title || !url || !/^https?:\/\//.test(url)) continue;

    const pub = decode(tag(block, "pubDate"));
    const ts = pub ? Math.floor(new Date(pub).getTime() / 1000) : NaN;

    let image = "";
    const media =
      block.match(/<media:content[^>]*url="([^"]+)"/i) ||
      block.match(/<media:thumbnail[^>]*url="([^"]+)"/i) ||
      block.match(/<enclosure[^>]*url="([^"]+)"/i) ||
      block.match(/<img[^>]*src="([^"]+)"/i);
    if (media) image = media[1].replace(/&amp;/g, "&");

    out.push({
      id: url,
      title,
      url,
      imageurl: image,
      source,
      published_on: isNaN(ts) ? Math.floor(Date.now() / 1000) : ts,
    });
  }
  return out;
}

export async function GET() {
  for (const feed of FEEDS) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VaultX/1.0)" },
        signal: ctrl.signal,
        next: { revalidate: 300 },
      });
      clearTimeout(timer);
      if (!r.ok) continue;
      const xml = await r.text();
      const articles = parseFeed(xml, feed.source).slice(0, 15);
      if (articles.length) return NextResponse.json({ articles });
    } catch {
      /* try the next feed */
    }
  }
  return NextResponse.json({ articles: [], error: "News is temporarily unavailable" });
}
