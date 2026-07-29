/**
 * 共用工具函式
 */

export function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * 從 Content-Disposition 標頭解析檔名（優先 filename* / RFC 5987）
 * @param {string|null} header
 * @returns {string|null}
 */
export function parseFilenameFromContentDisposition(header) {
    if (!header) return null;

    // filename*=UTF-8''encoded%20name.xlsx
    const starMatch = header.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;\s]+)/i);
    if (starMatch && starMatch[1]) {
        try {
            return decodeURIComponent(starMatch[1]);
        } catch {
            // fall through to plain filename
        }
    }

    // filename="name.xlsx" or filename=name.xlsx
    const plainMatch = header.match(/filename\s*=\s*(?:"((?:\\.|[^"])*)"|([^;\s]+))/i);
    if (plainMatch) {
        const raw = plainMatch[1] !== undefined ? plainMatch[1] : plainMatch[2];
        return raw.replace(/\\"/g, '"');
    }

    return null;
}

/**
 * 將 Google Sheets 一般連結轉換為可匯出的 xlsx URL
 */
export function toGoogleSheetExportUrl(url) {
    if (url.includes('docs.google.com/spreadsheets') && !url.includes('/pub')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
        }
    }
    return url;
}
