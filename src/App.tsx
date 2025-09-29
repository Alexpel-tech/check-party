import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import Home from "@/pages/Home";
import "./index.css";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
