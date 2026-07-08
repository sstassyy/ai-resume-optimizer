import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import dns from "dns/promises";
import net from "net";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_EXTRACTED_LENGTH = 50;
const MAX_REDIRECTS = 5;

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127 || a === 0 || a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }
  return true; // unrecognized format, treat as unsafe
}

// Guards against SSRF: a user-supplied URL must not resolve to a loopback/
// private/link-local address before we let the server fetch it.
async function assertPublicUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported protocol");
  }
  if (url.hostname === "localhost") {
    throw new Error("Blocked host");
  }
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("Blocked host");
  }
}

async function fetchWithRedirectGuard(startUrl: string): Promise<string> {
  let currentUrl = new URL(startUrl);

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicUrl(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(currentUrl.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AIResumeOptimizerBot/1.0)" },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) throw new Error("Redirect without location");
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const contentLength = res.headers.get("content-length");
      if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
        throw new Error("Response too large");
      }

      const html = await res.text();
      return html.length > MAX_RESPONSE_BYTES ? html.slice(0, MAX_RESPONSE_BYTES) : html;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Too many redirects");
}

export async function fetchVacancyText(
  url: string
): Promise<{ text: string; success: boolean }> {
  try {
    const html = await fetchWithRedirectGuard(url);
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    const text = (article?.textContent ?? "").trim();

    return { text, success: text.length >= MIN_EXTRACTED_LENGTH };
  } catch {
    return { text: "", success: false };
  }
}
