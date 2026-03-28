const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { sequelize, Student, Choice } = require('../models');

/**
 * Parses a large Excel file containing OMR/student data and inserts it into MySQL via stream.
 * 
 * Format expected:
 * RegistrationNumber, Name, Path, PreliminaryScore, Round2MathScore, Round2BioScore, Choice1, Choice2, Choice3...
 */
async function parseAndInsertExcel(filePath) {
  console.log('Starting Excel Parsing:', filePath);
  
  const options = {
    sharedStrings: 'cache',
    hyperlinks: 'ignore',
    worksheets: 'emit'
  };
  
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, options);
  
  let batchStudents = [];
  let batchChoices = [];
  let rowCount = 0;
  const BATCH_SIZE = 1000;

  try {
    for await (const worksheetReader of workbookReader) {
      for await (const row of worksheetReader) {
        // Skip header row
        if (rowCount === 0) {
          rowCount++;
          continue;
        }

        const values = row.values.slice(1); // ExcelJS values are 1-indexed
        
        // Simulating columns:
        // [0] RegistrationNumber, [1] Name, [2] Path (Focused/Diverse), 
        // [3] PrelimScore, [4] Round2Math, [5] Round2Bio, 
        // [6] Choice1 Program ID, [7] Choice2 Program ID, [8] Choice 3...
        
        const regNo = values[0];
        const name = values[1];
        const studentPath = values[2] || 'Focused';
        const prelimScore = parseFloat(values[3]) || 0;
        const prelimQualified = prelimScore >= 60; // Rule: Only >= 60% qualify for Round 2
        
        let r2Math = parseFloat(values[4]) || null;
        let r2Bio = parseFloat(values[5]) || null;
        
        // Formula mockup for Ranks (Customizable)
        // Engineering Rank heavily favors Math. Agri Rank heavily favors Bio.
        let engRank = null;
        let agriRank = null;
        
        if (prelimQualified) {
            engRank = r2Math !== null ? Math.floor(prelimScore * 0.4 + r2Math * 0.6) : null;
            agriRank = r2Bio !== null ? Math.floor(prelimScore * 0.4 + r2Bio * 0.6) : null;
        }

        batchStudents.push({
          registration_number: String(regNo),
          name: name,
          path: studentPath,
          preliminary_score: prelimScore,
          preliminary_qualified: prelimQualified,
          round2_math_score: r2Math,
          round2_bio_score: r2Bio,
          eng_rank: engRank,
          agri_rank: agriRank
        });

        // Assuming up to 3 choices in columns 6, 7, 8
        for (let i = 0; i < 3; i++) {
            const progId = values[6 + i];
            if (progId) {
                batchChoices.push({
                    student_reg: String(regNo), // Temp correlation
                    program_id: progId,
                    preference_order: i + 1
                });
            }
        }

        rowCount++;

        if (batchStudents.length >= BATCH_SIZE) {
          await insertBatch(batchStudents, batchChoices);
          batchStudents = [];
          batchChoices = [];
        }
      }
    }
    
    // Insert any remaining
    if (batchStudents.length > 0) {
      await insertBatch(batchStudents, batchChoices);
    }
    
    console.log(`Parsing complete. Total rows processed: ${rowCount - 1}`);
    return { success: true, rows: rowCount - 1 };
  } catch (error) {
    console.error('Error streaming excel:', error);
    throw error;
  }
}

async function insertBatch(studentsBatch, choicesBatch) {
  const transaction = await sequelize.transaction();
  try {
    // 1. Bulk insert students (ignore duplicates based on registration_number)
    const insertedStudents = await Student.bulkCreate(studentsBatch, { 
      transaction,
      updateOnDuplicate: ["round2_math_score", "round2_bio_score", "eng_rank", "agri_rank", "preliminary_qualified"]
    });

    // We need the database IDs to insert choices.
    // Fetch newly mapped IDs by Registration Number
    const regNos = studentsBatch.map(s => s.registration_number);
    const dbStudents = await Student.findAll({
      where: { registration_number: regNos },
      attributes: ['id', 'registration_number'],
      transaction
    });
    
    const regToIdMap = {};
    dbStudents.forEach(st => regToIdMap[st.registration_number] = st.id);

    // 2. Map Choices and Bulk insert
    const finalChoices = choicesBatch.map(c => ({
      student_id: regToIdMap[c.student_reg],
      program_id: c.program_id,
      preference_order: c.preference_order
    })).filter(c => c.student_id); // Filter out any mapping failures

    await Choice.bulkCreate(finalChoices, { transaction });
    await transaction.commit();
    
    console.log(`Inserted batch of ${studentsBatch.length} students.`);
  } catch (err) {
    await transaction.rollback();
    console.error("Batch insert failed", err);
  }
}

module.exports = { parseAndInsertExcel };
