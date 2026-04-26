import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import Services from '../components/Services';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Navbar />
      <main>
        {/* SECTION 1: HOME */}
        <Hero />

        {/* SECTION 2: ABOUT */}
        <AboutSection />

        {/* SECTION 3: SERVICES */}
        <Services />

        {/* SECTION 4: CONTACT (id="contact") */}
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
