import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';


interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number; 
}

interface ChallengesContextData {
    level: number;
    currentExperience: number; 
    experienceToNextLevel: number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    completedChallenge: () => void;
    closeLevelUpModal: () => void;

}

interface ChallengeProviderProps {
    children: ReactNode;
    level:number;
    currentExperience:number;
    challengesCompleted:number;
      
}



export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({
    children,
    ...rest 
    
}: ChallengeProviderProps) {
    const [level, setLevel] = useState(rest.level ?? 1); 
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);
    
    const [activeChallenge, setActiveChallenge] = useState(null)
    const [isLevelModalOpen, setIslevelUpModalOpen] = useState(false)
    const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

    useEffect(() => {
        Notification.requestPermission();
    }, [])

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(level));
        Cookies.set('challengesCompleted', String(level));

    }, [level, currentExperience, challengesCompleted]);
    
    function levelUp() {
      setLevel(level + 1);
      setIslevelUpModalOpen(true)
    }

    function closeLevelUpModal() {
        setIslevelUpModalOpen(false)
    }

    function startNewChallenge() {
        const randomChallengesIndex = Math.floor(Math.random() * challenges.length)
        const challenge = challenges[randomChallengesIndex]; 
    
        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play();

        if (Notification.permission === 'granted') {
            new Notification('Novo desafio 🎉', {
                body: `Valendo ${challenge.amount}xp`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completedChallenge() {
        if (!activeChallenge) {
            return;
        }

        const { amount} = activeChallenge;

        let finalExperience = currentExperience + amount;

        if (finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
    }
  
    return (
        <ChallengesContext.Provider 
            value={{    
                level, 
                currentExperience, 
                experienceToNextLevel,
                challengesCompleted, 
                levelUp,
                startNewChallenge,
                activeChallenge,
                resetChallenge,
                completedChallenge,
                closeLevelUpModal, 
            }}
        >
            {children}

            { isLevelModalOpen && <LevelUpModal/>}
        </ChallengesContext.Provider>
    );
}