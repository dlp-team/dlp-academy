// src/utils/subjectConstants.js
import { 
    BookOpen, Calculator, FlaskConical, Globe, Music, 
    Code, Dna, Palette, Trophy, Briefcase, GraduationCap,
    Laptop, HeartPulse, Scale, Leaf, Atom
} from 'lucide-react';

export const ICON_MAP = {
    book: BookOpen,
    calculator: Calculator,
    science: FlaskConical,
    globe: Globe,
    music: Music,
    code: Code,
    dna: Dna,
    art: Palette,
    trophy: Trophy,
    business: Briefcase,
    school: GraduationCap,
    tech: Laptop,
    health: HeartPulse,
    law: Scale,
    bio: Leaf,
    physics: Atom
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