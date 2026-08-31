/**
 * Video Link Extractor & Stream Resolver
 * 
 * Automatically resolves and extracts direct video streams (.mp4, .m3u8) 
 * from pasted web page URLs, meta tags (og:video, twitter:player), 
 * and HTML5 video sources.
 */

export interface ExtractedVideoInfo {
  success: boolean;
  streamUrl: string;
  title?: string;
  isExtracted: boolean;
  error?: string;
}

export async function resolveVideoFromUrl(inputUrl: string): Promise<ExtractedVideoInfo> {
  const url = inputUrl.trim();
  if (!url) {
    return { success: false, streamUrl: '', isExtracted: false, error: 'Geçersiz URL' };
  }

  // 1. Direct Video File Check (.mp4, .m3u8, .webm, .mov)
  const isDirectVideo = /\.(mp4|m3u8|webm|mov|mkv)(\?.*)?$/i.test(url) || url.startsWith('embedded:');
  if (isDirectVideo) {
    return {
      success: true,
      streamUrl: url,
      title: url.split('/').pop()?.split('?')[0] || 'Doğrudan Video Akışı',
      isExtracted: false,
    };
  }

  // 2. Fetch HTML Page to Extract Embedded Video Streams
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      // Return original URL if page fetch fails
      return { success: true, streamUrl: url, isExtracted: false };
    }

    const html = await response.text();

    // Extract Page Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : 'Web Videosu';

    // A. OpenGraph / Twitter Card Video Tags
    const ogVideoMatch = 
      html.match(/<meta[^>]+property=["']og:video(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url|:url)?["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:player:stream["'][^>]+content=["']([^"']+)["']/i);

    if (ogVideoMatch && ogVideoMatch[1]) {
      const foundUrl = makeAbsoluteUrl(ogVideoMatch[1], url);
      return {
        success: true,
        streamUrl: foundUrl,
        title: pageTitle,
        isExtracted: true,
      };
    }

    // B. HTML5 <source src="..."> or <video src="...">
    const sourceMatch = 
      html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8|webm)[^"']*)["']/i) ||
      html.match(/<video[^>]+src=["']([^"']+\.(?:mp4|m3u8|webm)[^"']*)["']/i);

    if (sourceMatch && sourceMatch[1]) {
      const foundUrl = makeAbsoluteUrl(sourceMatch[1], url);
      return {
        success: true,
        streamUrl: foundUrl,
        title: pageTitle,
        isExtracted: true,
      };
    }

    // C. General Regex Pattern Search for direct .mp4/.m3u8 inside scripts or JSON
    const directRegex = /https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)(?:\?[^\s"'<>]*)?/i;
    const directMatch = html.match(directRegex);

    if (directMatch && directMatch[0]) {
      return {
        success: true,
        streamUrl: directMatch[0],
        title: pageTitle,
        isExtracted: true,
      };
    }

    // If no direct stream was extracted, return original URL
    return {
      success: true,
      streamUrl: url,
      title: pageTitle,
      isExtracted: false,
    };
  } catch (err: any) {
    console.warn('[VideoExtractor] Page parse error, using original URL:', err.message);
    return {
      success: true,
      streamUrl: url,
      isExtracted: false,
    };
  }
}

function makeAbsoluteUrl(relativeOrAbsolute: string, base: string): string {
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  if (relativeOrAbsolute.startsWith('//')) {
    return `https:${relativeOrAbsolute}`;
  }
  try {
    const urlObj = new URL(relativeOrAbsolute, base);
    return urlObj.toString();
  } catch {
    return relativeOrAbsolute;
  }
}
