import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './views/AdminDashboard';
import StudentDashboard from './views/StudentDashboard';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-100">Omni.</span>
        </div>
        <div className="flex space-x-1">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${isActive('/') ? 'bg-zinc-800/50 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
          >
            Candidate Portal
          </Link>
          <Link 
            to="/admin" 
            className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${isActive('/admin') ? 'bg-zinc-800/50 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
          >
            Console
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen text-zinc-100 selection:bg-indigo-500/30">
        <Navigation />
        <main className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
