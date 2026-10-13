import Gallery from './Gallery';
import Navbar from './Navbar';
import Preloader from './Preloader';

export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />

      {/* HOME */}
      <section id="home" className="parallax-section">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-md-8 col-sm-12">
              <div className="home-text">
                <h1>Welcome To Our Gallery!!</h1>
                <p>hehe</p>
                <ul className="section-btn">
                  <a href="#about" className="smoothScroll">
                    <span data-hover="Discover More">Discover More</span>
                  </a>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="parallax-section">
        <div className="container">
          <div className="row">
            <div className="col-md-offset-1 col-md-10 col-sm-12">
              <div className="about-info">
                <h3>OUR GALLERY</h3>
                <h1>Click to Zoom!!</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT */}
      <section id="project" className="parallax-section">
        <div className="container">
          <div className="row">
            <Gallery />
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="parallax-section">
        <div className="container">
          <div className="row">
            <div className="col-md-offset-2 col-md-8 col-sm-12">
              <div className="section-title">
                <h1>Meet Our People</h1>
              </div>
            </div>

            <div className="clearfix"></div>

            <div className="col-md-offset-2 col-md-4 col-sm-6 item">
              <div className="team-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/meh.jpg" className="img-responsive" alt="Fredrik Oswald" />
                <div className="team-overlay">
                  <ul className="social-icon">
                    <li><a href="#" className="fa fa-instagram"></a></li>
                  </ul>
                </div>
              </div>
              <p>Fredrik Oswald</p>
              <h3>Fred</h3>
            </div>

            <div className="col-md-4 col-sm-6 item">
              <div className="team-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ulan2.jpg" className="img-responsive" alt="Wulan Ester Kojongian" />
                <div className="team-overlay">
                  <ul className="social-icon">
                    <li><a href="#" className="fa fa-instagram"></a></li>
                  </ul>
                </div>
              </div>
              <p>Wulan Ester Kojongian</p>
              <h3>Ulan</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="parallax-section">
        <div className="container">
          <div className="row">
            <div className="col-md-offset-3 col-md-6 col-sm-12">
              <div className="section-title">
                <h1>SEKIAN TERIMA KASIH!! hehe</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-5 col-sm-6">
              <h2>Dibuat Oleh</h2>
              <p>Fredrik Oswald</p>
            </div>
            <div className="col-md-12 col-sm-12">
              <div className="copyright-text">
                <p>Copyright © 2023 Fredrik&apos;s Account</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
