import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminDashboard />
      <Footer />
    </div>
  );
};

export default Admin;