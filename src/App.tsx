import React from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import QuickActions from "./components/QuickActions";
import ChatBot from "./components/ChatBot";
import Footer from "./components/Footer";

const App: React.FC = () => (
  <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
    <Header />
    <main className="container mx-auto px-4 py-6">
      <HeroSection />
      <QuickActions />
      <ChatBot />
    </main>
    <Footer />
  </div>
);

export default App;
