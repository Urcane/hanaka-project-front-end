import QRCode from 'qrcode'

export async function generateQrisDataUrl({ qrString }) {
  return QRCode.toDataURL(qrString, {
    width: 320,
    margin: 1,
    color: {
      dark: '#2a1d15',
      light: '#fff9f2',
    },
  })
}
