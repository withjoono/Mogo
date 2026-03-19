import * as XLSX from 'xlsx';
import * as path from 'path';

const EXCEL_PATH = path.join(__dirname, '../../Uploads/모의고사 디비 폼.xlsx');

console.log('📂 Reading file:', EXCEL_PATH);
const workbook = XLSX.readFile(EXCEL_PATH);

console.log('\n📑 Sheet names:', workbook.SheetNames.join(', '));

workbook.SheetNames.forEach((sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log(`\n=== ${sheetName} ===`);
  console.log(`Rows: ${data.length}`);

  if (data.length > 0) {
    console.log('Headers:', data[0]);
    if (data.length > 1) {
      console.log('First row:', data[1]);
    }
  }
});










