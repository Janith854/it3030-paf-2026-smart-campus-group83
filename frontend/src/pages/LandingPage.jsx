import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Navbar />
      <main>
        {/* SECTION 1: HOME */}
        <Hero />

        {/* SECTION 2: CONTACT (id="contact") */}
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
