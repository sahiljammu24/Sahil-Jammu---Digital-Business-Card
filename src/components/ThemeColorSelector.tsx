import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface ColorTheme {
  name: string;
  primary: string;
  primaryGlow: string;
  accent: string;
  gradient: string;
}

export const colorThemes: ColorTheme[] = [
  {
    name: 'Ocean Depths',
    primary: '220 91% 50%',
    primaryGlow: '220 91% 70%',
    accent: '200 100% 60%',
    gradient: 'linear-gradient(135deg, hsl(220 91% 50%), hsl(200 100% 60%), hsl(190 85% 65%))',
  },
  {
    name: 'Emerald Forest',
    primary: '158 64% 52%',
    primaryGlow: '158 64% 72%',
    accent: '142 69% 58%',
    gradient: 'linear-gradient(135deg, hsl(158 64% 52%), hsl(142 69% 58%), hsl(125 71% 66%))',
  },
  {
    name: 'Royal Amethyst',
    primary: '260 83% 57%',
    primaryGlow: '260 83% 77%',
    accent: '280 85% 65%',
    gradient: 'linear-gradient(135deg, hsl(260 83% 57%), hsl(280 85% 65%), hsl(300 82% 70%))',
  },
  {
    name: 'Sunset Blaze',
    primary: '20 94% 58%',
    primaryGlow: '20 94% 78%',
    accent: '35 91% 65%',
    gradient: 'linear-gradient(135deg, hsl(20 94% 58%), hsl(35 91% 65%), hsl(50 88% 70%))',
  },
  {
    name: 'Rose Gold',
    primary: '340 75% 62%',
    primaryGlow: '340 75% 82%',
    accent: '15 79% 70%',
    gradient: 'linear-gradient(135deg, hsl(340 75% 62%), hsl(15 79% 70%), hsl(30 85% 75%))',
  },
  {
    name: 'Midnight Azure',
    primary: '240 100% 35%',
    primaryGlow: '240 100% 55%',
    accent: '220 100% 45%',
    gradient: 'linear-gradient(135deg, hsl(240 100% 35%), hsl(220 100% 45%), hsl(200 90% 55%))',
  },
  {
    name: 'Crimson Velvet',
    primary: '348 83% 47%',
    primaryGlow: '348 83% 67%',
    accent: '15 85% 55%',
    gradient: 'linear-gradient(135deg, hsl(348 83% 47%), hsl(15 85% 55%), hsl(30 80% 65%))',
  },
  {
    name: 'Golden Harvest',
    primary: '42 87% 55%',
    primaryGlow: '42 87% 75%',
    accent: '25 85% 60%',
    gradient: 'linear-gradient(135deg, hsl(42 87% 55%), hsl(25 85% 60%), hsl(10 80% 65%))',
  },
  {
    name: 'Lavender Dreams',
    primary: '280 60% 70%',
    primaryGlow: '280 60% 85%',
    accent: '260 55% 75%',
    gradient: 'linear-gradient(135deg, hsl(280 60% 70%), hsl(260 55% 75%), hsl(240 50% 80%))',
  },
  {
    name: 'Arctic Mint',
    primary: '175 60% 50%',
    primaryGlow: '175 60% 70%',
    accent: '195 65% 55%',
    gradient: 'linear-gradient(135deg, hsl(175 60% 50%), hsl(195 65% 55%), hsl(215 60% 65%))',
  },
  {
    name: 'Cosmic Purple',
    primary: '270 100% 25%',
    primaryGlow: '270 100% 45%',
    accent: '290 95% 35%',
    gradient: 'linear-gradient(135deg, hsl(270 100% 25%), hsl(290 95% 35%), hsl(310 85% 45%))',
  },
  {
    name: 'Cherry Blossom',
    primary: '330 60% 65%',
    primaryGlow: '330 60% 80%',
    accent: '350 70% 70%',
    gradient: 'linear-gradient(135deg, hsl(330 60% 65%), hsl(350 70% 70%), hsl(10 65% 75%))',
  }
];

export const applyTheme = (theme: ColorTheme) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-glow', theme.primaryGlow);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--gradient-primary', theme.gradient);
  
  // Update button gradient
  root.style.setProperty('--gradient-button', `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.primaryGlow}))`);
  
  // Update background gradient with enhanced depth
  root.style.setProperty('--gradient-bg', 
    `radial-gradient(ellipse at top left, hsl(${theme.primary} / 0.15) 0%, transparent 60%), 
     radial-gradient(ellipse at bottom right, hsl(${theme.accent} / 0.12) 0%, transparent 60%),
     radial-gradient(ellipse at center, hsl(${theme.primaryGlow} / 0.08) 0%, transparent 80%)`
  );
  
  // Update shadow colors
  root.style.setProperty('--shadow-button', `0 4px 16px hsl(${theme.primary} / 0.3)`);
  root.style.setProperty('--shadow-glow', `0 0 40px hsl(${theme.primaryGlow} / 0.4)`);
};

export function ThemeColorSelector() {
  const [selectedTheme, setSelectedTheme] = useState<string>('Ocean Depths');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage or default to Ocean Depths
    const savedTheme = localStorage.getItem('selectedColorTheme');
    const defaultTheme = colorThemes[0]; // Ocean Depths is first in array
    
    if (savedTheme) {
      const theme = colorThemes.find(theme => theme.name === savedTheme);
      if (theme) {
        setSelectedTheme(savedTheme);
        applyTheme(theme);
      } else {
        // If saved theme doesn't exist anymore, use default
        setSelectedTheme(defaultTheme.name);
        applyTheme(defaultTheme);
        localStorage.setItem('selectedColorTheme', defaultTheme.name);
      }
    } else {
      // No saved theme, use Ocean Depths as default
      setSelectedTheme(defaultTheme.name);
      applyTheme(defaultTheme);
      localStorage.setItem('selectedColorTheme', defaultTheme.name);
    }
  }, []);

  const handleThemeSelect = (theme: ColorTheme) => {
    setSelectedTheme(theme.name);
    applyTheme(theme);
    localStorage.setItem('selectedColorTheme', theme.name);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="no-print"
          aria-label="Change theme colors"
        >
          <Palette className="w-4 h-4 mr-2" />
          Theme
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-6" align="center">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-xl mb-2">Choose Your Theme</h3>
            <p className="text-sm text-muted-foreground">Transform your interface with beautiful color palettes</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {colorThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemeSelect(theme)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:rotate-1 ${
                  selectedTheme === theme.name
                    ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
                style={{
                  background: theme.gradient,
                  backgroundSize: '200% 200%',
                  animation: selectedTheme === theme.name ? 'gradient-shift 4s ease infinite' : undefined
                }}
              >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
                
                <div className="relative z-10 text-center">
                  <div className="text-white font-semibold text-xs mb-2 drop-shadow-lg">
                    {theme.name}
                  </div>
                  
                  {/* Color dots preview */}
                  <div className="flex justify-center gap-1 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full border border-white/30"
                      style={{ backgroundColor: `hsl(${theme.primary})` }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full border border-white/30"
                      style={{ backgroundColor: `hsl(${theme.accent})` }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full border border-white/30"
                      style={{ backgroundColor: `hsl(${theme.primaryGlow})` }}
                    ></div>
                  </div>
                  
                  {selectedTheme === theme.name && (
                    <div className="flex justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
                        <Check className="w-3 h-3 text-black" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>
          
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              ✨ Your theme preference is saved automatically
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}