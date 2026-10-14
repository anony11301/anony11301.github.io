import { list } from '@vercel/blob';
import { decodeTitle, photoId, staticPhotos } from '../app/photos';

export async function getPhotos() {
  const base = staticPhotos.map((p) => ({ ...p, id: photoId(p.src) }));

  if (!process.env.BLOB_READ_WRITE_TOKEN) return base;

  try {
    const { blobs } = await list({ prefix: 'gallery/', limit: 1000 });
    const uploaded = blobs
      .map((b) => {
        const m = b.pathname.match(/^gallery\/\d+__([A-Za-z0-9_-]*)\.[a-z0-9]+$/i);
        if (!m) return null;
        return {
          id: photoId(b.pathname),
          src: b.url,
          title: decodeTitle(m[1]) || 'Foto baru',
          uploadedAt: new Date(b.uploadedAt).getTime(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.uploadedAt - b.uploadedAt)
      .map(({ uploadedAt, ...rest }) => rest);
    return [...base, ...uploaded];
  } catch (err) {
    console.error('Gagal membaca daftar foto dari Blob:', err);
    return base;
  }
}
