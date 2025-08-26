import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex flex-col">
            <h1 className="signature-logo animate-glow">Stella</h1>
            <p className="text-xs font-serif uppercase tracking-wider text-muted-foreground ml-1">
              Supervised Learning Simplified
            </p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="nav-link">Home</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#projects" className="nav-link">Projects</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg bg-muted/20 backdrop-blur-sm border border-border/20 hover:bg-muted/30 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <a href="#home" className="nav-link text-center py-2" onClick={toggleMenu}>
                Home
              </a>
              <a href="#how-it-works" className="nav-link text-center py-2" onClick={toggleMenu}>
                How It Works
              </a>
              <a href="#projects" className="nav-link text-center py-2" onClick={toggleMenu}>
                Projects
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;