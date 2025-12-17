import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => any);
}

export const exportToPDF = (
  data: any[],
  columns: ExportColumn[],
  title: string,
  filename: string
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  // Prepare table data
  const headers = columns.map(col => col.header);
  const rows = data.map(row => 
    columns.map(col => {
      if (typeof col.accessor === 'function') {
        return col.accessor(row);
      }
      return row[col.accessor] ?? '';
    })
  );
  
  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (
  data: any[],
  columns: ExportColumn[],
  filename: string
) => {
  // Prepare data with headers
  const headers = columns.map(col => col.header);
  const rows = data.map(row => 
    columns.map(col => {
      if (typeof col.accessor === 'function') {
        return col.accessor(row);
      }
      return row[col.accessor] ?? '';
    })
  );
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
