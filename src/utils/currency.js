const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value) {
  const safeValue = Number(value)
  if (Number.isNaN(safeValue)) {
    return rupiahFormatter.format(0)
  }

  return rupiahFormatter.format(safeValue)
}
