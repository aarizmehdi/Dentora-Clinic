export const formatPhoneForWhatsApp = (phone: string, countryCode: string = '92') => {
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

// Read UltraMsg credentials from environment variables or passed overrides
export const getUltraMsgCredentials = (instanceIdOverride?: string, tokenOverride?: string) => {
  const instanceId = (instanceIdOverride && instanceIdOverride.trim().length > 0)
    ? instanceIdOverride
    : (import.meta.env.VITE_ULTRAMSG_INSTANCE_ID || '');

  const token = (tokenOverride && tokenOverride.trim().length > 0)
    ? tokenOverride
    : (import.meta.env.VITE_ULTRAMSG_TOKEN || '');

  return { instanceId, token };
};

export const isWhatsAppAvailable = (clinic?: any) => {
  if (clinic?.whatsappConfig?.enabled === false) return false;
  const creds = getUltraMsgCredentials(clinic?.whatsappConfig?.instanceId, clinic?.whatsappConfig?.token);
  return Boolean(creds.instanceId && creds.token);
};

export const sendWhatsAppMessage = async (
  instanceId?: string,
  token?: string,
  to?: string,
  body?: string
) => {
  const creds = getUltraMsgCredentials(instanceId, token);
  if (!creds.instanceId || !creds.token || !to || !body) {
    console.warn('UltraMsg credentials or recipient missing:', { instanceId: creds.instanceId, to, hasBody: !!body });
    return false;
  }

  try {
    const response = await fetch(`https://api.ultramsg.com/${creds.instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: creds.token,
        to,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error(`UltraMsg Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully via UltraMsg', data);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message via UltraMsg', error);
    return false;
  }
};

export const sendWhatsAppDocument = async (
  instanceId?: string,
  token?: string,
  to?: string,
  filename?: string,
  documentBase64?: string,
  caption: string = ''
) => {
  const creds = getUltraMsgCredentials(instanceId, token);
  if (!creds.instanceId || !creds.token || !to || !documentBase64) {
    console.warn('UltraMsg document credentials or document missing:', { instanceId: creds.instanceId, to });
    return false;
  }

  try {
    const response = await fetch(`https://api.ultramsg.com/${creds.instanceId}/messages/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: creds.token,
        to,
        filename: filename || 'document.pdf',
        document: documentBase64.startsWith('data:') ? documentBase64 : `data:application/pdf;base64,${documentBase64}`,
        caption,
      }),
    });

    if (!response.ok) {
      throw new Error(`UltraMsg Document Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp document sent successfully via UltraMsg', data);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp document via UltraMsg', error);
    return false;
  }
};
