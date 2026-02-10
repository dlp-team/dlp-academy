// src/utils/subjectConstants.js
import { 
  BookOpen, Calculator, FlaskConical, Globe, Music, Code, Dna, 
  Palette, Trophy, Briefcase, GraduationCap, Laptop, HeartPulse, 
  Scale, Leaf, Atom, Languages, Brain, Map, Microscope, 
  Gamepad2, Camera, Rocket, Theater, Construction, Landmark, 
  Clapperboard, Star, Stethoscope, Lightbulb, Pi, Sigma, Variable, Infinity,
  Divide, SquareFunction
} from 'lucide-react';

export const ICON_MAP = {
    // STEM (Science, Tech, Engineering)
    science: FlaskConical,
    physics: Atom,
    bio: Leaf,
    dna: Dna,
    research: Microscope,
    tech: Laptop,
    code: Code,
    engineering: Construction,
    space: Rocket,

    // Math
    calculator: Calculator,
    pi: Pi,
    statistics: Sigma,
    algebra: Variable,
    calculus: Infinity,
    functions: SquareFunction,
    arithmetic: Divide,

    // Humanities & Social Sciences
    language: Languages,
    psychology: Brain,
    geography: Map,
    history: Landmark,
    globe: Globe,
    law: Scale,

    // Arts & Entertainment
    art: Palette,
    music: Music,
    drama: Theater,
    cinema: Clapperboard,
    photography: Camera,
    gaming: Gamepad2,

    // Professional & Academic
    school: GraduationCap,
    book: BookOpen,
    business: Briefcase,
    medicine: Stethoscope,
    health: HeartPulse,
    innovation: Lightbulb,

    // General & Achievements
    trophy: Trophy,
    start: Star
};

export const ICON_KEYS = Object.keys(ICON_MAP);

export const COLORS = [
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-red-400 to-red-600',
    'from-orange-400 to-orange-600',
    'from-emerald-400 to-emerald-600',
    'from-cyan-400 to-cyan-600',
    'from-teal-400 to-teal-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
];

// --- EDUCATION LEVELS CONSTANTS ---
export const EDUCATION_LEVELS = {
    'Primaria': ['1º', '2º', '3º', '4º', '5º', '6º'],
    'ESO': ['1º', '2º', '3º', '4º'],
    'Bachillerato': ['1º', '2º'],
    'FP': ['Grado Medio 1', 'Grado Medio 2', 'Grado Superior 1', 'Grado Superior 2'],
    'Universidad': ['1º', '2º', '3º', '4º', '5º', '6º', 'Máster', 'Doctorado']
};

 // Modern Fill Colors - More vibrant, visible gradients with proper CSS classes
export const MODERN_FILL_COLORS = [
    { name: 'Neutral', value: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900' },
    { name: 'Azul', value: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-950/60' },
    { name: 'Índigo', value: 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/60 dark:to-indigo-950/60' },
    { name: 'Púrpura', value: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/60 dark:to-purple-950/60' },
    { name: 'Rosa', value: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/60 dark:to-pink-950/60' },
    { name: 'Rosa intenso', value: 'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/60 dark:to-rose-950/60' },
    { name: 'Esmeralda', value: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/60 dark:to-emerald-950/60' },
    // { name: 'Mid-Neutro', value: 'bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-300 dark:500' },
    { name: 'Verde azulado', value: 'bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/60 dark:to-teal-950/60' },
    { name: 'Cian', value: 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/60 dark:to-cyan-950/60' },
    { name: 'Cielo', value: 'bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/60 dark:to-sky-950/60' },
    { name: 'Ámbar', value: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/60 dark:to-amber-950/60' },
    { name: 'Naranja', value: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/60 dark:to-orange-950/60' },
    { name: 'Rojo', value: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/60 dark:to-red-950/60' },
    { name: 'Lima', value: 'bg-gradient-to-br from-lime-100 to-lime-200 dark:from-lime-900/60 dark:to-lime-950/60' },
    { name: 'Antineutral', value: 'bg-gradient-to-br from-slate-800 to-slate-950 dark:from-slate-100 dark:to-slate-300' },
];