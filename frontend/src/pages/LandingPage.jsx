import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-[#060C1A]">
      <Navbar />
      <main>
        {/* SECTION 1: HOME */}
        <Hero />
        
        {/* SECTION 2: ABOUT (id="about") */}
        <About />
        
        {/* SECTION 3: SERVICES (id="services") */}
        <Services />
        
        {/* SECTION 4: CONTACT (id="contact") */}
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
