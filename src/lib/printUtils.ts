export const printPDFBase64 = (base64Data: string) => {
  // Convert base64 to a Blob, then use a blob URL for maximum browser compatibility
  const raw = base64Data.startsWith('data:application/pdf;base64,')
    ? base64Data.split(',')[1]
    : base64Data;

  const byteCharacters = atob(raw);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';

  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (e) {
        // Fallback: open in new tab for browsers that block cross-origin iframe print
        window.open(blobUrl, '_blank');
      }
      // Cleanup after print dialog
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      }, 10000);
    }, 250);
  };
};
