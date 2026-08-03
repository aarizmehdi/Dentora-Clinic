const IMGBB_API_KEY = '7813c9102641cf7b10af62e011d30a25';

export const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  // ImgBB API requires key as query param
  const url = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return data.data.url; // This is the direct image URL
    } else {
      throw new Error(data.error?.message || 'Upload to ImgBB failed');
    }
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
};
