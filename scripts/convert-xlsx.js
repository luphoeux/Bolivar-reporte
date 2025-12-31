const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('base de datos temporal.xlsx');
console.log('Sheet Names:', workbook.SheetNames);

// Process Sheet 1 (Membership)
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Process Sheet 2 (Abonos)
const sheetName2 = workbook.SheetNames[1];
let abonosData = [];
if (sheetName2) {
    const worksheet2 = workbook.Sheets[sheetName2];
    abonosData = XLSX.utils.sheet_to_json(worksheet2);
    fs.writeFileSync('src/assets/data/abonosData.json', JSON.stringify(abonosData));
    console.log(`Converted Sheet 2 (${sheetName2}) with ${abonosData.length} rows to JSON.`);
} else {
    console.log('No second sheet found.');
}

// Save first 100 rows for testing
const testData = data.slice(0, 100);
fs.writeFileSync('src/assets/data/membershipData-test.json', JSON.stringify(testData, null, 2));

// Save full data
fs.writeFileSync('src/assets/data/membershipData.json', JSON.stringify(data));
console.log(`Converted Sheet 1 (${sheetName}) with ${data.length} rows to JSON.`);
