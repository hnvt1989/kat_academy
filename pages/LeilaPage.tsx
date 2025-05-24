// Add type definitions for SpeechRecognition API
interface SpeechGrammarList { addFromString(string: string, weight?: number): void; item(index: number): SpeechGrammar; length: number; }
interface SpeechGrammar { src: string; weight: number; }
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechenu: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

declare var SpeechRecognition: SpeechRecognitionStatic;
declare var webkitSpeechRecognition: SpeechRecognitionStatic; // For Safari/Chrome legacy

import React, { useState, useEffect, useRef } from 'react';
import '../static/styles.css'; // Assuming styles.css is moved to static folder at root

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
                setAnimationSrc('/static/listening.webp');
            };

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                if (isSpeaking) return;

                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript = transcript;
                        sendMessage(finalTranscript);
                    } else {
                        interimTranscript += transcript;
                    }
                }
            };

            recognitionInstance.onend = () => {
                if (isSpeaking) return;
                setAnimationSrc('');
                if (isListening && recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (error) {
                        console.error('Error restarting speech recognition:', error);
                    }
                } else {
                    setIsListening(false);
                }
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') return;
                setIsListening(false);
                setAnimationSrc('');
                addMessage('Sorry, I had trouble understanding you. Please try again.');
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
        };
    }, [isSpeaking]); // Added isSpeaking to dependency array to re-evaluate onend logic

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [chatMessages]);

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
        const silentAudio = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=");
        silentAudio.play().catch(e => console.log("Silent audio play error:", e));
        audioInitializedRef.current = true;
        console.log("Audio initialization complete!");
        return true;
    };

    useEffect(() => {
        const initAudioOnInteraction = () => {
            if (!audioInitializedRef.current) {
                initializeAudio();
            }
        };
        document.body.addEventListener('click', initAudioOnInteraction, { once: true });
        return () => {
            document.body.removeEventListener('click', initAudioOnInteraction);
        };
    }, []);

    const speak = async (text: string) => {
        if (!text) return;
        setIsSpeaking(true);
        setAnimationSrc('/static/talking.webp');

        if (recognitionRef.current && isListening) {
            try { recognitionRef.current.stop(); } catch (err) { console.error('Error stopping speech recognition:', err); }
        }

        try {
            const response = await fetch("/leila/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            if (!response.ok) throw new Error("TTS request failed");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            currentAudioRef.current = audio;
            audio.onended = () => {
                setIsSpeaking(false);
                setAnimationSrc('');
                if (recognitionRef.current && isListening) {
                    try { recognitionRef.current.start(); } catch (err) { console.error('Error restarting speech recognition after TTS:', err); }
                }
            };
            await audio.play();
        } catch (e) {
            console.error("TTS error:", e);
            setIsSpeaking(false);
            setAnimationSrc('');
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
            const response = await fetch('/leila/chat', {
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

    const handleMicClick = () => {
        if (!recognitionRef.current) return;

        if (!isListening) {
            if (!audioInitializedRef.current) {
                initializeAudio();
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
    };

    // Keyboard shortcut for Esc to end call/stop listening
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                }
                if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                    currentAudioRef.current.currentTime = 0;
                }
                setIsSpeaking(false);
                setAnimationSrc('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isListening]);

    const handleEnableAudio = () => {
        initializeAudio();
        const enableButton = document.getElementById('enable-audio');
        if (enableButton) {
            enableButton.textContent = "Audio Enabled!";
            enableButton.style.backgroundColor = "#4CAF50";
        }
        setTimeout(() => {
            setShowAudioPermission(false);
        }, 1500);
    };

    const handleTestAudio = () => {
        try {
            const testAudio = new Audio("https://cdn.freesound.org/previews/242/242758_4484625-lq.mp3");
            testAudio.volume = 1.0;
            const testButton = document.getElementById('test-audio');
            if (testButton) testButton.textContent = "Playing test...";
            testAudio.play()
                .then(() => {
                    if (testButton) {
                         testButton.textContent = "Audio Works! ✓";
                         testButton.style.backgroundColor = "#4CAF50";
                    }
                })
                .catch(error => {
                    console.error("Test audio error:", error);
                    if (testButton) {
                        testButton.textContent = "Audio Failed! Try again";
                        testButton.style.backgroundColor = "#F44336";
                    }
                });
        } catch (error) {
            console.error("Error setting up test audio:", error);
        }
    };

    return (
        <div className="container">
            <h1>Chat with Leila</h1>
            <div className="chat-container">
                <div id="animation-container" className="animation-container">
                    {animationSrc && <img id="animation" src={animationSrc} alt="Animation" className={animationSrc ? '' : 'hidden'} />}
                </div>
                <div id="chatbox" ref={chatboxRef} className="chatbox">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={msg.isUser ? 'user' : 'hailey'}>
                            {msg.isUser ? 'You' : 'Leila'}: {msg.text}
                        </div>
                    ))}
                </div>
            </div>
            {isLoading && (
                <div id="loading" className="loading">
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}
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