// src/pages/Topic/hooks/useTopicFailedQuestions.js
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useTopicFailedQuestions = (user, topicId) => {
    const [attempts, setAttempts] = useState([]);
    const [masteredQuestions, setMasteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const hasContext = Boolean(user?.uid && topicId);

    useEffect(() => {
        if (!hasContext) {
            return undefined;
        }

        const attemptsQuery = query(
            collection(db, 'quizAttempts'),
            where('userId', '==', user.uid),
            where('topicId', '==', topicId)
        );

        const unsubscribeAttempts = onSnapshot(attemptsQuery, (snapshot) => {
            const nextAttempts = snapshot.docs.map((attemptDoc) => ({ id: attemptDoc.id, ...attemptDoc.data() }));
            setAttempts(nextAttempts);
            setLoading(false);
        }, (error) => {
            console.error('[TOPIC_FAILED_QUESTIONS] Error loading attempts:', error);
            setAttempts([]);
            setMasteredQuestions([]);
            setLoading(false);
        });

        const masteredDocRef = doc(db, 'repasoMastered', `${user.uid}__${topicId}`);
        const unsubscribeMastered = onSnapshot(masteredDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                setMasteredQuestions([]);
                return;
            }
            const mastered = snapshot.data()?.masteredQuestions;
            setMasteredQuestions(Array.isArray(mastered) ? mastered : []);
        }, (error) => {
            console.error('[TOPIC_FAILED_QUESTIONS] Error loading mastered questions:', error);
            setMasteredQuestions([]);
        });

        return () => {
            unsubscribeAttempts();
            unsubscribeMastered();
        };
    }, [hasContext, topicId, user?.uid]);

    const failedQuestions = useMemo(() => {
        if (!hasContext || !attempts.length) return [];

        const latestByQuiz = {};
        attempts.forEach((attempt) => {
            if (!attempt?.quizId) return;
            const current = latestByQuiz[attempt.quizId];
            const nextMs = attempt?.completedAt?.toMillis ? attempt.completedAt.toMillis() : 0;
            const currentMs = current?.completedAt?.toMillis ? current.completedAt.toMillis() : 0;
            if (!current || nextMs >= currentMs) {
                latestByQuiz[attempt.quizId] = attempt;
            }
        });

        const masteredSet = new Set(
            masteredQuestions
                .map((entry) => `${entry.quizId}::${entry.questionIndex}`)
        );

        const output = [];
        Object.values(latestByQuiz).forEach((attempt) => {
            (attempt.answersDetail || []).forEach((question) => {
                if (question?.isCorrect) return;
                const key = `${attempt.quizId}::${question.questionIndex}`;
                if (masteredSet.has(key)) return;
                output.push({
                    ...question,
                    quizId: attempt.quizId,
                    quizTitle: attempt.quizTitle || 'Test',
                    sourceAttemptId: attempt.id
                });
            });
        });

        return output;
    }, [hasContext, attempts, masteredQuestions]);

    return { failedQuestions, loading: hasContext ? loading : false };
};

export default useTopicFailedQuestions;
