const { parentPort } = require('worker_threads');
const { sequelize, Student, Program, Choice, Allocation } = require('../models');

/**
 * Runs the memory-optimized Gale-Shapley Stable Marriage Allocation.
 * Because reading 200K records from MySQL continuously is slow,
 * we load all necessary structural data into Node.js memory.
 */
async function runAllocation() {
  try {
    parentPort.postMessage({ status: 'info', message: 'Starting DB read...' });

    // 1. Load Data
    const programsData = await Program.findAll();
    const programs = {};
    programsData.forEach(p => {
      programs[p.id] = {
        id: p.id,
        category: p.category, // 'Science', 'Engineering', 'Agriculture'
        capacity: p.total_capacity || (p.seats_per_section * p.total_sections),
        admitted: [], // Array of student IDs
      };
    });

    // 2. Load Qualified Students and their Choices
    // Use raw query for speed
    const [studentsData] = await sequelize.query(`
      SELECT 
        s.id, 
        s.eng_rank, 
        s.agri_rank 
      FROM Students s
      WHERE s.preliminary_qualified = 1
    `);

    const students = {};
    const unassignedStudentsQueue = [];

    studentsData.forEach(s => {
      students[s.id] = {
        id: s.id,
        eng_rank: s.eng_rank || 9999999,
        agri_rank: s.agri_rank || 9999999,
        choices: [],
        currentChoiceIndex: 0 // Index of the next program to propose to
      };
      // Every qualified student starts unassigned
      unassignedStudentsQueue.push(s.id);
    });

    const [choicesData] = await sequelize.query(`
      SELECT student_id, program_id, preference_order
      FROM Choices
      ORDER BY student_id, preference_order ASC
    `);

    choicesData.forEach(c => {
      if (students[c.student_id]) {
        students[c.student_id].choices.push(c.program_id);
      }
    });

    parentPort.postMessage({ status: 'info', message: `Memory Load Complete. ${unassignedStudentsQueue.length} students loaded.` });

    // 3. Gale-Shapley Deferred Acceptance Algorithm
    
    // Helper function to rank logic
    const getStudentRankForProgram = (studentId, programId) => {
      const pCategory = programs[programId].category;
      if (pCategory === 'Agriculture') return students[studentId].agri_rank;
      return students[studentId].eng_rank; // For Science and Engineering
    };

    let iterations = 0;

    parentPort.postMessage({ status: 'info', message: 'Starting Gale-Shapley Matching...' });

    while (unassignedStudentsQueue.length > 0) {
      iterations++;
      if (iterations % 50000 === 0) {
        parentPort.postMessage({ status: 'progress', iterations, remaining: unassignedStudentsQueue.length });
      }

      const sId = unassignedStudentsQueue.shift();
      const student = students[sId];

      if (student.currentChoiceIndex >= student.choices.length) {
        // Explored all preferences, remains unassigned
        continue;
      }

      const pId = student.choices[student.currentChoiceIndex];
      student.currentChoiceIndex++; // Next time they propose, it's their next choice

      const program = programs[pId];
      if (!program) continue; // In case choice points to deleted program

      const studentRank = getStudentRankForProgram(sId, pId);

      if (program.admitted.length < program.capacity) {
        // Temporary admit
        program.admitted.push(sId);
      } else {
        // Program is full, we must find the lowest ranked admitted student and see if S is better
        let lowestRankedStudentId = null;
        let lowestRankValue = -1; // Higher numeric rank means LOWER merit

        for (let admittedId of program.admitted) {
          const rank = getStudentRankForProgram(admittedId, pId);
          if (rank > lowestRankValue) {
            lowestRankValue = rank;
            lowestRankedStudentId = admittedId;
          }
        }

        // Compare new applicant with the lowest ranked admitted student
        // Lower numeric value = Better Rank (e.g., Rank 1 > Rank 10)
        if (studentRank < lowestRankValue) {
          // Reject the lowest ranked
          // Remove them from array
          const idx = program.admitted.indexOf(lowestRankedStudentId);
          program.admitted.splice(idx, 1);
          
          // Re-queue the rejected student
          unassignedStudentsQueue.push(lowestRankedStudentId);
          
          // Admit the new student
          program.admitted.push(sId);
        } else {
          // Student is rejected immediately, queue them back to try their next choice
          unassignedStudentsQueue.push(sId);
        }
      }
    }

    parentPort.postMessage({ status: 'info', message: `Algorithm completed in ${iterations} operations.` });

    // 4. Save to Database
    parentPort.postMessage({ status: 'info', message: 'Saving results to MySQL...' });
    
    // Clear old allocations
    await Allocation.destroy({ where: {}, truncate: true });

    // Bulk insert new allocations
    const finalAllocations = [];
    for (let pId in programs) {
      programs[pId].admitted.forEach(sId => {
        finalAllocations.push({
          student_id: sId,
          program_id: parseInt(pId, 10)
        });
      });
    }

    // Chunk size for 200k records can be a few thousands
    const BATCH_SIZE = 5000;
    for (let i = 0; i < finalAllocations.length; i += BATCH_SIZE) {
      const batch = finalAllocations.slice(i, i + BATCH_SIZE);
      await Allocation.bulkCreate(batch);
    }

    parentPort.postMessage({ status: 'done', message: `Allocated ${finalAllocations.length} students across programs.` });

  } catch (err) {
    parentPort.postMessage({ status: 'error', error: err.message });
  }
}

// Automatically start if called as a worker
runAllocation();
