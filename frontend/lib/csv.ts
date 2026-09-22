export function csvText(rows: unknown[][]): string {
  return "\uFEFF" + rows.map(row => row.map(value => {
    let text = String(value ?? "");
    // Text cells must not be interpreted as formulas when opened in a spreadsheet.
    if (typeof value === "string" && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return `"${text.replaceAll('"', '""')}"`;
  }).join(";")).join("\r\n");
}

export function downloadText(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
