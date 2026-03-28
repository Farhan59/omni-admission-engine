const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateMockExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students Data');

  // Headers matching our stream parser
  worksheet.columns = [
    { header: 'RegistrationNumber', key: 'regNo' },
    { header: 'Name', key: 'name' },
    { header: 'Path', key: 'path' },
    { header: 'PreliminaryScore', key: 'prelimScore' },
    { header: 'Round2MathScore', key: 'mathScore' },
    { header: 'Round2BioScore', key: 'bioScore' },
    { header: 'Choice1', key: 'choice1' },
    { header: 'Choice2', key: 'choice2' },
    { header: 'Choice3', key: 'choice3' }
  ];

  const paths = ['Focused', 'Diverse'];
  console.log('Generating 1000 records...');

  for (let i = 1; i <= 1000; i++) {
    const isQual = Math.random() > 0.2; // 80% qualify with > 60 score
    const prelim = isQual ? (60 + Math.random() * 40).toFixed(2) : (20 + Math.random() * 39).toFixed(2);
    
    // Random choices between Program IDs 1 to 40
    let c1 = Math.floor(Math.random() * 40) + 1;
    let c2 = Math.floor(Math.random() * 40) + 1;
    let c3 = Math.floor(Math.random() * 40) + 1;

    worksheet.addRow({
      regNo: (10000000 + i).toString(),
      name: `Student ${i}`,
      path: paths[Math.floor(Math.random() * paths.length)],
      prelimScore: parseFloat(prelim),
      mathScore: isQual ? (Math.random() * 100).toFixed(2) : '',
      bioScore: isQual ? (Math.random() * 100).toFixed(2) : '',
      choice1: c1,
      choice2: c2,
      choice3: c3
    });
  }

  const outputPath = path.join(__dirname, '../mock_students.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log('Mock file created at:', outputPath);
}

generateMockExcel();
