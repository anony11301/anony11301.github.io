export const staticPhotos = [
  { src: '/images/boba.jpg', title: 'Nunggu Boba ges' },
  { src: '/images/bestt.jpg', title: 'Foto paling de bessttt!!!' },
  { src: '/images/boba2.jpg', title: 'Nunggu Boba Lagi ges' },
  { src: '/images/kunci.jpg', title: 'Gabole Pulang' },
  { src: '/images/first.jpg', title: 'Foto Pertama kali Ketemu wkwkwkwk' },
  { src: '/images/ucuu.jpg', title: 'Lucuu' },
  { src: '/images/best.jpg', title: 'Waa' },
];

// ID dokumen Firestore tidak boleh mengandung "/" dan sama dengan versi lama
// (mis. "images/boba.jpg" -> "images_boba_jpg"), supaya data like/komentar lama tetap terbaca.
export const photoId = (src) => src.replace(/^\//, '').replace(/[/.]/g, '_');

// Judul foto upload disimpan di nama file Blob (base64url), jadi tidak butuh database.
// Format nama: gallery/<timestamp>__<base64url(judul)>.<ext>
export const encodeTitle = (title) => Buffer.from(title, 'utf8').toString('base64url');
export const decodeTitle = (b64) => {
  try {
    return Buffer.from(b64, 'base64url').toString('utf8');
  } catch (e) {
    return '';
  }
};
