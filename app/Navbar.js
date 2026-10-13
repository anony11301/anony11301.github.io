'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`navbar custom-navbar navbar-fixed-top${scrolled ? ' top-nav-collapse' : ''}`}
      role="navigation"
    >
      <div className="container">
        <div className="navbar-header">
          <a href="#home" className="navbar-brand">FREDRIK &amp; WULAN</a>
        </div>
      </div>
    </div>
  );
}
