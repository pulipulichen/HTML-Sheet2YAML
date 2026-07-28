/**
 * 資料存取：本機檔案讀取、遠端 URL 下載
 */

import { toGoogleSheetExportUrl } from './utils.js';

/**
 * 從 File 讀取並解析為 SheetJS workbook
 */
export function readWorkbookFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(workbook);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('fileReadError'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 從 URL（含 Google Sheets）下載並解析為 workbook
 */
export async function fetchWorkbookFromUrl(url) {
    const fetchUrl = toGoogleSheetExportUrl(url);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
        throw new Error('networkError');
    }
    const arrayBuffer = await response.arrayBuffer();
    return XLSX.read(arrayBuffer, { type: 'array' });
}
