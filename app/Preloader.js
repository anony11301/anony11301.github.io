'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="preloader">
      <div className="spinner">
        <span className="sk-inner-circle"></span>
      </div>
    </div>
  );
}
