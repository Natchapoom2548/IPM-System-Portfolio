import { getAccessToken } from './firebase-auth';

const getProcedureNo = (device: any) => {
  const typeStr = (device.deviceType || "").toLowerCase();
  const nameStr = (device.name || "").toLowerCase();
  if (typeStr.includes("defib") || nameStr.includes("defib")) return "IPM-DEFIB-001 (Period 1 Yr.)";
  if (typeStr.includes("ecg") || typeStr.includes("ekg") || nameStr.includes("ecg")) return "IPM-ECG-001 (Period 1 Yr.)";
  if (typeStr.includes("weight") || nameStr.includes("weight")) return "IPM-WEIGHT-001 (Period 1 Yr.)";
  if (typeStr.includes("spo2") || nameStr.includes("spo2") || nameStr.includes("oximeter")) return "IPM-SPO2-001 (Period 1 Yr.)";
  if (typeStr.includes("centrifuge") || nameStr.includes("centrifuge")) return "IPM-CENT-001 (Period 1 Yr.)";
  if (typeStr.includes("syringe") || nameStr.includes("syringe")) return "IPM-SYR-001 (Period 1 Yr.)";
  if (typeStr.includes("infusion") || nameStr.includes("infusion")) return "IPM-INF-001 (Period 1 Yr.)";
  if (typeStr.includes("ventilator") || nameStr.includes("ventilator")) return "IPM-VENT-001 (Period 1 Yr.)";
  if (typeStr.includes("monitor") || nameStr.includes("monitor")) return "IPM-MON-001 (Period 1 Yr.)";
  if (typeStr.includes("oxygen") || nameStr.includes("oxygen")) return "IPM-OXY-001 (Period 1 Yr.)";
  if (typeStr.includes("thermo") || nameStr.includes("thermo")) return "IPM-THERM-001 (Period 1 Yr.)";
  if (typeStr.includes("sphygmo") || nameStr.includes("sphygmo")) return "IPM-SPHYG-001 (Period 1 Yr.)";
  if (typeStr.includes("fetal") || nameStr.includes("fetal")) return "IPM-FETAL-001 (Period 1 Yr.)";
  if (typeStr.includes("aed") || nameStr.includes("aed")) return "IPM-AED-001 (Period 1 Yr.)";
  if (typeStr.includes("nibp") || nameStr.includes("blood pressure") || nameStr.includes("bp") || typeStr.includes("ความดัน")) return "IPM-NIBPMO-001 (Period 1 Yr.)";
  return "IPM-GEN-001 (Period 1 Yr.)";
};

// Helper to push a device's IPM data to a Google Sheet matching the print IPM Certificate / Report layout
export const saveIpmToGoogleSheet = async (device: any) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ Google ด้วยปุ่ม Sign in with Google ก่อนบันทึกข้อมูลไปยัง Google Sheets');
  }

  const procedureNo = getProcedureNo(device);
  const statusStr = device.ipmCheckResult === "Passed" 
    ? "PASSED" 
    : device.ipmCheckResult === "Failed" 
    ? "SERVICE REQUIRED" 
    : (device.status || "PASSED");

  // 1. Create a new Spreadsheet
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `IPM Report - ${device.equipmentNo || device.id} - ${new Date().toLocaleDateString('th-TH')}`,
      },
      sheets: [
        {
          properties: {
            title: 'IPM Report Form',
            gridProperties: {
              rowCount: 100,
              columnCount: 10,
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${await response.text()}`);
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetUrl = sheetData.spreadsheetUrl;
  const gridSheetId = sheetData.sheets?.[0]?.properties?.sheetId || 0;

  // 2. Format the data rows matching the print IPM form
  const rows: (string | number)[][] = [];

  // Title Header
  rows.push([`Inspection and Preventive Maintenance System Of ${device.deviceType || device.name || "Medical Equipment"}`]);
  rows.push(['ระบบตัวอย่างบริหารเครื่องมือแพทย์ BIOMEDICAL ENGINEERING']);
  rows.push([`Procedure No. ${procedureNo}`, '', '', '', '', '', `STATUS: ${statusStr}`]);
  rows.push(['']);

  // Section 1: Equipment information
  const eqHeaderRowIndex = rows.length;
  rows.push(['Equipment Information', '', '', '', '', '', '', '', '', '']);
  rows.push(['Department:', device.department || '-', 'ID Code:', device.id || '-', '', 'IPM Round:', device.ipmRound || '-']);
  rows.push(['Equipment No.:', device.equipmentNo || '-', 'IPM Date:', device.ipmDate || '-', '', 'IPM Due Date:', device.ipmDueDate || '-']);
  rows.push(['Manufacturer:', device.manufacturer || '-', 'Model:', device.model || '-', '', 'Serial No. (SN):', device.serialNumber || '-']);
  rows.push(['Location:', device.location || '-', 'IPM Report No:', device.ipmReport || '-', '', 'Result:', device.ipmCheckResult || '-']);
  rows.push(['']);

  // Section 2: IPM Information
  const ipmHeaderRowIndex = rows.length;
  rows.push(['IPM Information', '', '', '', '', '', '', '', '', '']);
  rows.push(['IPM Type:', (device.ipmTypes || []).join(', ') || '-']);
  rows.push(['IPM Environment:', `Ambient Temp: ${device.temperature || '-'} °C`, '', `Humidity: ${device.humidity || '-'} %`]);
  rows.push(['']);

  // Section 3: Test Apparatus
  const apparatusHeaderRowIndex = rows.length;
  rows.push(['Test Apparatus', '', '', '', '', '', '', '', '', '']);
  rows.push(['Equipment', 'Brand / Model', 'Serial No.', 'Certificate No', 'Cal. Due Date']);
  const apparatusList = device.testApparatus || [];
  if (apparatusList.length > 0) {
    apparatusList.forEach((app: any) => {
      rows.push([app.equipment || '', app.brandModel || '', app.serialNo || '', app.certificateNo || '', app.calDueDate || '']);
    });
  } else {
    rows.push(['- ไม่ระบุเครื่องมือทดสอบ -', '-', '-', '-', '-']);
  }
  rows.push(['']);

  // Section 4: QUALITATIVE TASKS
  const qualHeaderRowIndex = rows.length;
  rows.push(['QUALITATIVE TASKS', '', '', '', '', '', '', '', '', '']);
  rows.push(['PASS', 'FAIL', 'N/A', 'Check Task', 'Comment', 'PASS', 'FAIL', 'N/A', 'Check Task', 'Comment']);

  const qualTasks = device.qualitativeTasks || [];
  if (qualTasks.length > 0) {
    const numPairs = Math.ceil(qualTasks.length / 2);
    for (let i = 0; i < numPairs; i++) {
      const l = qualTasks[i * 2];
      const r = qualTasks[i * 2 + 1];

      rows.push([
        l ? (l.result === 'PASS' ? '✓' : '') : '',
        l ? (l.result === 'FAIL' ? '✓' : '') : '',
        l ? (l.result === 'N/A' ? '✓' : '') : '',
        l ? (l.taskName || '') : '',
        l ? (l.comment || '') : '',
        r ? (r.result === 'PASS' ? '✓' : '') : '',
        r ? (r.result === 'FAIL' ? '✓' : '') : '',
        r ? (r.result === 'N/A' ? '✓' : '') : '',
        r ? (r.taskName || '') : '',
        r ? (r.comment || '') : ''
      ]);
    }
  } else {
    rows.push(['-', '-', '-', 'ไม่มีรายการ Qualitative Task', '-', '-', '-', '-', '-', '-']);
  }
  rows.push(['']);

  // Section 5: QUANTITATIVE TASKS
  const quantHeaderRowIndex = rows.length;
  rows.push(['QUANTITATIVE TASKS', '', '', '', '', '', '', '', '', '']);
  rows.push(['Group / Category', 'Control Setting', 'Criteria', 'Set / Indicated', 'Measured', 'PASS', 'FAIL', 'N/A']);

  const quantTasks = device.quantitativeTasks || [];
  if (quantTasks.length > 0) {
    quantTasks.forEach((t: any) => {
      rows.push([
        t.groupLabel || '',
        t.controlSetting || '',
        t.criteria || '',
        t.setting || '',
        t.measured || '',
        t.result === 'PASS' ? '✓' : '',
        t.result === 'FAIL' ? '✓' : '',
        t.result === 'N/A' ? '✓' : ''
      ]);
    });
  } else {
    rows.push(['-', 'ไม่มีรายการ Quantitative Task', '-', '-', '-', '-', '-', '-']);
  }
  rows.push(['']);

  // Section 6: PREVENTIVE MAINTENANCE
  const pmHeaderRowIndex = rows.length;
  rows.push(['PREVENTIVE MAINTENANCE', '', '', '', '', '', '', '', '', '']);
  rows.push(['Status', 'PM Task', 'Comment']);

  const pmTasks = device.pmTasks || [];
  if (pmTasks.length > 0) {
    pmTasks.forEach((p: any) => {
      rows.push([
        p.done ? '[✓] Done' : '[ ] Pending',
        p.taskName || '',
        p.comment || ''
      ]);
    });
  } else {
    rows.push(['-', 'ไม่มีรายการ PM Task', '-']);
  }
  rows.push(['']);

  // Section 7: NOTE
  const noteHeaderRowIndex = rows.length;
  rows.push(['NOTE / REMARKS', '', '', '', '', '', '', '', '', '']);
  rows.push([device.ipmNotes || 'ไม่มีบันทึกเพิ่มเติม']);
  rows.push(['']);

  // Section 8: SIGNATURES
  const sigHeaderRowIndex = rows.length;
  rows.push(['SIGNATURES & APPROVAL', '', '', '', '', '', '', '', '', '']);
  rows.push(['Inspector (Biomedical Engineer):', device.biomedSignatureName || device.ipmTester || '-', '', '', 'Approver / Head:', device.headBiomedSignatureName || 'Sample Approver']);

  // 3. Update values into the sheet
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: rows
    })
  });

  if (!updateRes.ok) {
    throw new Error(`Failed to update sheet values: ${await updateRes.text()}`);
  }

  // 4. Apply styling via batchUpdate (Blue headers, bold text, column widths)
  const sectionHeaderIndices = [
    eqHeaderRowIndex,
    ipmHeaderRowIndex,
    apparatusHeaderRowIndex,
    qualHeaderRowIndex,
    quantHeaderRowIndex,
    pmHeaderRowIndex,
    noteHeaderRowIndex,
    sigHeaderRowIndex
  ];

  const subHeaderIndices = [
    apparatusHeaderRowIndex + 1,
    qualHeaderRowIndex + 1,
    quantHeaderRowIndex + 1,
    pmHeaderRowIndex + 1
  ];

  const requests: any[] = [
    // Column Widths
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 160 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
        properties: { pixelSize: 160 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
        properties: { pixelSize: 130 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },
        properties: { pixelSize: 210 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 },
        properties: { pixelSize: 160 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 8, endIndex: 9 },
        properties: { pixelSize: 210 },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: { sheetId: gridSheetId, dimension: 'COLUMNS', startIndex: 9, endIndex: 10 },
        properties: { pixelSize: 160 },
        fields: 'pixelSize'
      }
    },
    // Main Document Header styling (Rows 0, 1, 2)
    {
      repeatCell: {
        range: { sheetId: gridSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 13, foregroundColor: { red: 0.1, green: 0.1, blue: 0.2 } }
          }
        },
        fields: 'userEnteredFormat(textFormat)'
      }
    },
    {
      repeatCell: {
        range: { sheetId: gridSheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 0.3, green: 0.3, blue: 0.4 } }
          }
        },
        fields: 'userEnteredFormat(textFormat)'
      }
    },
    {
      repeatCell: {
        range: { sheetId: gridSheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 0.1, green: 0.2, blue: 0.6 } }
          }
        },
        fields: 'userEnteredFormat(textFormat)'
      }
    }
  ];

  // Add section headers formatting (Blue banner with white text)
  sectionHeaderIndices.forEach((rowIndex) => {
    requests.push({
      repeatCell: {
        range: { sheetId: gridSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.0, green: 0.2, blue: 0.85 }, // Blue header
            textFormat: { foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, bold: true, fontSize: 10 }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)'
      }
    });
  });

  // Add table sub-headers formatting (Light gray banner with bold text)
  subHeaderIndices.forEach((rowIndex) => {
    requests.push({
      repeatCell: {
        range: { sheetId: gridSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 10 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.9, green: 0.92, blue: 0.95 },
            textFormat: { foregroundColor: { red: 0.1, green: 0.1, blue: 0.2 }, bold: true, fontSize: 9 }
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)'
      }
    });
  });

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests })
    });
  } catch (err) {
    console.warn('Batch styling warning:', err);
  }

  return sheetUrl;
};
