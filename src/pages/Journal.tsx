import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";

const Journal = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[hsl(220,40%,8%)] text-white flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-white/70 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Journal</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-5">
          <BookOpen className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Coming soon</h2>
        <p className="text-sm text-white/60 max-w-xs">
          The trade journal is on its way. Log trades, track P&L and review your edge  all in one place.
        </p>
      </main>
      <BottomNav />
    </div>
  );
};

export default Journal;
