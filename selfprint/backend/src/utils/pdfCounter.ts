import fs from 'fs';

export function countPdfPagesFromBuffer(buffer: Buffer): number {
  try {
    const text = buffer.toString('binary');
    
    // 1. Look for /Type /Pages /Count N
    const pagesMatches = text.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/g);
    if (pagesMatches && pagesMatches.length > 0) {
      let maxCount = 0;
      for (const match of pagesMatches) {
        const countMatch = match.match(/\/Count\s+(\d+)/);
        if (countMatch && countMatch[1]) {
          const c = parseInt(countMatch[1], 10);
          if (c > maxCount) maxCount = c;
        }
      }
      if (maxCount > 0) return maxCount;
    }

    // 2. Fallback: Count /Type /Page (excluding /Type /Pages)
    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    if (pageMatches && pageMatches.length > 0) {
      return pageMatches.length;
    }

    // 3. Fallback: Search for /Page\b pattern
    const rawMatches = text.match(/\/Page\b/g);
    if (rawMatches && rawMatches.length > 0) {
      return Math.max(1, Math.min(rawMatches.length, 500));
    }
  } catch (err) {
    console.error('Error counting PDF pages:', err);
  }

  return 1;
}

export function countPdfPagesFromFile(filePath: string): number {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return countPdfPagesFromBuffer(buffer);
    }
  } catch (err) {
    console.error('Error reading PDF file:', err);
  }
  return 1;
}
