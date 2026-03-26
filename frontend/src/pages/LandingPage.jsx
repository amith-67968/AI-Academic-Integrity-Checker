import { Link } from "react-router-dom";
import { HeroGeometric } from "../components/ui/shape-landing-hero";

export default function LandingPage({ session }) {
  const targetRoute = session ? "/dashboard" : "/login";

  const actionButtons = (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          to={targetRoute} 
          className="px-8 py-3.5 rounded-xl bg-white text-[#0B0B0C] font-semibold tracking-wide hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {session ? "Go to Dashboard" : "Get Started"}
        </Link>
      </div>
      {!session && (
        <p className="text-sm text-white/50 tracking-wide font-light">
          No signup required • Instant results
        </p>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#030303]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 backdrop-blur-md bg-[#030303]/40 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          {/* Subtle glow orb behind logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-[20px] opacity-20" />
            <span className="relative text-white font-bold tracking-tight text-xl">IntegrityAI</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {!session && (
            <Link 
              to="/login" 
              className="text-sm text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus:text-white font-medium cursor-pointer"
            >
              Log in
            </Link>
          )}
          <Link 
            to={targetRoute} 
            className="text-sm font-semibold bg-white text-[#0B0B0C] px-6 py-2.5 rounded-full hover:scale-[1.03] transition-all duration-200 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            {session ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroGeometric 
        badge="AI Detection Protocol"
        title1="Verify Content"
        title2="Instantly with AI"
        actionButtons={actionButtons}
      />
    </div>
  );
}
