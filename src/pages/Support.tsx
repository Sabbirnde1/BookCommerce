import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CustomerSupport } from "@/components/CustomerSupport";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CustomerSupport />
      <Footer />
    </div>
  );
};

export default Support;