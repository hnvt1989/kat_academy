import React, { useState, useEffect, useRef } from 'react';
import '../static/styles.css'; // Assuming styles.css is moved to static folder at root

// TypeScript declarations for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

// Helper function to calculate text similarity for echo detection
const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    // Simple substring check for quick similarity detection
    const longerWords = longer.split(' ');
    const shorterWords = shorter.split(' ');
    let matches = 0;
    
    for (const word of shorterWords) {
        if (word.length > 2 && longerWords.some(w => w.includes(word) || word.includes(w))) {
            matches++;
        }
    }
    
    return shorterWords.length > 0 ? matches / shorterWords.length : 0;
};

const LeilaPage: React.FC = () => {
    const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAudioPermission, setShowAudioPermission] = useState(false);
    const [animationSrc, setAnimationSrc] = useState<string>('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const chatboxRef = useRef<HTMLDivElement>(null);
    const audioInitializedRef = useRef(false);
    const lastBotResponseRef = useRef<string>('');
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isEndingChatRef = useRef(false);

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setShowAudioPermission(true);
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => {
                setIsListening(true);
                setAnimationSrc('/listening.webp');
            };

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                if (isSpeaking) {
                    console.log('Ignoring speech recognition while bot is speaking');
                    return;
                }

                // Skip processing if chat is ending
                if (isEndingChatRef.current) {
                    console.log('Chat is ending, ignoring speech input');
                    return;
                }

                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript.trim();
                    if (event.results[i].isFinal) {
                        finalTranscript = transcript;
                        
                        // Check for farewell phrases first
                        const lowerTranscript = finalTranscript.toLowerCase();
                        const farewellPhrases = ['bye bye', 'goodbye', 'bye', 'see you later', 'talk to you later', 'gotta go', 'i have to go'];
                        const isFarewell = farewellPhrases.some(phrase => lowerTranscript.includes(phrase));
                        
                        if (isFarewell && !isEndingChatRef.current) {
                            console.log('Farewell detected, ending chat:', finalTranscript);
                            isEndingChatRef.current = true; // Prevent multiple farewell triggers
                            
                            // Immediately stop speech recognition to prevent echo
                            if (recognitionRef.current) {
                                try {
                                    recognitionRef.current.stop();
                                } catch (err) {
                                    console.error('Error stopping recognition on farewell:', err);
                                }
                            }
                            
                            addMessage(finalTranscript, true);
                            addMessage('Goodbye! It was nice talking to you!', false);
                            
                            // End chat after TTS completes
                            setTimeout(() => {
                                endCall();
                            }, 10000); // Wait 10 seconds before ending chat
                            return;
                        }
                        
                        // Filter out echo - check if it's similar to the last bot response
                        const similarity = calculateSimilarity(finalTranscript.toLowerCase(), lastBotResponseRef.current.toLowerCase());
                        console.log('Speech detected:', finalTranscript, 'Similarity to last response:', similarity);
                        
                        // Only process if it's different enough from the last bot response and has reasonable length
                        if (finalTranscript.length > 2 && similarity < 0.7) {
                            sendMessage(finalTranscript);
                        } else {
                            console.log('Filtered out likely echo or short utterance');
                        }
                    } else {
                        interimTranscript += transcript;
                    }
                }
            };

            recognitionInstance.onend = () => {
                console.log('Recognition ended. isSpeaking:', isSpeaking, 'isListening:', isListening);
                setAnimationSrc('');
                // Only restart if we're supposed to be listening and not currently speaking
                if (isListening && !isSpeaking && recognitionRef.current) {
                    setTimeout(() => {
                        try {
                            recognitionRef.current?.start();
                            console.log('Restarted speech recognition');
                        } catch (error) {
                            console.error('Error restarting speech recognition:', error);
                            // If restart fails, keep trying with exponential backoff
                            setTimeout(() => {
                                if (isListening && !isSpeaking && recognitionRef.current) {
                                    try {
                                        recognitionRef.current.start();
                                    } catch (retryError) {
                                        console.error('Retry failed:', retryError);
                                    }
                                }
                            }, 1000);
                        }
                    }, 100); // Small delay to prevent rapid restart issues
                } else {
                    setIsListening(false);
                }
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // Ignore no-speech errors and continue listening
                    return;
                }
                if (event.error === 'aborted') {
                    // Ignore aborted errors - these happen during normal stops
                    return;
                }
                setAnimationSrc('');
                // For other errors, only show message if it's a significant error
                if (event.error !== 'network') {
                    addMessage('Sorry, I had trouble understanding you. Please try again.');
                }
            };
            recognitionRef.current = recognitionInstance;
        } else {
            console.warn('Speech recognition not supported in this browser');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
            }
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
        };
    }, []); // Removed isSpeaking from dependencies to prevent recreation

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Cleanup when navigating away from the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('Page unloading, cleaning up chat');
            if (recognitionRef.current && isListening) {
                recognitionRef.current.stop();
            }
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
            }
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log('Page hidden, pausing chat');
                if (recognitionRef.current && isListening) {
                    recognitionRef.current.stop();
                }
                if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isListening]);

    const initializeAudio = () => {
        if (audioInitializedRef.current) return true;
        console.log("Initializing audio for speech synthesis...");
        // Create a short silent sound and play it to initialize audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const audioContext = new AudioContext();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0; // Silent
            gainNode.connect(audioContext.destination);

            const oscillator = audioContext.createOscillator();
            oscillator.connect(gainNode);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.001); // Play for a very short duration
        }
        // Play a silent audio to unlock audio playback on iOS
        const silentAudio = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=");
        silentAudio.play().catch(e => console.log("Silent audio play error:", e));
        audioInitializedRef.current = true;
        setShowAudioPermission(false); // Hide permission prompt once initialized
        return true;
    };

    const handleEnableAudio = () => {
        initializeAudio();
    };

    const handleTestAudio = async () => {
        if (!initializeAudio()) return;
        await speak("Hello! I am Leila. Can you hear me?");
    };

    useEffect(() => {
        const initAudioOnInteraction = () => {
            if (!audioInitializedRef.current) {
                // We don't want to auto-init here, just remove the listener if it was somehow added
            }
        };
        // Remove this event listener as we now have an explicit button
        // document.body.addEventListener('click', initAudioOnInteraction, { once: true });
        return () => {
            // document.body.removeEventListener('click', initAudioOnInteraction);
        };
    }, []);

    const speak = async (text: string) => {
        if (!text) return;
        
        // Store the last bot response for echo filtering
        lastBotResponseRef.current = text;
        
        setIsSpeaking(true);
        setAnimationSrc('/talking.webp');

        // Clear any pending speech timeout
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
        }

        // Stop recognition immediately and ensure it stays stopped during speech
        if (recognitionRef.current && isListening) {
            try { 
                recognitionRef.current.stop(); 
                console.log('Stopped speech recognition for TTS');
            } catch (err) { 
                console.error('Error stopping speech recognition:', err); 
            }
        }

        try {
            // Try server-side TTS first
            const response = await fetch("/category/leila/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                currentAudioRef.current = audio;
                
                audio.onended = () => {
                    setIsSpeaking(false);
                    setAnimationSrc('');
                    if (recognitionRef.current && isListening) {
                        speechTimeoutRef.current = setTimeout(() => {
                            try { 
                                recognitionRef.current?.start(); 
                                console.log('Restarted speech recognition after TTS with extended delay');
                            } catch (err) { 
                                console.error('Error restarting speech recognition after TTS:', err); 
                            }
                        }, 1500);
                    }
                };
                
                await audio.play();
            } else {
                throw new Error("Server TTS not available");
            }
        } catch (e) {
            console.log("Server TTS failed, falling back to Web Speech API:", e);
            
            // Fallback to Web Speech API
            try {
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 0.9;
                    utterance.pitch = 1.1;
                    utterance.volume = 1;
                    
                    utterance.onend = () => {
                        setIsSpeaking(false);
                        setAnimationSrc('');
                        if (recognitionRef.current && isListening) {
                            speechTimeoutRef.current = setTimeout(() => {
                                try { 
                                    recognitionRef.current?.start(); 
                                    console.log('Restarted speech recognition after Web Speech API');
                                } catch (err) { 
                                    console.error('Error restarting speech recognition after Web Speech API:', err); 
                                }
                            }, 1500);
                        }
                    };
                    
                    utterance.onerror = () => {
                        console.error('Web Speech API error');
                        setIsSpeaking(false);
                        setAnimationSrc('');
                        if (recognitionRef.current && isListening) {
                            speechTimeoutRef.current = setTimeout(() => {
                                try { 
                                    recognitionRef.current?.start(); 
                                } catch (err) { 
                                    console.error('Error restarting speech recognition after speech error:', err); 
                                }
                            }, 1500);
                        }
                    };
                    
                    speechSynthesis.speak(utterance);
                } else {
                    throw new Error("Speech synthesis not supported");
                }
            } catch (fallbackError) {
                console.error("Both TTS methods failed:", fallbackError);
                setIsSpeaking(false);
                setAnimationSrc('');
                if (recognitionRef.current && isListening) {
                    speechTimeoutRef.current = setTimeout(() => {
                        try { 
                            recognitionRef.current?.start(); 
                        } catch (err) { 
                            console.error('Error restarting speech recognition after all TTS failures:', err); 
                        }
                    }, 1500);
                }
            }
        }
    };

    const addMessage = (text: string, isUser = false, skipTTS = false) => {
        setChatMessages(prevMessages => [...prevMessages, { text, isUser }]);
        if (!isUser && !skipTTS) {
            speak(text);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        addMessage(text, true);
        setIsLoading(true);
        try {
            const response = await fetch('/category/leila/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            await speak(data.reply);
            addMessage(data.reply, false, true); // Add message after speech for better UX
        } catch (error) {
            addMessage('Sorry, something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await fetch('/category/leila/clear', { method: 'POST' });
        } catch (error) {
            console.error('Error clearing chat:', error);
        } finally {
            setChatMessages([]);
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) return;

        if (!isListening) {
            if (!audioInitializedRef.current) {
                initializeAudio(); // Should now work due to user interaction via button
            }
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        } else {
            endCall();
        }
    };

    const endCall = () => {
        setChatMessages([]);
        
        // Clear any pending speech timeouts
        if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
            speechTimeoutRef.current = null;
        }
        
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        setIsSpeaking(false);
        setAnimationSrc('');
        
        // Clear the last bot response and reset flags
        lastBotResponseRef.current = '';
        isEndingChatRef.current = false;
    };

    // Animation display logic
    const currentAnimation = () => {
        if (isLoading && !isSpeaking && !isListening) return "/idle.webp";
        if (animationSrc) return animationSrc;
        return "/idle.webp";
    };

    return (
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-180px)] max-h-[700px] w-full overflow-hidden">
            <div ref={chatboxRef} className="relative flex-grow p-4 space-y-4 overflow-y-auto bg-slate-100/70 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <button onClick={handleClearChat} className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Clear Chat</button>
                {chatMessages.map((msg, index) => (
                    <div key={index} className={msg.isUser ? 'user' : 'hailey'}>
                        {msg.isUser ? 'You' : 'Leila'}: {msg.text}
                    </div>
                ))}
            </div>
            <div className="animation-container-chat flex justify-center items-center h-32 bg-slate-100/70 border-t border-slate-200">
                 <img id="animationChat" src={currentAnimation()} alt="Chat animation" className="h-full" />
            </div>
            {showAudioPermission && (
                <div id="audio-permission" className="audio-permission-overlay">
                    <div className="audio-permission-content">
                        <h2>Enable Audio for Leila</h2>
                        <p>Leila needs permission to speak on your device!</p>
                        <button id="enable-audio" onClick={handleEnableAudio} className="audio-button">Enable Leila Voice</button>
                        <button id="test-audio" onClick={handleTestAudio} className="audio-button">Test Audio</button>
                        <button id="dismiss-audio-warning" onClick={() => setShowAudioPermission(false)} className="audio-button secondary">Continue without Audio</button>
                    </div>
                </div>
            )}
            <div className="buttons">
                <button id="mic" onClick={handleMicClick} className={`mic-button call-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`} title={isListening ? "Stop Listening" : "Start Call"}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2.09 2.09 0 01-2.26 2.09A19.72 19.72 0 012.28 5.35 2.09 2.09 0 014.37 3h3a1 1 0 011 .75l1.09 4.41a1 1 0 01-.27 1L6.91 11.09a16 16 0 006 6l2.2-2.2a1 1 0 011-.27l4.38 1.09a1 1 0 01.75 1z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default LeilaPage; 