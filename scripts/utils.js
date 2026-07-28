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
