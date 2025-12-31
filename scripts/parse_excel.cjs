const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'reporte-de-ventas-2025-12-19 09_12_21.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("Columns found:", Object.keys(jsonData[0] || {}));
    console.log("First row:", JSON.stringify(jsonData[0], null, 2));
    console.log("Total rows:", jsonData.length);

    // Save as JSON for easy use in Dashboard
    fs.writeFileSync(path.join(__dirname, 'src/data/membershipData.json'), JSON.stringify(jsonData, null, 2));
    console.log("Saved to src/data/membershipData.json");
} catch (error) {
    console.error("Error reading excel:", error);
}
