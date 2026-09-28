import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutTabs from "@/components/AboutTabs";
import Programs from "@/components/Programs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AboutTabs />
         <Programs  limit={1}/> 
      </main>
      <Footer />
    </>
  );
}
