import Navbar from "../components/layout/Navbar";
import Hero from "../section/landing/Hero";
import Features from "../section/landing/Features";
import Stats from "../section/landing/Stats";
import Footer from "../components/layout/Footer";


export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}