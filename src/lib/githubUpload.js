const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

/**
 * رفع صورة إلى GitHub
 * @param {File} file - ملف الصورة
 * @returns {Promise<string>} رابط الصورة عبر jsDelivr
 */
export async function uploadToGitHub(file) {
  if (!file) throw new Error('لم يتم اختيار صورة');
  if (!file.type.startsWith('image/')) throw new Error('يجب أن يكون الملف صورة');
  if (file.size > 10 * 1024 * 1024) throw new Error('حجم الصورة يتجاوز 10 ميجابايت');

  // 1. تحويل الصورة إلى Base64
  const base64 = await fileToBase64(file);
  const base64Data = base64.split(',')[1];

  // 2. توليد اسم فريد للملف
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}-${random}.${extension}`;

  // 3. رفع الملف إلى GitHub API
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filename}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${filename}`,
      content: base64Data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'فشل رفع الصورة إلى GitHub');
  }

  // 4. إرجاع رابط jsDelivr (CDN سريع أمام GitHub)
  // ملاحظة: jsDelivr قد يحتاج دقيقة لتحديث الصورة الأولى
  return `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@main/${filename}`;
}

/**
 * تحويل ملف إلى Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  });
}
