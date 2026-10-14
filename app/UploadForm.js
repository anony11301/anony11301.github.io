'use client';

import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const MAX_SIDE = 1600;

// Perkecil foto (maks 1600px) supaya upload cepat dan hemat penyimpanan.
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    return blob || file;
  } catch (e) {
    return file;
  }
}

const toBase64Url = (str) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export default function UploadForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const data = await shrink(file);
      const ext = data.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'jpg';
      const pathname = `gallery/${Date.now()}__${toBase64Url(title.trim() || 'Foto baru')}.${ext}`;
      await upload(pathname, data, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: password,
        contentType: data.type || file.type,
      });
      setFile(null);
      setTitle('');
      e.target.reset();
      setMessage('Berhasil diupload!');
      router.refresh();
    } catch (err) {
      setMessage(err.message || 'Upload gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col-md-12 col-sm-12 upload-wrap">
      {!open ? (
        <button type="button" className="upload-toggle" onClick={() => setOpen(true)}>
          + Upload Foto
        </button>
      ) : (
        <form className="upload-form" onSubmit={submit}>
          <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => setFile(e.target.files[0] || null)} />
          <input type="text" placeholder="Judul foto" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="password" placeholder="Password upload" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={busy}>{busy ? 'Mengupload...' : 'Upload'}</button>
          <button type="button" className="upload-cancel" onClick={() => setOpen(false)}>Tutup</button>
          {message && <p className="upload-msg">{message}</p>}
        </form>
      )}
    </div>
  );
}
