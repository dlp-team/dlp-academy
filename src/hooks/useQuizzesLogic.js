// src/hooks/useQuizzesLogic.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useQuizzesLogic = (user) => {
    const { subjectId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [quizData, setQuizData] = useState(null);
    const [subject, setSubject] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    // Gameplay State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false); // Shows feedback for current question
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    
    // Result State
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [startTime] = useState(new Date());

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !subjectId || !topicId || !quizId) return;

            try {
                // Fetch Subject
                const subjectRef = doc(db, 'subjects', subjectId);
                const subjectSnap = await getDoc(subjectRef);
                if (subjectSnap.exists()) setSubject(subjectSnap.data());

                // Fetch Topic
                const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
                const topicSnap = await getDoc(topicRef);
                if (topicSnap.exists()) setTopic(topicSnap.data());

                // Fetch Quiz
                const quizRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'quizzes', quizId);
                const quizSnap = await getDoc(quizRef);
                
                if (quizSnap.exists()) {
                    setQuizData(quizSnap.data());
                } else {
                    console.error("Quiz not found");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, subjectId, topicId, quizId]);

    // --- GAMEPLAY HANDLERS ---

    const handleOptionSelect = (index) => {
        if (showResult) return; // Prevent changing answer after check
        setSelectedOption(index);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;

        const currentQuestion = quizData.questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 10 + (streak * 2)); // Bonus for streaks
            setStreak(prev => prev + 1);
            setCorrectCount(prev => prev + 1);
            // Trigger confetti via state in UI if needed, currently handled by effect in UI
        } else {
            setStreak(0);
            setWrongCount(prev => prev + 1);
        }

        setShowResult(true);
        setShowExplanation(true);
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
            setShowExplanation(false);
        } else {
            await saveQuizResult();
            setQuizFinished(true);
        }
    };

    const saveQuizResult = async () => {
        if (!user) return;
        
        try {
            const resultRef = doc(db, 'users', user.uid, 'quiz_results', `${quizId}_${Date.now()}`);
            await setDoc(resultRef, {
                subjectId,
                topicId,
                quizId,
                score,
                correctCount,
                wrongCount,
                totalQuestions: quizData.questions.length,
                completedAt: serverTimestamp(),
                quizName: quizData.name || 'Quiz',
                subjectName: subject?.name || 'Asignatura',
                topicTitle: topic?.title || 'Tema'
            });
        } catch (error) {
            console.error("Error saving result:", error);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setStreak(0);
        setShowExplanation(false);
        setQuizFinished(false);
        setCorrectCount(0);
        setWrongCount(0);
    };

    const handleGoBack = () => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    };

    // --- HELPERS ---
    const getProgressColor = () => {
        const percentage = ((currentQuestionIndex + 1) / (quizData?.questions.length || 1)) * 100;
        if (percentage < 33) return 'bg-indigo-500';
        if (percentage < 66) return 'bg-purple-500';
        return 'bg-emerald-500';
    };

    const getStreakColor = () => {
        if (streak > 2) return 'text-orange-500';
        if (streak > 0) return 'text-emerald-500';
        return 'text-slate-300';
    };

    // Derived Styles
    const topicGradient = topic?.color || 'from-indigo-500 to-purple-600';
    const accentColor = topic?.color ? topic.color.split(' ')[1].replace('to-', 'text-') : 'text-indigo-600'; // Rough extraction or default

    return {
        // Data
        quizData,
        subject,
        topic,
        loading,
        topicGradient,
        accentColor,
        
        // State
        currentQuestionIndex,
        selectedOption,
        showResult,
        score,
        streak,
        showExplanation,
        quizFinished,
        correctCount,
        wrongCount,
        
        // Handlers
        handleOptionSelect,
        handleCheckAnswer,
        handleNextQuestion,
        handleRetry,
        handleGoBack,
        
        // Helpers
        getProgressColor,
        getStreakColor
    };
};