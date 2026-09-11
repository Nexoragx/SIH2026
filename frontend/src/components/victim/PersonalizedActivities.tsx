import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Wind,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Feather,
  Music,
  Smile,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sun,
  Activity,
  Layers,
  Square,
  Compass,
  Check,
  RefreshCw,
  Sliders,
  Eye,
  CheckCircle,
  X,
} from 'lucide-react';
import { AssessmentResultData } from '../../types';

export type ActivityId =
  | 'breathing'
  | 'box_breathing'
  | 'grounding'
  | 'journal'
  | 'muscle'
  | 'sounds'
  | 'emdr'
  | 'coherence'
  | 'metta';

interface PersonalizedActivitiesProps {
  currentLang: string;
  resultData: AssessmentResultData;
  onOpenCounsellorChat?: () => void;
  initialActivity?: string;
}

export const PersonalizedActivities: React.FC<PersonalizedActivitiesProps> = ({
  currentLang,
  resultData,
  onOpenCounsellorChat,
  initialActivity,
}) => {
  // Activity Selection State (strictly null by default so the 9-tile gallery is displayed without any auto popup)
  const [selectedActivity, setSelectedActivity] = useState<ActivityId | null>(null);

  useEffect(() => {
    if (initialActivity) {
      setSelectedActivity(initialActivity as ActivityId);
    } else {
      setSelectedActivity(null);
    }
  }, [initialActivity]);

  useEffect(() => {
    if (selectedActivity) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedActivity]);

  // Global Audio Context & Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundscapeNodesRef = useRef<{
    ctx: AudioContext;
    gain: GainNode;
    oscillators?: OscillatorNode[];
    noiseNode?: AudioNode;
    interval?: any;
  } | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  };

  // Procedural Sound Effects (Chimes, Droplets, Crystal Bells, Stereo Ticks)
  const playChime = (freq: number = 528, duration: number = 0.8, type: OscillatorType = 'sine') => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playStardustChime = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [528, 660, 792, 1056, 1320];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06 * volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        }, idx * 120);
      });
    } catch (e) {}
  };

  const playStereoTick = (pan: number = 0) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);

      gain.gain.setValueAtTime(0.05 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      if (panner) {
        panner.pan.setValueAtTime(pan, ctx.currentTime);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  // 1. 4-7-8 Breath Pacer State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState<number>(4);
  const [breathCycles, setBreathCycles] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev > 1) return prev - 1;
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            playChime(639, 0.6);
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            playChime(396, 0.9);
            return 8;
          } else {
            setBreathPhase('Inhale');
            playChime(528, 0.7);
            setBreathCycles((c) => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase, isMuted, volume]);

  // 2. Box Breathing (4-4-4-4) State
  const [isBoxActive, setIsBoxActive] = useState<boolean>(false);
  const [boxPhase, setBoxPhase] = useState<'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out'>('Inhale');
  const [boxTimer, setBoxTimer] = useState<number>(4);
  const [boxCycles, setBoxCycles] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isBoxActive) {
      interval = setInterval(() => {
        setBoxTimer((prev) => {
          if (prev > 1) return prev - 1;
          if (boxPhase === 'Inhale') {
            setBoxPhase('Hold In');
            playChime(587, 0.5);
            return 4;
          } else if (boxPhase === 'Hold In') {
            setBoxPhase('Exhale');
            playChime(440, 0.5);
            return 4;
          } else if (boxPhase === 'Exhale') {
            setBoxPhase('Hold Out');
            playChime(392, 0.5);
            return 4;
          } else {
            setBoxPhase('Inhale');
            playChime(528, 0.6);
            setBoxCycles((c) => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBoxActive, boxPhase, isMuted, volume]);

  // 3. Heart-Brain Coherence (5.5s Inhale / 5.5s Exhale) State
  const [isCoherenceActive, setIsCoherenceActive] = useState<boolean>(false);
  const [coherencePhase, setCoherencePhase] = useState<'Inhale' | 'Exhale'>('Inhale');
  const [coherenceProgress, setCoherenceProgress] = useState<number>(0); // 0 to 100
  const [coherenceCycles, setCoherenceCycles] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isCoherenceActive) {
      const stepMs = 50;
      const totalMs = 5500;
      interval = setInterval(() => {
        setCoherenceProgress((prev) => {
          const next = prev + (stepMs / totalMs) * 100;
          if (next >= 100) {
            setCoherencePhase((p) => {
              const nextPhase = p === 'Inhale' ? 'Exhale' : 'Inhale';
              playChime(nextPhase === 'Inhale' ? 528 : 432, 0.8);
              if (nextPhase === 'Inhale') {
                setCoherenceCycles((c) => c + 1);
              }
              return nextPhase;
            });
            return 0;
          }
          return next;
        });
      }, stepMs);
    }
    return () => clearInterval(interval);
  }, [isCoherenceActive, isMuted, volume]);

  // 4. Bilateral EMDR Visual & Audio Calmer State
  const [emdrActive, setEmdrActive] = useState<boolean>(false);
  const [emdrSpeed, setEmdrSpeed] = useState<'gentle' | 'standard' | 'focused'>('gentle');
  const [emdrPosition, setEmdrPosition] = useState<number>(50); // 0 to 100%

  useEffect(() => {
    let animFrame: number;
    let startTime = performance.now();
    const period = emdrSpeed === 'gentle' ? 3200 : emdrSpeed === 'standard' ? 2200 : 1500;
    let lastPanSide = 0;

    const animate = (time: number) => {
      if (emdrActive) {
        const elapsed = time - startTime;
        const progress = (Math.sin((elapsed / period) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        setEmdrPosition(progress * 100);

        // Trigger stereo sound near extremes
        const currentSide = progress > 0.85 ? 1 : progress < 0.15 ? -1 : 0;
        if (currentSide !== 0 && currentSide !== lastPanSide) {
          playStereoTick(currentSide);
          lastPanSide = currentSide;
        } else if (currentSide === 0) {
          lastPanSide = 0;
        }

        animFrame = requestAnimationFrame(animate);
      }
    };

    if (emdrActive) {
      animFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [emdrActive, emdrSpeed, isMuted, volume]);

  // 5. 5-4-3-2-1 Sensory Grounding State
  const [groundingChecks, setGroundingChecks] = useState<{ [key: string]: boolean }>({});
  const toggleGroundingCheck = (key: string) => {
    playChime(660 + Object.keys(groundingChecks).length * 40, 0.3, 'sine');
    setGroundingChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const resetGrounding = () => {
    setGroundingChecks({});
    playChime(440, 0.4);
  };

  // 6. Dissolving Thought Release Journal State & Stardust Particles
  const [heavyThought, setHeavyThought] = useState<string>('');
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [dissolved, setDissolved] = useState<boolean>(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string; delay: number; duration: number }>
  >([]);

  const handleReleaseThought = () => {
    if (!heavyThought.trim() || isDissolving) return;

    // Generate Stardust Particle Explosion
    const colors = ['#A855F7', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#818CF8', '#C084FC'];
    const newParticles = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 160 - 40,
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.4,
      duration: Math.random() * 1.2 + 1.2,
    }));

    setParticles(newParticles);
    setIsDissolving(true);
    playStardustChime();

    setTimeout(() => {
      setIsDissolving(false);
      setDissolved(true);
      setHeavyThought('');
      setParticles([]);
    }, 2200);
  };

  const affirmations = [
    'You are safe in this moment. The storm has passed and your peace is restoring.',
    'You do not have to carry everything by yourself. You are resilient and supported.',
    'With each breath, you release the past and invite healing light into your body.',
    'Your strength is dignified and quiet. Every step forward is a victory.',
    'You are surrounded by care, truth, and community protection.',
  ];
  const [currentAffirmationIdx, setCurrentAffirmationIdx] = useState<number>(0);

  // 7. Interactive Somatic Body Scan State
  const [selectedMuscleIndex, setSelectedMuscleIndex] = useState<number>(0);
  const muscleGroups = [
    {
      name: 'Forehead & Temples',
      icon: '🧠',
      tag: 'Cranial Ease',
      instruction: 'Smooth your eyebrow furrow. Soften your temples and allow your thoughts to slow down.',
      duration: '5s Hold',
    },
    {
      name: 'Jaw, Mouth & Neck',
      icon: '🗣️',
      tag: 'Verbal Release',
      instruction: 'Unclench your teeth. Let your tongue rest gently on the floor of your mouth, softening neck cords.',
      duration: '6s Hold',
    },
    {
      name: 'Shoulders & Upper Back',
      icon: '🛡️',
      tag: 'Burden Lifted',
      instruction: 'Draw your shoulders up towards your ears, hold the tension firmly, then let them drop completely down.',
      duration: '7s Release',
    },
    {
      name: 'Chest & Diaphragm',
      icon: '🫁',
      tag: 'Heart Expansion',
      instruction: 'Expand your ribs wide with a calm breath. Release any tightness stored around your heart center.',
      duration: '8s Deep Breath',
    },
    {
      name: 'Hands, Wrists & Arms',
      icon: '🤲',
      tag: 'Safe Rest',
      instruction: 'Squeeze both fists tightly, noticing the warm blood flow, then open your fingers wide in open surrender.',
      duration: '5s Unclench',
    },
    {
      name: 'Abdomen & Core',
      icon: '🌿',
      tag: 'Center of Calm',
      instruction: 'Allow your belly to soften like warm water. Let go of bracing or guarding.',
      duration: '6s Soften',
    },
    {
      name: 'Legs, Calves & Feet',
      icon: '👣',
      tag: 'Earth Connection',
      instruction: 'Feel your feet resting firmly on the earth beneath you. Notice the steady, unbreakable ground holding you.',
      duration: '8s Grounding',
    },
  ];

  // 8. Loving-Kindness (Metta) Pebble Sanctuary State
  const [mettaStep, setMettaStep] = useState<number>(0);
  const mettaAffirmations = [
    {
      target: 'To Yourself',
      icon: '🌱',
      text: 'May I be safe from harm. May I be healthy and strong. May I live with ease and profound peace.',
      color: 'pastel-mint',
    },
    {
      target: 'To a Cherished Loved One',
      icon: '🌸',
      text: 'May you be safe. May your heart find comfort. May courage guide your steps today and always.',
      color: 'pastel-peach',
    },
    {
      target: 'To All Fellow Survivors',
      icon: '🕊️',
      text: 'May every survivor find justice, healing, dignity, and restorative warmth.',
      color: 'pastel-lavender',
    },
    {
      target: 'To the World',
      icon: '☀️',
      text: 'May all beings everywhere be free from suffering and fear.',
      color: 'pastel-sun',
    },
  ];

  // 9. Procedural Ambient Soundscapes (Web Audio)
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);

  const stopSoundscape = () => {
    if (soundscapeNodesRef.current) {
      try {
        if (soundscapeNodesRef.current.oscillators) {
          soundscapeNodesRef.current.oscillators.forEach((osc) => {
            try { osc.stop(); } catch (e) {}
          });
        }
        if (soundscapeNodesRef.current.interval) {
          clearInterval(soundscapeNodesRef.current.interval);
        }
        soundscapeNodesRef.current.ctx.close();
      } catch (e) {}
      soundscapeNodesRef.current = null;
    }
    setActiveSoundId(null);
  };

  const startSoundscape = (id: string) => {
    stopSoundscape();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.18 * volume, ctx.currentTime);
      mainGain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];
      let interval: any = null;

      if (id === 'bowls') {
        // 432Hz Himalayan Singing Bowl Drone + Overtones + Gentle Pulse
        const baseFreq = 432;
        const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.75];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          // Subtle harmonic pulsing LFO
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.15 + idx * 0.05, ctx.currentTime);
          lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);
          lfo.connect(oscGain.gain);
          lfo.start();
          oscillators.push(lfo);

          oscGain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(mainGain);
          osc.start();
          oscillators.push(osc);
        });
      } else if (id === 'binaural') {
        // 432Hz + 438Hz = 6Hz Theta Healing Wave
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(216, ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(222, ctx.currentTime); // 6Hz difference

        gainL.gain.setValueAtTime(0.1, ctx.currentTime);
        gainR.gain.setValueAtTime(0.1, ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);
          oscL.connect(gainL);
          gainL.connect(pannerL);
          pannerL.connect(mainGain);

          oscR.connect(gainR);
          gainR.connect(pannerR);
          pannerR.connect(mainGain);
        } else {
          oscL.connect(gainL);
          gainL.connect(mainGain);
          oscR.connect(gainR);
          gainR.connect(mainGain);
        }

        oscL.start();
        oscR.start();
        oscillators.push(oscL, oscR);
      } else if (id === 'ocean' || id === 'rain') {
        // Procedural Pink Noise Buffer for Waves & Rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = id === 'ocean' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(id === 'ocean' ? 350 : 800, ctx.currentTime);

        if (id === 'ocean') {
          // LFO for periodic swell
          const swellLfo = ctx.createOscillator();
          const swellGain = ctx.createGain();
          swellLfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-sec ocean tidal swell
          swellGain.gain.setValueAtTime(250, ctx.currentTime);
          swellLfo.connect(swellGain);
          swellGain.connect(filter.frequency);
          swellLfo.start();
          oscillators.push(swellLfo);
        }

        whiteNoise.connect(filter);
        filter.connect(mainGain);
        whiteNoise.start();
      } else {
        // Forest birds & wind
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        oscillators.push(osc);

        interval = setInterval(() => {
          try {
            if (ctx.state === 'running') {
              const birdOsc = ctx.createOscillator();
              const birdGain = ctx.createGain();
              birdOsc.type = 'triangle';
              birdOsc.frequency.setValueAtTime(1800 + Math.random() * 800, ctx.currentTime);
              birdGain.gain.setValueAtTime(0.03 * volume, ctx.currentTime);
              birdGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
              birdOsc.connect(birdGain);
              birdGain.connect(mainGain);
              birdOsc.start();
              birdOsc.stop(ctx.currentTime + 0.3);
            }
          } catch (e) {}
        }, 3000);
      }

      soundscapeNodesRef.current = { ctx, gain: mainGain, oscillators, interval };
      setActiveSoundId(id);
    } catch (e) {
      setActiveSoundId(id);
    }
  };

  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  // Exercise Definitions Catalog for Tiles
  const exercisesCatalog: Array<{
    id: ActivityId;
    title: string;
    subtitle: string;
    category: string;
    icon: string;
    pastelClass: string;
    badgeColor: string;
    duration: string;
    description: string;
  }> = [
    {
      id: 'breathing',
      title: '4-7-8 Pranayama Breath',
      subtitle: 'Parasympathetic Nervous Calmer',
      category: 'Autonomic Calmer',
      icon: '🫁',
      pastelClass: 'pastel-mint',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      duration: '3–5 mins',
      description: 'Slow, rhythmic inhalation, gentle breath retention, and extended soothing exhalation to lower acute heart rate.',
    },
    {
      id: 'box_breathing',
      title: 'Box Breathing (4-4-4-4)',
      subtitle: 'Navy SEAL Tactical Focus',
      category: 'Nerve Reset',
      icon: '⏹️',
      pastelClass: 'pastel-sky',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      duration: '3 mins',
      description: 'Equal 4-phase geometric breathing to stabilize flight-or-fight adrenaline and center the mind.',
    },
    {
      id: 'journal',
      title: 'Thought Release & Stardust',
      subtitle: 'Cognitive Burden Dissolver',
      category: 'Trauma Release',
      icon: '✨',
      pastelClass: 'pastel-lavender',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      duration: '2 mins',
      description: 'Write down burdensome memories or fears and watch them dissolve into shimmering floating stardust particles.',
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Sensory Grounding',
      subtitle: 'Somatic Present-Moment Anchor',
      category: 'Somatic Anchor',
      icon: '🌿',
      pastelClass: 'pastel-emerald',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      duration: '4 mins',
      description: 'Engage all 5 physical senses sequentially to pull awareness away from panic flashbacks and back into safety.',
    },
    {
      id: 'emdr',
      title: 'Bilateral EMDR Visual Pacer',
      subtitle: 'Amygdala Desensitization Protocol',
      category: 'Neuro Calmer',
      icon: '👁️‍🗨️',
      pastelClass: 'pastel-indigo',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      duration: '3 mins',
      description: 'Follow the gliding light horizontally with your eyes while keeping your head still to down-regulate emotional triggers.',
    },
    {
      id: 'coherence',
      title: 'Heart-Brain Coherence (5.5s)',
      subtitle: 'Resonant Cardiovascular Balance',
      category: 'Bio-Resonance',
      icon: '❤️',
      pastelClass: 'pastel-rose',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      duration: '5 mins',
      description: 'Synchronizes your heart rate variability (HRV) with emotional calmness at the natural 0.1 Hz resonant rhythm.',
    },
    {
      id: 'muscle',
      title: 'Head-to-Toe Body Scan',
      subtitle: 'Progressive Somatic Tension Release',
      category: 'Physical Relaxation',
      icon: '🧘',
      pastelClass: 'pastel-peach',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      duration: '6 mins',
      description: 'Interactive anatomical map guiding you through contracting and releasing tension across 7 major muscle groups.',
    },
    {
      id: 'metta',
      title: 'Loving-Kindness Sanctuary',
      subtitle: 'Self-Compassion & Dignity Mantras',
      category: 'Emotional Warmth',
      icon: '☀️',
      pastelClass: 'pastel-sun',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      duration: '3 mins',
      description: 'Soothing affirmation pebbles that restore feelings of safety, self-worth, and profound human solidarity.',
    },
    {
      id: 'sounds',
      title: 'Therapeutic Soundscapes',
      subtitle: '432Hz Bowls, Rain & Theta Waves',
      category: 'Audio Healing',
      icon: '🎶',
      pastelClass: 'pastel-teal',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      duration: 'Continuous',
      description: 'Procedurally synthesized restorative sound frequencies, Himalayan singing bowls, and delta sleep rhythms.',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Audio Bar */}
      <div className="liquid-glass-panel rounded-3xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 text-white flex items-center justify-center text-2xl shadow-md">
            🧘
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Trauma-Informed Therapeutic Suite
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● 9 Evidence-Based Paced Tools
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Select any gentle exercise below to soothe physiological tension, steady your breath, and restore inner peace.
            </p>
          </div>
        </div>

        {/* Global Sound & Volume Controls */}
        <div className="flex items-center gap-3 self-end sm:self-center bg-slate-50/80 p-2 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isMuted ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-700 shadow-2xs'
            }`}
            title={isMuted ? 'Unmute procedural audio' : 'Mute procedural audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
            <span className="text-[11px] font-extrabold">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={volume}
            disabled={isMuted}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-indigo-600 cursor-pointer"
            title="Master Audio Volume"
          />
        </div>
      </div>

      {/* Grid of Interactive Pastel Glassmorphic Tiles (Launcher View) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercisesCatalog.map((ex) => {
          const isSelected = selectedActivity === ex.id;
          return (
            <div
              key={ex.id}
              onClick={() => {
                setSelectedActivity(ex.id);
                playChime(528, 0.3);
              }}
              className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden group flex flex-col justify-between border-2 ${
                isSelected
                  ? `${ex.pastelClass} border-indigo-500 shadow-xl scale-[1.02] ring-4 ring-indigo-200/50`
                  : `${ex.pastelClass} border-white/80 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1`
              }`}
            >
              {/* Subtle background ambient blob */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/40 blur-xl group-hover:scale-150 transition-all pointer-events-none"></div>

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {ex.icon}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${ex.badgeColor}`}>
                      {ex.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      ⏱️ {ex.duration}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-indigo-950 transition-colors">
                  {ex.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5 mb-2">
                  {ex.subtitle}
                </p>
                <p className="text-xs text-slate-600/90 leading-relaxed font-medium line-clamp-2">
                  {ex.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-indigo-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {isSelected ? '● Active Exercise' : 'Tap to Begin'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          TOP FLOATING MODAL OVERLAY FOR ACTIVE EXERCISE
          ======================================================== */}
      {selectedActivity &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedActivity(null);
                stopSoundscape();
              }
            }}
          >
            <div className="rounded-none sm:rounded-3xl max-w-3xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-white border-0 sm:border-2 border-indigo-200 shadow-2xl flex flex-col overflow-hidden animate-tile-come-up relative">
            {/* Top Floating Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/90">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {exercisesCatalog.find((e) => e.id === selectedActivity)?.icon || '🧘'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {exercisesCatalog.find((e) => e.id === selectedActivity)?.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      ⏱️ {exercisesCatalog.find((e) => e.id === selectedActivity)?.duration}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {exercisesCatalog.find((e) => e.id === selectedActivity)?.title}
                  </h3>
                </div>
              </div>

              {/* Quick Switch Dropdown + Cross Button */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
                <select
                  value={selectedActivity}
                  onChange={(e) => {
                    setSelectedActivity(e.target.value as ActivityId);
                    playChime(528, 0.3);
                  }}
                  aria-label="Switch Exercise"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer max-w-[130px] sm:max-w-[220px] truncate"
                >
                  {exercisesCatalog.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.icon} {ex.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedActivity(null);
                    stopSoundscape();
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition cursor-pointer flex-shrink-0 shadow-2xs"
                  title="Close Exercise"
                  aria-label="Close Exercise"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container with Smooth Scroll */}
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6 bg-white">

          {/* ========================================================
              EXERCISE 1: 4-7-8 Pranayama Breath Pacer
              ======================================================== */}
          {selectedActivity === 'breathing' && (
            <div className="text-center py-4 space-y-6">
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                Inhale gently through nose for <strong>4s</strong> • Hold with soft shoulders for <strong>7s</strong> • Exhale smoothly through mouth for <strong>8s</strong>.
              </p>

              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl relative ${
                    !isBreathingActive
                      ? 'bg-slate-50 border-4 border-slate-200'
                      : breathPhase === 'Inhale'
                      ? 'bg-teal-50 border-8 border-teal-400 scale-110 shadow-teal-400/40 ring-8 ring-teal-200/40'
                      : breathPhase === 'Hold'
                      ? 'bg-indigo-50 border-8 border-indigo-400 scale-110 shadow-indigo-400/40 ring-8 ring-indigo-200/40'
                      : 'bg-purple-50 border-4 border-purple-300 scale-95 shadow-purple-300/30'
                  }`}
                >
                  <span className="text-[11px] uppercase font-black tracking-widest text-slate-500 mb-1">
                    {!isBreathingActive ? 'Ready' : breathPhase}
                  </span>
                  <span className="text-5xl font-black text-slate-900 font-mono">
                    {!isBreathingActive ? '4-7-8' : `${breathTimer}s`}
                  </span>
                  <span className="text-[11px] text-slate-600 mt-2 font-bold px-3">
                    {!isBreathingActive
                      ? 'Press Start Pacer below'
                      : breathPhase === 'Inhale'
                      ? 'Inhale deep tranquility'
                      : breathPhase === 'Hold'
                      ? 'Hold calm & stillness'
                      : 'Exhale tension slowly'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBreathingActive(!isBreathingActive);
                      playChime(528, 0.4);
                    }}
                    className={`px-7 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition flex items-center gap-2 cursor-pointer ${
                      isBreathingActive
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                    }`}
                  >
                    {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isBreathingActive ? 'Pause Breath Pacer' : 'Start 4-7-8 Pacer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsBreathingActive(false);
                      setBreathTimer(4);
                      setBreathPhase('Inhale');
                      setBreathCycles(0);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Reset Cycle"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-500 mt-4 font-mono">
                  Completed Cycles: <span className="text-indigo-700 font-black">{breathCycles}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 2: Box Breathing (4-4-4-4)
              ======================================================== */}
          {selectedActivity === 'box_breathing' && (
            <div className="text-center py-4 space-y-6">
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                Inhale <strong>4s</strong> • Hold <strong>4s</strong> • Exhale <strong>4s</strong> • Hold <strong>4s</strong>. Used by emergency services and trauma responders for rapid physiological stabilization.
              </p>

              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={`w-52 h-52 rounded-3xl flex flex-col items-center justify-center transition-all duration-700 shadow-2xl relative border-4 ${
                    !isBoxActive
                      ? 'bg-slate-50 border-slate-200'
                      : boxPhase === 'Inhale'
                      ? 'bg-sky-50 border-sky-400 scale-105 shadow-sky-400/40 ring-4 ring-sky-200'
                      : boxPhase === 'Hold In'
                      ? 'bg-indigo-50 border-indigo-400 scale-105 shadow-indigo-400/40 ring-4 ring-indigo-200'
                      : boxPhase === 'Exhale'
                      ? 'bg-teal-50 border-teal-400 scale-95 shadow-teal-400/30'
                      : 'bg-amber-50 border-amber-400 scale-95 shadow-amber-400/30'
                  }`}
                >
                  <Square className="w-8 h-8 text-indigo-500/40 absolute top-4 right-4" />
                  <span className="text-[11px] uppercase font-black tracking-widest text-slate-500 mb-1">
                    {!isBoxActive ? 'Box Pacer' : boxPhase}
                  </span>
                  <span className="text-5xl font-black text-slate-900 font-mono">
                    {!isBoxActive ? '4×4' : `${boxTimer}s`}
                  </span>
                  <span className="text-[11px] text-slate-600 mt-2 font-bold px-3">
                    {!isBoxActive
                      ? 'Press Start below'
                      : boxPhase === 'Inhale'
                      ? '1. Inhale'
                      : boxPhase === 'Hold In'
                      ? '2. Hold with full lungs'
                      : boxPhase === 'Exhale'
                      ? '3. Exhale completely'
                      : '4. Hold empty stillness'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBoxActive(!isBoxActive);
                      playChime(528, 0.4);
                    }}
                    className={`px-7 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition flex items-center gap-2 cursor-pointer ${
                      isBoxActive
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                    }`}
                  >
                    {isBoxActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isBoxActive ? 'Pause Box Pacer' : 'Start Box Pacer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsBoxActive(false);
                      setBoxTimer(4);
                      setBoxPhase('Inhale');
                      setBoxCycles(0);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Reset Cycle"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-500 mt-4 font-mono">
                  Completed Box Cycles: <span className="text-sky-700 font-black">{boxCycles}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 3: Dissolving Thought Release & Stardust
              ======================================================== */}
          {selectedActivity === 'journal' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl pastel-lavender flex items-start gap-3">
                <Feather className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-900 font-medium leading-relaxed">
                  Write down any distressing memory, fear, unfairness, or emotional burden weighing on you. When you tap <strong>"Release into Light & Stardust"</strong>, watch it dissolve and dissipate into sparkling particles. <em>Nothing you type here is ever saved or sent anywhere.</em>
                </p>
              </div>

              <div className="relative">
                {/* Floating Stardust Particle Animation Layer */}
                {isDissolving && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-30">
                    {particles.map((p) => (
                      <div
                        key={p.id}
                        className="absolute rounded-full animate-stardust"
                        style={
                          {
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            boxShadow: `0 0 12px ${p.color}`,
                            '--tw-translate-x': `${p.x}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                          } as any
                        }
                      />
                    ))}
                    <div className="text-sm font-black text-purple-900 bg-white/95 px-5 py-2.5 rounded-2xl shadow-xl border border-purple-200 animate-pulse">
                      ✨ Dissolving burden into starlight...
                    </div>
                  </div>
                )}

                <textarea
                  value={heavyThought}
                  onChange={(e) => setHeavyThought(e.target.value)}
                  placeholder="Type freely here: What is feeling heavy, frightening, or exhausting right now?"
                  rows={4}
                  disabled={isDissolving}
                  className={`w-full p-4 rounded-2xl border-2 text-xs font-medium outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-1000 bg-white ${
                    isDissolving
                      ? 'opacity-0 scale-90 blur-md border-purple-400 bg-purple-50'
                      : 'border-slate-200 text-slate-900'
                  }`}
                />

                {dissolved && (
                  <div className="p-5 rounded-3xl pastel-mint border border-emerald-300 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                        Burden Released • Restorative Affirmation
                      </span>
                    </div>
                    <p className="text-sm font-black text-emerald-950 leading-relaxed italic">
                      "{affirmations[currentAffirmationIdx]}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDissolved(false);
                        setCurrentAffirmationIdx((prev) => (prev + 1) % affirmations.length);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Release Another Thought
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setHeavyThought('')}
                    disabled={isDissolving || !heavyThought.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleReleaseThought}
                    disabled={!heavyThought.trim() || isDissolving}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isDissolving ? 'Dissolving...' : 'Release into Light & Stardust'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 4: 5-4-3-2-1 Sensory Grounding Checklist
              ======================================================== */}
          {selectedActivity === 'grounding' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl pastel-emerald">
                <div>
                  <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                    Somatic Sensory Orientation
                  </h4>
                  <p className="text-xs text-teal-800 font-medium">
                    Tap each item as you notice it around you in the room right now.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-teal-900 font-mono">
                    {Object.values(groundingChecks).filter(Boolean).length} / 5 Done
                  </span>
                  <button
                    type="button"
                    onClick={resetGrounding}
                    className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-teal-900 transition shadow-xs cursor-pointer"
                    title="Reset Grounding"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 's5', num: '5', label: 'Look around and notice 5 things you can SEE (e.g. wall color, light switch, shoes, tree outside, your hand)', icon: '👁️', color: 'border-indigo-200' },
                  { id: 's4', num: '4', label: 'Touch and physically feel 4 textures (e.g. fabric of your shirt, cool phone screen, table grain, chair seat)', icon: '✋', color: 'border-teal-200' },
                  { id: 's3', num: '3', label: 'Listen carefully and identify 3 sounds (e.g. ceiling fan hum, distant vehicle, your own breathing)', icon: '👂', color: 'border-purple-200' },
                  { id: 's2', num: '2', label: 'Notice 2 aromas or scents you can SMELL in the space (or smell your wrist / fresh air)', icon: '👃', color: 'border-amber-200' },
                  { id: 's1', num: '1', label: 'Notice 1 TASTE in your mouth (or take a slow, conscious sip of drinking water)', icon: '👅', color: 'border-rose-200' },
                ].map((item) => {
                  const isChecked = groundingChecks[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleGroundingCheck(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 scale-[1.01] shadow-xs'
                          : `bg-white/80 hover:bg-white hover:border-indigo-400 ${item.color}`
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-700 mr-2">
                            STEP {item.num}
                          </span>
                          <p className={`text-xs font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>
                            {item.label}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all border ${
                          isChecked ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-sm' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 5: Bilateral EMDR Visual & Audio Pacer
              ======================================================== */}
          {selectedActivity === 'emdr' && (
            <div className="space-y-6 text-center">
              <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto">
                Keep your head completely still and gently follow the luminous orb from left to right. Left-right bilateral eye movements soothe the amygdala threat center.
              </p>

              {/* EMDR Moving Track */}
              <div className="relative h-28 sm:h-32 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 flex items-center px-6 shadow-inner">
                <div className="w-full relative h-10 flex items-center">
                  <div
                    className="absolute w-10 h-10 rounded-full bg-gradient-to-r from-teal-300 via-indigo-400 to-purple-400 shadow-xl shadow-teal-400/60 flex items-center justify-center transition-all"
                    style={{ left: `calc(${emdrPosition}% - 20px)` }}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              {/* EMDR Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmdrActive(!emdrActive);
                    playChime(528, 0.4);
                  }}
                  className={`px-7 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg ${
                    emdrActive
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                  }`}
                >
                  {emdrActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{emdrActive ? 'Pause EMDR' : 'Start Bilateral Pacer'}</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
                  {(['gentle', 'standard', 'focused'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setEmdrSpeed(spd)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black capitalize transition cursor-pointer ${
                        emdrSpeed === spd ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 6: Heart-Brain Coherence (5.5s / 5.5s)
              ======================================================== */}
          {selectedActivity === 'coherence' && (
            <div className="text-center py-4 space-y-6">
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                Breathe in for <strong>5.5 seconds</strong> and breathe out for <strong>5.5 seconds</strong>. This creates maximum Heart Rate Variability (HRV) coherence and cardiovascular balance.
              </p>

              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative border-4 ${
                    !isCoherenceActive
                      ? 'bg-rose-50/50 border-rose-200'
                      : coherencePhase === 'Inhale'
                      ? 'bg-rose-50 border-rose-400 scale-110 shadow-rose-400/40 ring-8 ring-rose-200/50'
                      : 'bg-purple-50 border-purple-400 scale-95 shadow-purple-400/30'
                  }`}
                >
                  <Heart
                    className={`w-12 h-12 text-rose-500 transition-transform ${
                      isCoherenceActive ? 'animate-heart-pulse' : ''
                    }`}
                  />
                  <span className="text-[11px] uppercase font-black tracking-widest text-slate-500 mt-2 mb-1">
                    {!isCoherenceActive ? 'Heart-Brain Sync' : coherencePhase}
                  </span>
                  <span className="text-2xl font-black text-rose-950 font-mono">
                    {!isCoherenceActive ? '5.5s' : coherencePhase === 'Inhale' ? 'Expanding' : 'Softening'}
                  </span>
                  <div className="w-24 h-1.5 bg-rose-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-75"
                      style={{ width: `${coherenceProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCoherenceActive(!isCoherenceActive);
                      playChime(528, 0.4);
                    }}
                    className={`px-7 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition flex items-center gap-2 cursor-pointer ${
                      isCoherenceActive
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    }`}
                  >
                    {isCoherenceActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isCoherenceActive ? 'Pause Coherence' : 'Start Coherence Sync'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCoherenceActive(false);
                      setCoherenceProgress(0);
                      setCoherenceCycles(0);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Reset Cycle"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-500 mt-4 font-mono">
                  Completed Coherence Cycles: <span className="text-rose-700 font-black">{coherenceCycles}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 7: Head-to-Toe Somatic Body Scan
              ======================================================== */}
          {selectedActivity === 'muscle' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Anatomical Region Buttons List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Select Somatic Zone
                  </span>
                  {muscleGroups.map((mg, idx) => {
                    const isCurrent = selectedMuscleIndex === idx;
                    return (
                      <button
                        key={mg.name}
                        type="button"
                        onClick={() => {
                          setSelectedMuscleIndex(idx);
                          playChime(440 + idx * 30, 0.25);
                        }}
                        className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer border ${
                          isCurrent
                            ? 'pastel-peach border-amber-400 font-black text-amber-950 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span>{mg.icon}</span>
                          <span>{mg.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{mg.duration}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Region Instruction & Guidance Panel */}
                <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl pastel-peach border border-amber-200 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300">
                        {muscleGroups[selectedMuscleIndex].tag}
                      </span>
                      <span className="text-xs font-mono font-black text-amber-900">
                        Step {selectedMuscleIndex + 1} of {muscleGroups.length}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 mt-2">
                      {muscleGroups[selectedMuscleIndex].icon} {muscleGroups[selectedMuscleIndex].name}
                    </h4>

                    <p className="text-sm font-bold text-slate-800 leading-relaxed mt-3">
                      {muscleGroups[selectedMuscleIndex].instruction}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-amber-200/70">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMuscleIndex((p) => Math.max(0, p - 1));
                        playChime(480, 0.25);
                      }}
                      disabled={selectedMuscleIndex === 0}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 shadow-2xs cursor-pointer"
                    >
                      ← Previous Zone
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMuscleIndex((p) => (p + 1) % muscleGroups.length);
                        playChime(540, 0.3);
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-md cursor-pointer"
                    >
                      Next Somatic Zone →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 8: Loving-Kindness (Metta) Pebble Sanctuary
              ======================================================== */}
          {selectedActivity === 'metta' && (
            <div className="space-y-6 text-center">
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                Metta meditations foster feelings of personal dignity, mutual goodwill, and gentle inner safety.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mettaAffirmations.map((m, idx) => {
                  const isCurrent = mettaStep === idx;
                  return (
                    <div
                      key={m.target}
                      onClick={() => {
                        setMettaStep(idx);
                        playChime(528 + idx * 40, 0.4);
                      }}
                      className={`p-6 rounded-3xl transition-all cursor-pointer text-left border-2 flex flex-col justify-between ${
                        isCurrent
                          ? `${m.color} border-indigo-500 scale-[1.02] shadow-lg ring-4 ring-indigo-200/50`
                          : `${m.color} border-white/90 hover:border-indigo-300 opacity-90`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{m.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white/70 px-2.5 py-0.5 rounded-full">
                            {m.target}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-900 leading-relaxed italic">
                          "{m.text}"
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span>Breathe in tenderness</span>
                        {isCurrent && <CheckCircle className="w-4 h-4 text-indigo-700" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              EXERCISE 9: Therapeutic Ambient Soundscapes (Web Audio)
              ======================================================== */}
          {selectedActivity === 'sounds' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl pastel-teal flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                    Procedural Sound Synthesis
                  </h4>
                  <p className="text-xs text-teal-800 font-medium">
                    Continuous offline audio synthesizer. No files to download.
                  </p>
                </div>
                {activeSoundId && (
                  <button
                    type="button"
                    onClick={stopSoundscape}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 transition cursor-pointer"
                  >
                    Stop Sound
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'bowls', title: 'Himalayan Singing Bowls', desc: '432Hz deep resonant overtone drone', icon: '🔔', color: 'pastel-sun' },
                  { id: 'binaural', title: '6Hz Theta Healing Waves', desc: 'Bilateral neurological calm & sleep induction', icon: '🧠', color: 'pastel-lavender' },
                  { id: 'ocean', title: 'Calm Ocean Tidal Waves', desc: '12-second rhythmic tidal swell', icon: '🌊', color: 'pastel-sky' },
                  { id: 'rain', title: 'Gentle Monsoon Pink Noise', desc: 'Soothing rain frequencies on leaves', icon: '🌧️', color: 'pastel-teal' },
                ].map((snd) => {
                  const isPlaying = activeSoundId === snd.id;
                  return (
                    <div
                      key={snd.id}
                      className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${
                        isPlaying
                          ? `${snd.color} border-indigo-500 shadow-lg scale-[1.02]`
                          : `${snd.color} border-white hover:border-indigo-300`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{snd.icon}</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{snd.title}</h4>
                          <p className="text-[11px] text-slate-600 font-medium">{snd.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => (isPlaying ? stopSoundscape() : startSoundscape(snd.id))}
                        className={`p-3 rounded-2xl transition shadow-md cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-600 text-white shadow-rose-600/30'
                            : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

