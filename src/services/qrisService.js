import QRCode from 'qrcode'

export function buildQrisPayload(order) {
  return [
    'HANAKA-CAKE',
    `ORDER:${order.orderNumber}`,
    `TOTAL:${order.totalPrice}`,
    `NAME:${order.customerName}`,
  ].join('|')
}

export async function generateQrisDataUrl(order) {
  const payload = buildQrisPayload(order)

  return QRCode.toDataURL(payload, {
    width: 320,
    margin: 1,
    color: {
      dark: '#2a1d15',
      light: '#fff9f2',
    },
  })
}
