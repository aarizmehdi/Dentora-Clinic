export const formatPhoneForWhatsApp = (phone: string, countryCode: string = '1') => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
    return countryCode + cleaned;
  }
  if (!cleaned.startsWith(countryCode)) {
    return countryCode + cleaned;
  }
  return cleaned;
};

export const sendWhatsAppMessage = async (
  instanceId: string,
  token: string,
  to: string,
  body: string
) => {
  if (!instanceId || !token || !to || !body) return false;

  try {
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        to,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error(`UltraMsg Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully', data);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    return false;
  }
};

export const sendWhatsAppDocument = async (
  instanceId: string,
  token: string,
  to: string,
  filename: string,
  documentBase64: string,
  caption: string = ''
) => {
  if (!instanceId || !token || !to || !documentBase64) return false;

  try {
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        to,
        filename,
        document: documentBase64.startsWith('data:') ? documentBase64 : `data:application/pdf;base64,${documentBase64}`,
        caption,
      }),
    });

    if (!response.ok) {
      throw new Error(`UltraMsg Document Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp document sent successfully', data);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp document', error);
    return false;
  }
};
