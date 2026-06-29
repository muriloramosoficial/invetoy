import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "xml";

interface Column {
  header: string;
  key: string;
}

/**
 * Export data array to the specified format and trigger download.
 */
export function exportData(
  data: Record<string, unknown>[],
  columns: Column[],
  fileName: string,
  format: ExportFormat,
  title?: string
) {
  switch (format) {
    case "csv":
      exportToCSV(data, columns, fileName);
      break;
    case "xlsx":
      exportToXLSX(data, columns, fileName);
      break;
    case "pdf":
      exportToPDF(data, columns, fileName, title);
      break;
    case "xml":
      exportToXML(data, columns, fileName);
      break;
  }
}

// ─── CSV ───

function exportToCSV(
  data: Record<string, unknown>[],
  columns: Column[],
  fileName: string
) {
  const headerRow = columns.map((c) => `"${c.header}"`).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [headerRow, ...dataRows].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── XLSX ───

function exportToXLSX(
  data: Record<string, unknown>[],
  columns: Column[],
  fileName: string
) {
  const rows = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((c) => {
      obj[c.header] = row[c.key] ?? "";
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");

  // Auto-fit column widths
  const colWidths = columns.map((c) => {
    const maxLen = Math.max(
      c.header.length,
      ...data.map((r) => String(r[c.key] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// ─── PDF ───

function exportToPDF(
  data: Record<string, unknown>[],
  columns: Column[],
  fileName: string,
  title?: string
) {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);
    doc.line(14, 32, 280, 32);
  }

  const headers = columns.map((c) => c.header);
  const body = data.map((row) =>
    columns.map((c) => String(row[c.key] ?? ""))
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: title ? 36 : 14,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [62, 207, 142],
      textColor: [18, 18, 18],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`${fileName}.pdf`);
}

// ─── XML ───

function exportToXML(
  data: Record<string, unknown>[],
  columns: Column[],
  fileName: string
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<report>\n`;
  xml += `  <generated_at>${new Date().toISOString()}</generated_at>\n`;
  xml += `  <records>\n`;

  data.forEach((row) => {
    xml += `    <record>\n`;
    columns.forEach((c) => {
      const val = row[c.key];
      const key = c.key.replace(/[^a-zA-Z0-9_-]/g, "_");
      xml += `      <${key}>${escapeXml(String(val ?? ""))}</${key}>\n`;
    });
    xml += `    </record>\n`;
  });

  xml += `  </records>\n</report>`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
