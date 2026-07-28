/**
 * 核心規則：試算表 → YAML 轉換
 */

/**
 * 將 SheetJS workbook 轉成各分頁的 YAML 結果
 * @returns {{ sheetName: string, yamlStr: string, filename: string }[]}
 */
export function processWorkbook(workbook, filename) {
    const results = [];
    const baseFilename = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const ext = filename.split('.').pop().toLowerCase();

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        // header: 1 代表將每一列輸出為陣列，不把第一列當作物件的 key
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        // 1. 尋找標題列 (第一列有資料的列)
        let headerIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i].some(cell => cell !== null && cell !== '' && cell !== undefined)) {
                headerIndex = i;
                break;
            }
        }

        if (headerIndex === -1) return; // 略過空白的分頁

        const keys = rows[headerIndex];
        const sheetData = [];

        // 2. 將之後的資料列配對到 keys
        for (let i = headerIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || row.every(val => val === null || val === '' || val === undefined)) continue;

            const obj = {};
            let hasData = false;
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                if (key && key.toString().trim() !== '') {
                    const value = row[j];
                    if (value !== null && value !== undefined && value !== '') {
                        obj[key.toString().trim()] = value;
                        hasData = true;
                    }
                }
            }
            if (hasData) {
                sheetData.push(obj);
            }
        }

        // 3. 如果有資料，生成 YAML
        if (sheetData.length > 0) {
            const yamlStr = '---\n' + jsyaml.dump(sheetData, {
                indent: 2,
                lineWidth: -1,
                noRefs: true
            });

            let outFilename = `${baseFilename}_${sheetName}.yml`;
            if (ext === 'csv') {
                outFilename = `${baseFilename}.yml`;
            }

            results.push({
                sheetName: sheetName,
                yamlStr: yamlStr,
                filename: outFilename
            });
        }
    });

    return results;
}
