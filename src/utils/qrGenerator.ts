import QRCode from 'qrcode';

let cachedQrUrl = '';
let cachedTarget = '';

export async function generateMenuQrCode(targetUrl?: string): Promise<string> {
  const url = targetUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://deliciasbelgi.com');
  if (cachedQrUrl && cachedTarget === url) {
    return cachedQrUrl;
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    cachedQrUrl = dataUrl;
    cachedTarget = url;
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
