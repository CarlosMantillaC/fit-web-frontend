type CsvValue = string | number | boolean | null | undefined

type CsvRow = Record<string, CsvValue>

function escapeCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

/**
 * Descarga una lista de objetos como CSV (UTF-8 con BOM para Excel).
 * La primera fila del arreglo define las columnas y su orden.
 */
export function downloadCsv(filename: string, rows: CsvRow[]): void {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ]

  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
