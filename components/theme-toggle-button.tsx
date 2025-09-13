// src/components/ThemeToggleButton.tsx
import { cn } from '@/lib/utils';
import React from 'react';
import { useTheme } from './context/theme-context'; 

// (Sun and Moon SVG components remain unchanged)
type ButtonProps = {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
};

const Button = ({ children, onClick, className = '' }: ButtonProps) => (
    <button onClick={onClick} className={`p-2 rounded-md ${className}`}>
        {children}
    </button>
);
const Sun = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
    </svg>
);
const Moon = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

export const ThemeToggleButton = ({ className = '' }) => {
    // Consume the theme and toggle function from the global context
    const { theme, toggleTheme } = useTheme();

    return (
        <Button className={cn("cursor-pointer", className)} onClick={toggleTheme}>
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-all" />
            ) : (
                <Moon className="h-4 w-4 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};