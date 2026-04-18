import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import Features from '../components/Features';
import ResourceShowcase from '../components/ResourceShowcase';
import BookingWorkflow from '../components/BookingWorkflow';
import Maintenance from '../components/Maintenance';
import Roles from '../components/Roles';
import DashboardPreview from '../components/DashboardPreview';
import NotificationsSection from '../components/Notifications';
import Benefits from '../components/Benefits';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <ResourceShowcase />
        <BookingWorkflow />
        <Maintenance />
        <Roles />
        <DashboardPreview />
        <NotificationsSection />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
