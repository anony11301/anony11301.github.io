'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { photoId, photos } from './photos';

const MINE_KEY = 'gallery-likes'; // status "sudah saya like" per browser
const NAME_KEY = 'gallery-comment-name';

function readStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function CommentModal({ id, comments, onClose }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    setName(readStorage(NAME_KEY, ''));
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const el = document.querySelector('.cmt-list');
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments]);

  const submit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const t = text.trim();
    if (!n || !t) return;
    writeStorage(NAME_KEY, n);
    setText('');
    try {
      await addDoc(collection(db, 'photos', id, 'comments'), {
        name: n,
        text: t,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Gagal mengirim komentar:', err);
      alert('Komentar gagal dikirim.');
    }
  };

  return (
    <div className="cmt-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmt-box">
        <div className="cmt-head">
          <b>Komentar</b>
          <button type="button" className="cmt-close" aria-label="Tutup" onClick={onClose}>
            &times;
          </button>
        </div>
        <ul className="cmt-list">
          {comments.length === 0 && <li className="cmt-empty">Belum ada komentar.</li>}
          {comments.map((c, i) => (
            <li key={i}>
              <b>{c.name}</b>
              {c.text}
            </li>
          ))}
        </ul>
        <form className="cmt-form" onSubmit={submit}>
          <input
            className="cmt-name"
            type="text"
            maxLength={30}
            placeholder="Nama"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="cmt-text"
            type="text"
            maxLength={300}
            placeholder="Tulis komentar..."
            required
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Kirim</button>
        </form>
      </div>
    </div>
  );
}

function Lightbox({ index, onClose, onChange }) {
  const photo = photos[index];
  const prev = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, onChange]);
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button type="button" className="lightbox-close" aria-label="Tutup" onClick={onClose}>
        &times;
      </button>
      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label="Sebelumnya"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >
        &#8249;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.title} onClick={(e) => e.stopPropagation()} />
      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label="Berikutnya"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >
        &#8250;
      </button>
      <div className="lightbox-caption">
        {photo.title} ({index + 1} / {photos.length})
      </div>
    </div>
  );
}

export default function Gallery() {
  const [counts, setCounts] = useState({}); // id -> jumlah like (dari Firestore)
  const [mine, setMine] = useState({});     // id -> true jika browser ini sudah like
  const [comments, setComments] = useState({}); // id -> daftar komentar
  const [openComments, setOpenComments] = useState(null); // id foto
  const [lightbox, setLightbox] = useState(null); // index foto

  useEffect(() => {
    setMine(readStorage(MINE_KEY, {}));

    const unsubs = [];
    unsubs.push(
      onSnapshot(collection(db, 'likes'), (snap) => {
        const next = {};
        snap.forEach((d) => { next[d.id] = d.data().count || 0; });
        setCounts(next);
      })
    );
    photos.forEach(({ src }) => {
      const id = photoId(src);
      const q = query(collection(db, 'photos', id, 'comments'), orderBy('createdAt', 'asc'));
      unsubs.push(
        onSnapshot(q, (snap) => {
          setComments((prev) => ({ ...prev, [id]: snap.docs.map((d) => d.data()) }));
        })
      );
    });
    return () => unsubs.forEach((u) => u());
  }, []);

  const toggleLike = (id) => {
    const nowLiked = !mine[id];
    const nextMine = { ...mine, [id]: nowLiked };
    setMine(nextMine);
    writeStorage(MINE_KEY, nextMine);
    setDoc(doc(db, 'likes', id), { count: increment(nowLiked ? 1 : -1) }, { merge: true }).catch((err) =>
      console.error('Gagal menyimpan like:', err)
    );
  };

  const closeComments = useCallback(() => setOpenComments(null), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <>
      {photos.map((photo, i) => {
        const id = photoId(photo.src);
        const liked = !!mine[id];
        return (
          <div className="col-md-6 col-sm-6" key={photo.src}>
            <div className="project-item">
              <a
                href={photo.src}
                onClick={(e) => {
                  e.preventDefault();
                  setLightbox(i);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} className="img-responsive" alt={photo.title} loading="lazy" />
                <div className="project-overlay">
                  <div className="project-info">
                    <h1>{photo.title}</h1>
                    <h3>Click to pop up!</h3>
                  </div>
                </div>
              </a>
              <button
                type="button"
                className={`like-btn${liked ? ' liked' : ''}`}
                aria-label="Like"
                onClick={() => toggleLike(id)}
              >
                <i className={`fa ${liked ? 'fa-heart' : 'fa-heart-o'}`}></i>
                <span>{Math.max(counts[id] || 0, 0)}</span>
              </button>
              <button
                type="button"
                className="like-btn cmt-btn"
                aria-label="Komentar"
                onClick={() => setOpenComments(id)}
              >
                <i className="fa fa-comment-o"></i>
                <span>{(comments[id] || []).length}</span>
              </button>
            </div>
          </div>
        );
      })}

      {openComments && (
        <CommentModal id={openComments} comments={comments[openComments] || []} onClose={closeComments} />
      )}
      {lightbox !== null && <Lightbox index={lightbox} onClose={closeLightbox} onChange={setLightbox} />}
    </>
  );
}
