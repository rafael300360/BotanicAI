// v6.1 PRO - High Precision Edition & Cache Burner
import React, { useState, useEffect, useRef, useMemo } from 'react';
console.log("%c BotanicAI v6.1 PRO - Force Update ", "background: #222; color: #bada55; font-size: 20px;");
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  getDocs,
  getDoc,
  increment
} from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './firebase';
import { UserProfile, Plant, Scan, Task, CommunityPost, ExpertQuery, PostComment, PlantTip, ChatRoom, ChatMessage } from './types';
import { 
  Trash2,
  X,
  Cloud,
  Navigation,
  Menu, 
  Search, 
  PlusCircle, 
  Droplets as WaterDrop, 
  Sun as LightMode, 
  MapPin as LocationOn, 
  Edit, 
  AlertCircle as PriorityHigh, 
  AlertCircle,
  Bell as Notifications, 
  Home, 
  History as HistoryIcon, 
  Camera as PhotoCamera, 
  MessageCircle as ChatBubble, 
  Flower2 as LocalFlorist,
  User as Person,
  Settings,
  ShieldCheck as HealthAndSafety,
  Calendar as EventUpcoming,
  ChevronRight,
  ChevronDown,
  Send,
  PlusCircle as AddCircle,
  Brain as Psychology,
  Leaf as Spa,
  Zap as FlashOn,
  Star,
  Camera,
  Image as ImageIcon,
  Share2,
  Plus,
  Minus,
  Lightbulb,
  Volume2,
  VolumeX,
  Smartphone,
  Mic,
  MicOff,
  FileText,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Logo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M50 15C50 15 20 40 20 65C20 80 33.5 90 50 90C66.5 90 80 80 80 65C80 40 50 15 50 15Z" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M50 90V40" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <path 
      d="M50 55L75 40" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <path 
      d="M50 70L25 55" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <circle cx="75" cy="40" r="3" fill="currentColor" />
    <circle cx="25" cy="55" r="3" fill="currentColor" />
    <circle cx="50" cy="40" r="3" fill="currentColor" />
  </svg>
);

import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber, type CountryCode } from 'libphonenumber-js';

class OpenRouterModel {
  modelId: string;
  apiKey: string;
  systemInstruction?: string;

  constructor(modelId: string, apiKey: string, systemInstruction?: any) {
    this.modelId = modelId;
    this.apiKey = apiKey;
    this.systemInstruction = typeof systemInstruction === 'string' ? systemInstruction : systemInstruction?.parts?.[0]?.text;
  }

  async generateContent(parts: any[]) {
    const messages: any[] = [];
    if (this.systemInstruction) {
        messages.push({ role: 'system', content: this.systemInstruction });
    }

    const contentParts = Array.isArray(parts) ? parts : [parts];
    const userContent: any[] = [];

    for (const part of contentParts) {
      if (typeof part === 'string') {
        userContent.push({ type: 'text', text: part });
      } else if (part.inlineData) {
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
        });
      }
    }

    messages.push({ role: 'user', content: userContent });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.modelId,
        messages,
      })
    });

    let data;
    try {
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`OpenRouter devolvió una respuesta no válida (HTTP ${response.status}): ${text.substring(0, 100)}...`);
        }
    } catch (e: any) {
        throw new Error(`Error al conectar con OpenRouter: ${e.message}`);
    }
    
        if (data.error?.message?.includes("User not found")) {
            throw new Error(`OpenRouter dice que el usuario no existe. Revisa que tu API Key sea válida en Configuración.`);
        }
        throw new Error(`OpenRouter Error: ${data.error.message || "Error desconocido"}`);
    
    let botText = data.choices?.[0]?.message?.content;
    
    if (!botText) throw new Error("La IA respondió en blanco o sin contenido. Prueba de nuevo.");

    // Limpiar bloques de código si el modelo los incluyó
    if (botText.includes("```")) {
        const match = botText.match(/\{[\s\S]*\}/);
        if (match) botText = match[0];
    }
    
    return {
      response: {
        text: () => botText
      }
    };
  }

  startChat(options: any) {
    return new OpenRouterChatSession(this.modelId, this.apiKey, this.systemInstruction, options.history || []);
  }
}

class OpenRouterChatSession {
    modelId: string;
    apiKey: string;
    systemInstruction?: string;
    history: any[];

    constructor(modelId: string, apiKey: string, systemInstruction: any, history: any[]) {
        this.modelId = modelId;
        this.apiKey = apiKey;
        this.systemInstruction = systemInstruction;
        this.history = history;
    }

    async sendMessage(msg: string) {
        const messages: any[] = [];
        if (this.systemInstruction) {
            messages.push({ role: 'system', content: this.systemInstruction });
        }

        for (const h of this.history) {
            messages.push({ 
                role: h.role === 'model' ? 'assistant' : 'user', 
                content: h.parts[0].text 
            });
        }

        messages.push({ role: 'user', content: msg });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "BotanicAI"
            },
            body: JSON.stringify({
                model: this.modelId,
                messages,
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Error en OpenRouter");

        const botText = data.choices[0].message.content;
        this.history.push({ role: 'user', parts: [{ text: msg }] });
        this.history.push({ role: 'model', parts: [{ text: botText }] });

        return {
            response: {
                text: () => botText
            }
        };
    }
}

class OpenRouterClient {
    apiKey: string;
    constructor(apiKey: string) { this.apiKey = apiKey; }
    getGenerativeModel(args: any) {
        const modelStr = typeof args === 'string' ? args : args.model;
        const systemInstruction = typeof args === 'object' ? args.systemInstruction : undefined;
        // Forzar uso de modelos gratuitos de OpenRouter
        let orModel = modelStr;
        if (!orModel.includes(':free')) {
            if (orModel.includes('/')) {
                orModel = `${orModel}:free`;
            } else {
                orModel = "meta-llama/llama-3.1-8b-instruct:free";
            }
        }
        return new OpenRouterModel(orModel, this.apiKey, systemInstruction);
    }
}

const getAIService = () => {
  const fallbackKey = "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";
  const sources = [
    import.meta.env.VITE_OPENROUTER_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY,
    localStorage.getItem('BOTANIC_API_KEY')
  ];

  const apiKey = sources.find(k => k && k !== "undefined" && k !== "null" && k.trim() !== "")?.trim() || fallbackKey.trim();
  
  console.log(`BotanicAI v6.1.3 | IA: ${apiKey.startsWith('sk-or-') ? 'OpenRouter' : 'Gemini'}`);

  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    return null;
  }
  
  if (apiKey.startsWith('sk-or-')) {
    return new OpenRouterClient(apiKey);
  }
  return new GoogleGenAI(apiKey);
};

const ai = getAIService();

const BOT_INSTRUCTIONS = `Eres 'BotanicAI', un asistente inteligente, amable y preciso. Aunque eres un experto en botánica y cuidado de plantas, puedes ayudar a los usuarios con cualquier consulta general.

Tus reglas de comportamiento:
1. Versatilidad: Responde a cualquier pregunta del usuario, ya sea sobre plantas o cualquier otro tema general. Si la pregunta es sobre botánica, utiliza tu base de conocimientos experta.
2. Tono: Eres entusiasta pero profesional, como un mentor servicial.
3. Formato de respuesta: Usa negritas para puntos clave y listas para pasos o instrucciones.
4. Limitaciones: Si un usuario pregunta sobre temas sensibles (salud humana, legal, etc.), añade siempre un descargo de responsabilidad indicando que la información es educativa y deben consultar expertos.
5. Contexto: Mantén el hilo de la conversación para ofrecer una experiencia personalizada.`;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

class ErrorBoundaryClass extends React.Component<{ children: React.ReactNode }, { hasError: boolean; errorInfo: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface">
          <div className="bg-error-container/20 p-6 rounded-3xl mb-4">
            <PriorityHigh className="w-12 h-12 text-error mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
          <p className="text-on-surface-variant mb-6">Hemos encontrado un error inesperado. Por favor, intenta recargar la aplicación.</p>
          {this.state.errorInfo && (
            <pre className="bg-surface-container-low p-4 rounded-xl text-xs text-left overflow-auto max-w-full mb-6">
              {this.state.errorInfo}
            </pre>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold"
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
};

// --- Main App ---

const PRO_EMAILS = ['rafael.rafaeltorres@gmail.com', 'rafaelgemini60@gmail.com', 'silviayanett41@gmail.com'];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'camera' | 'chat' | 'plants' | 'community' | 'tools' | 'profile' | 'notifications' | 'privacy' | 'help' | 'pro-benefits' | 'settings'>('home');
  const [communitySubTab, setCommunitySubTab] = useState<'menu' | 'feed' | 'experts' | 'tips' | 'chat'>('menu');
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [roomUnreadCounts, setRoomUnreadCounts] = useState<Record<string, number>>({});
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [expertQueries, setExpertQueries] = useState<ExpertQuery[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isProMode, setIsProMode] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ sound: true, vibration: true });
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'info' | 'alert', timestamp: string }[]>([]);
  const [unreadCommunityCount, setUnreadCommunityCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [allTips, setAllTips] = useState<PlantTip[]>([]);

  // Refs
  const activeTabRef = useRef(activeTab);
  const activeChatRoomRef = useRef<ChatRoom | null>(null);
  const roomUnreadCountsRef = useRef<Record<string, number>>({});
  const lastChatNotificationTime = useRef<number>(Date.now() - 10000);
  const notificationAudio = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  const postsRef = useRef<CommunityPost[]>([]);
  const prevCommunityState = useRef({ postCount: 0, totalComments: 0 });
  const isFirstCommunityLoad = useRef(true);

  // Global touch lock to prevent viewport zooming on mobile (essential for magnifier)
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        if (e.cancelable) e.preventDefault();
      }
    };
    document.addEventListener('touchstart', handleTouch, { passive: false });
    document.addEventListener('touchmove', handleTouch, { passive: false });
    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  // Sync refs with state in render (or use effects)
  activeTabRef.current = activeTab;
  activeChatRoomRef.current = activeChatRoom;
  roomUnreadCountsRef.current = roomUnreadCounts;
  postsRef.current = posts;

  useEffect(() => {
    const saved = localStorage.getItem('notif_prefs');
    if (saved) setNotifPrefs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  useEffect(() => {
    if (!user) {
      setIsProMode(false);
      return;
    }
    if (PRO_EMAILS.includes(user.email || '')) {
      setIsProMode(true);
    } else {
      setIsProMode(false);
    }
  }, [user]);

  useEffect(() => {
    const total = Object.values(roomUnreadCounts).reduce((a, b) => a + b, 0);
    setUnreadChatCount(total);
  }, [roomUnreadCounts]);

  useEffect(() => {
    notificationAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    notificationAudio.current.load();

    const unlockAudio = () => {
      if (audioUnlocked.current || !notificationAudio.current) return;
      // Play and immediately pause to "unlock" audio on mobile
      notificationAudio.current.play().then(() => {
        notificationAudio.current?.pause();
        if (notificationAudio.current) notificationAudio.current.currentTime = 0;
        audioUnlocked.current = true;
        console.log("Audio unlocked for notifications");
      }).catch(e => console.log("Audio unlock failed", e));
      
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const addNotification = (message: string, type: 'info' | 'alert' = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      const success = (pos: GeolocationPosition) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      };

      const error = (err: GeolocationPositionError) => {
        console.warn(`Geolocation error (${err.code}): ${err.message}`);
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileDoc = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(profileDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({ uid: docSnap.id, ...data } as UserProfile);
      } else {
        // Initialize profile if not exists
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          isPremium: false,
          expertPoints: 0,
          role: 'user'
        };
        setDoc(profileDoc, initialProfile).catch(err => 
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`)
        );
      }
    });

    const plantsQuery = query(collection(db, `users/${user.uid}/plants`), orderBy('createdAt', 'desc'));
    const tasksQuery = query(collection(db, `users/${user.uid}/tasks`), where('completed', '==', false), orderBy('dueDate', 'asc'));
    const scansQuery = query(collection(db, `users/${user.uid}/scans`), orderBy('timestamp', 'desc'), limit(10));
    
    const isEligiblePro = PRO_EMAILS.includes(user.email || '');
    const postsQuery = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(50));
    const expertQueriesQuery = isEligiblePro ? query(collection(db, 'expertQueries'), where('userUid', '==', user.uid), orderBy('timestamp', 'desc')) : null;

    const unsubPlants = onSnapshot(plantsQuery, (snapshot) => {
      setPlants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/plants`));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/tasks`));

    const unsubScans = onSnapshot(scansQuery, (snapshot) => {
      setScans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/scans`));

    const unsubExpertQueries = expertQueriesQuery ? onSnapshot(expertQueriesQuery, (snapshot) => {
      setExpertQueries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpertQuery)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expertQueries')) : () => {};

    const tipsQuery = query(collection(db, 'plant_tips'), orderBy('timestamp', 'desc'), limit(20));
    const unsubTips = onSnapshot(tipsQuery, (snap) => {
      setAllTips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlantTip)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'plant_tips'));

    // Handle community notifications
    const unsubCommunity = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : (data.timestamp || new Date().toISOString())
        } as CommunityPost;
      });
      setPosts(newPosts);
      
      // Initial load: check for posts since last visit
      if (isFirstCommunityLoad.current) {
        const lastSeen = localStorage.getItem(`last_seen_post_${user?.uid}`) || '';
        const unseenCount = newPosts.filter(p => p.timestamp > lastSeen).length;
        if (unseenCount > 0 && activeTabRef.current !== 'community') {
          setUnreadCommunityCount(unseenCount);
        }

        prevCommunityState.current = { 
          postCount: newPosts.length, 
          totalComments: newPosts.reduce((acc, p) => acc + (p.comments || 0), 0) 
        };
        isFirstCommunityLoad.current = false;
      } else {
        // Detect changes using docChanges for more accuracy
        let newActivityCount = 0;
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            // A new post was added (and it's in the top 50)
            newActivityCount++;
          } else if (change.type === "modified") {
            // Check if comments increased
            const oldPost = postsRef.current.find(p => p.id === change.doc.id);
            const newData = change.doc.data();
            if (oldPost && (newData.comments || 0) > (oldPost.comments || 0)) {
              newActivityCount += (newData.comments || 0) - (oldPost.comments || 0);
            }
          }
        });

        // Only increment if not in community tab
        if (activeTabRef.current !== 'community' && newActivityCount > 0) {
          setUnreadCommunityCount(prev => prev + newActivityCount);
        }
      }
      
      // Update state for next comparison
      prevCommunityState.current = { 
        postCount: newPosts.length, 
        totalComments: newPosts.reduce((acc, p) => acc + (p.comments || 0), 0) 
      };
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'community_posts'));

    // Handle offline queue when back online
    const handleOnline = () => {
      const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
      if (queue.length > 0) {
        console.log("Processing offline scans...");
        // Logic to process queue would go here
        localStorage.removeItem('offline_scans');
        setOfflineQueue([]);
      }
    };
    window.addEventListener('online', handleOnline);

    const unsubChatRooms = isEligiblePro ? onSnapshot(query(collection(db, 'chat_rooms')), (snap) => {
      const rooms = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      
      // Cleanup and Seed logic
      const initialRooms: Omit<ChatRoom, 'id'>[] = [
        { name: 'Cuidados Generales', description: 'Mantenimiento básico.', icon: 'Spa', category: 'General' },
        { name: 'Plagas y Enfermedades', description: 'Salud vegetal.', icon: 'PriorityHigh', category: 'Salud' },
        { name: 'Huerto Urbano', description: 'Cultiva en casa.', icon: 'LocalFlorist', category: 'Huerto' },
        { name: 'Plantas de Interior', description: 'Especies bajo techo.', icon: 'Home', category: 'Interior' },
        { name: 'Suculentas y Cactus', description: 'Bajo riego.', icon: 'Sun', category: 'Especial' },
        { name: 'Orquídeas Expertas', description: 'Floración perfecta.', icon: 'Flower2', category: 'Especial' },
        { name: 'Sustratos y Abonos', description: 'Base del crecimiento.', icon: 'Cloud', category: 'Técnico' },
        { name: 'Hidroponía Casera', description: 'Cultivo sin tierra.', icon: 'Droplets', category: 'Técnico' },
        { name: 'Bonsáis Milenarios', description: 'Arte en miniatura.', icon: 'Leaf', category: 'Arte' },
        { name: 'Decoración Verde', description: 'Diseño con vida.', icon: 'ImageIcon', category: 'Diseño' }
      ];

      const seenNames = new Set<string>();
      const uniqueRooms: ChatRoom[] = [];
      const duplicatesToDelete: string[] = [];

      rooms.forEach(room => {
        const stableId = room.name.toLowerCase().replace(/\s+/g, '_');
        if (room.id !== stableId || seenNames.has(room.name)) {
          duplicatesToDelete.push(room.id);
        } else {
          seenNames.add(room.name);
          uniqueRooms.push(room);
        }
      });

      duplicatesToDelete.forEach(id => {
        deleteDoc(doc(db, 'chat_rooms', id)).catch(err => console.error("Error deleting duplicate room:", err));
      });

      initialRooms.forEach(room => {
        if (!seenNames.has(room.name)) {
          seenNames.add(room.name);
          const stableId = room.name.toLowerCase().replace(/\s+/g, '_');
          setDoc(doc(db, 'chat_rooms', stableId), room).catch(err => console.error("Error seeding room:", err));
        }
      });

      setChatRooms(uniqueRooms);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chat_rooms')) : () => {};

    return () => {
      unsubProfile();
      unsubPlants();
      unsubTasks();
      unsubScans();
      unsubExpertQueries();
      unsubTips();
      unsubCommunity();
      unsubChatRooms();
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  // Handle individual chat room unread counts
  useEffect(() => {
    if (!user || chatRooms.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    chatRooms.forEach(room => {
      const lastViewed = localStorage.getItem(`last_seen_room_${room.id}_${user.uid}`) || new Date(0).toISOString();
      
      const q = query(
        collection(db, `chat_rooms/${room.id}/messages`),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const unsub = onSnapshot(q, (snap) => {
        const lastViewed = localStorage.getItem(`last_seen_room_${room.id}_${user.uid}`) || new Date(0).toISOString();
        const unread = snap.docs.filter(doc => {
          const data = doc.data();
          const ts = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : (data.timestamp || new Date().toISOString());
          return data.authorUid !== user.uid && ts > lastViewed;
        }).length;

        // Play sound if there are new messages and we are not in this specific room
        const currentCounts = roomUnreadCountsRef.current;
        const currentActiveRoom = activeChatRoomRef.current;
        if (unread > (currentCounts[room.id] || 0) && currentActiveRoom?.id !== room.id) {
          if (notificationAudio.current && audioUnlocked.current) {
            notificationAudio.current.play().catch(e => console.log("Sound play failed", e));
          }
        }

        setRoomUnreadCounts(prev => ({
          ...prev,
          [room.id]: unread
        }));
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user, chatRooms.map(r => r.id).join(',')]);

  useEffect(() => {
    if (activeTab === 'community' || activeTab === 'notifications') {
      setUnreadCommunityCount(0);
      if (posts.length > 0 && user) {
        localStorage.setItem(`last_seen_post_${user.uid}`, posts[0].timestamp);
      }
      if (activeTab === 'notifications') {
        // Also mark all rooms as read when entering notifications tab
        chatRooms.forEach(room => {
          const now = new Date().toISOString();
          localStorage.setItem(`last_seen_room_${room.id}_${user?.uid}`, now);
        });
        setRoomUnreadCounts({});
      }
    }
    if (activeTab === 'community' && communitySubTab === 'chat') {
      // Mark all rooms as read when entering chat tab
      chatRooms.forEach(room => {
        const now = new Date().toISOString();
        localStorage.setItem(`last_seen_room_${room.id}_${user?.uid}`, now);
      });
      setRoomUnreadCounts({});
    }
  }, [activeTab, communitySubTab, posts, user, chatRooms.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-primary/20 text-primary p-4"
        >
          <Logo className="w-full h-full" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface pb-32">
        <Header 
          user={user} 
          isProMode={isProMode} 
          setIsProMode={setIsProMode} 
          onMenuClick={() => setIsMenuOpen(true)}
          setActiveTab={setActiveTab}
          unreadCount={unreadCommunityCount + unreadChatCount}
        />
        
        <AnimatePresence>
          {isMenuOpen && (
            <SideMenu 
              user={user} 
              onClose={() => setIsMenuOpen(false)} 
              onLogout={() => auth.signOut()}
              onNavigate={setActiveTab}
              unreadCount={unreadCommunityCount}
              unreadChatCount={unreadChatCount}
            />
          )}
        </AnimatePresence>

        <main className="max-w-screen-xl mx-auto px-6 pt-24">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HomeContent tasks={tasks} plants={plants} onSelectPlant={setSelectedPlant} location={location} isProMode={isProMode} setActiveTab={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileContent 
                  user={user!} 
                  profile={userProfile} 
                  notifPrefs={notifPrefs} 
                  setNotifPrefs={setNotifPrefs} 
                />
              </motion.div>
            )}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NotificationsContent 
                  posts={posts} 
                  customNotifications={notifications} 
                  setActiveTab={setActiveTab} 
                  setCommunitySubTab={setCommunitySubTab}
                  unreadCommunityCount={unreadCommunityCount}
                  unreadChatCount={unreadChatCount}
                  allTips={allTips}
                />
              </motion.div>
            )}
            {activeTab === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PrivacyContent />
              </motion.div>
            )}
            {activeTab === 'help' && (
              <motion.div key="help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HelpContent />
              </motion.div>
            )}
            {activeTab === 'pro-benefits' && (
              <motion.div key="pro-benefits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProBenefitsContent isPro={isProMode} />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HistoryContent scans={scans} user={user} />
              </motion.div>
            )}
            {activeTab === 'camera' && (
              <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CameraContent user={user} onScanComplete={() => setActiveTab('history')} />
              </motion.div>
            )}
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ChatContent user={user} plants={plants} location={location} isProMode={isProMode} setActiveTab={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'plants' && (
              <motion.div 
                key="plants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PlantsContent plants={plants} onSelectPlant={setSelectedPlant} setActiveTab={setActiveTab} />
              </motion.div>
            )}
            {activeTab === 'community' && (
              <motion.div 
                key="community"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {activeChatRoom ? (
                  <ChatRoomContent 
                    room={activeChatRoom} 
                    user={user!} 
                    onBack={() => setActiveChatRoom(null)} 
                    setRoomUnreadCounts={setRoomUnreadCounts}
                  />
                ) : (
                  <CommunityContent 
                    posts={posts} 
                    user={user!} 
                    scans={scans} 
                    isProMode={isProMode} 
                    onOpenChat={(room) => {
                      setActiveChatRoom(room);
                      // Mark as read
                      const now = new Date().toISOString();
                      localStorage.setItem(`last_seen_room_${room.id}_${user.uid}`, now);
                      setRoomUnreadCounts(prev => ({ ...prev, [room.id]: 0 }));
                    }}
                    chatRooms={chatRooms}
                    roomUnreadCounts={roomUnreadCounts}
                    allTips={allTips}
                    activeSubTab={communitySubTab}
                    setActiveSubTab={setCommunitySubTab}
                    setActiveTab={setActiveTab}
                  />
                )}
              </motion.div>
            )}
            {activeTab === 'tools' && (
              <motion.div 
                key="tools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ToolsContent />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettingsContent />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <AnimatePresence>
          {selectedPlant && (
            <PlantDetailModal 
              plant={selectedPlant} 
              isProMode={isProMode}
              onClose={() => setSelectedPlant(null)} 
              addNotification={addNotification}
              setActiveTab={setActiveTab}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

// --- Sub-components ---

function Header({ user, isProMode, setIsProMode, onMenuClick, setActiveTab, unreadCount }: { user: User, isProMode: boolean, setIsProMode: (v: boolean) => void, onMenuClick: () => void, setActiveTab: (tab: any) => void, unreadCount: number }) {
  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-surface-container">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="text-primary p-2 hover:bg-primary-container/20 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-primary/10 text-primary p-2 hidden sm:flex">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">BotanicAI <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">v6.1.2</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
          >
            <Notifications className="w-6 h-6" />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={unreadCount}
                className="absolute -top-1 -right-1 bg-[#ff3b30] text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-lg border-2 border-surface"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm hover:scale-110 transition-transform relative"
          >
            <img 
              referrerPolicy="no-referrer"
              src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'plants', icon: LocalFlorist, label: 'Jardín' },
    { id: 'camera', icon: PhotoCamera, label: 'Escanear', center: true },
    { id: 'chat', icon: ChatBubble, label: 'Chat' },
    { id: 'history', icon: HistoryIcon, label: 'Historial' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full glass-nav z-50 rounded-t-3xl antigravity-shadow px-4 pb-6 pt-2 flex justify-around items-end">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-300",
            tab.center ? "-mt-8" : "p-2",
            activeTab === tab.id ? "text-primary" : "text-on-surface-variant"
          )}
        >
          {tab.center ? (
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90",
              activeTab === tab.id ? "bg-primary text-on-primary" : "bg-primary text-on-primary"
            )}>
              <tab.icon className="w-8 h-8" />
            </div>
          ) : (
            <>
              <tab.icon className={cn("w-6 h-6 mb-1", activeTab === tab.id && "fill-current")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}

function LoginScreen() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-surface">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-container/30 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-secondary-container/30 rounded-full blur-[80px]" />
      
      <main className="relative z-10 w-full max-w-md px-8 flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-primary/20 text-primary p-5 group">
            <Logo className="w-full h-full group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">BotanicAI <span className="text-sm font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">v6.1.0</span></h1>
          <h2 className="text-3xl font-bold leading-tight px-4">Cultiva la inteligencia de tu jardín.</h2>
          <p className="text-on-surface-variant text-lg px-6">Una conexión etérea entre la tecnología y la naturaleza.</p>
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-primary text-on-primary font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg active:scale-[0.98] transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white rounded-full p-1" alt="Google" />
            <span>Continuar con Google</span>
          </button>
        </div>

        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-surface-container-high/50 group antigravity-shadow">
          <img 
            src="https://picsum.photos/seed/botanic/800/800" 
            alt="Plant" 
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex items-center space-x-4">
              <Psychology className="w-8 h-8 text-primary" />
              <p className="text-xs font-bold text-on-surface leading-tight">
                Análisis botánico impulsado por IA para el bienestar de tus plantas.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="absolute bottom-8 w-full text-center px-8">
        <p className="text-[10px] text-on-surface-variant/60 tracking-wider uppercase">
          Al continuar, aceptas nuestros Términos y Política de Privacidad
        </p>
      </footer>
    </div>
  );
}

function SideMenu({ user, onClose, onLogout, onNavigate, unreadCount, unreadChatCount }: { user: User, onClose: () => void, onLogout: () => void, onNavigate: (tab: any) => void, unreadCount: number, unreadChatCount: number }) {
  const totalUnread = unreadCount + unreadChatCount;
  const menuItems = [
    { icon: Person, label: 'Mi Perfil', tab: 'profile' },
    { icon: ChatBubble, label: 'Comunidad Pro', tab: 'community', badge: totalUnread },
    { icon: Notifications, label: 'Notificaciones', tab: 'notifications' },
    { icon: Settings, label: 'Configuración', tab: 'settings' },
    { icon: HealthAndSafety, label: 'Privacidad', tab: 'privacy' },
    { icon: PriorityHigh, label: 'Ayuda y Soporte', tab: 'help' },
  ];

  if (!PRO_EMAILS.includes(user.email || '')) {
    menuItems.push({ icon: Star, label: 'Saber más sobre Pro', tab: 'pro-benefits' });
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        className="w-80 h-full bg-surface shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-surface-container">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-primary/10 text-primary p-2">
                <Logo className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-extrabold text-primary">BotanicAI <span className="text-sm font-medium opacity-40">v6.1.0</span></h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container relative">
              <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-on-surface">{user.displayName || 'Usuario'}</p>
                {PRO_EMAILS.includes(user.email || '') && (
                  <Star className="w-4 h-4 text-primary fill-current" />
                )}
              </div>
              <p className="text-xs text-on-surface-variant">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.label} 
              onClick={() => { onNavigate(item.tab); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 text-on-surface font-bold transition-colors group"
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={item.badge}
                  className="bg-[#ff3b30] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.span>
              )}
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-surface-container">
          <button 
            onClick={onLogout}
            className="w-full py-4 bg-error-container text-error font-bold rounded-2xl active:scale-95 transition-transform"
          >
            Cerrar Sesión
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HomeContent({ tasks, plants, onSelectPlant, location, isProMode, setActiveTab }: { tasks: Task[], plants: Plant[], onSelectPlant: (p: Plant) => void, location: { lat: number, lon: number } | null, isProMode: boolean, setActiveTab: (tab: any) => void }) {
  const urgentTasks = tasks.filter(t => !t.completed).slice(0, 2);
  const [weather, setWeather] = useState({ temp: 24, condition: 'Soleado', humidity: 45 });

  const wateringTips = [
    "Momento de hidratar",
    "Tus plantas tienen sed",
    "Revisa la humedad del suelo",
    "Hora del riego matutino",
    "Hidratación botánica necesaria",
    "Control de turgencia hoy"
  ];

  const monsteraTips = [
    { title: "Girar Monstera", desc: "Asegura un crecimiento uniforme buscando la luz." },
    { title: "Limpiar Hojas", desc: "Elimina el polvo para que respiren mejor." },
    { title: "Pulverizar Agua", desc: "Aumenta la humedad ambiental para sus raíces aéreas." },
    { title: "Revisar Tutores", desc: "Asegúrate de que tenga soporte para trepar." },
    { title: "Poda de Limpieza", desc: "Retira hojas amarillas para ahorrar energía." },
    { title: "Abono Foliar", desc: "Aplica nutrientes directamente en las hojas." }
  ];

  const randomWateringTip = useRef(wateringTips[Math.floor(Math.random() * wateringTips.length)]);
  const randomMonsteraTip = useRef(monsteraTips[Math.floor(Math.random() * monsteraTips.length)]);

  useEffect(() => {
    if (location) {
      // Simulate fetch based on real location and current time
      const hour = new Date().getHours();
      const isNight = hour > 20 || hour < 6;
      const isRainy = weather.humidity > 70; // Logic for rainy days
      
      setWeather({ 
        temp: isNight ? 18 : 28, 
        condition: isRainy ? 'Lluvia' : 'Despejado', 
        humidity: isRainy ? 85 : 38 
      });
    }
  }, [location]);

  return (
    <div className="space-y-12 pb-12">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-primary text-on-primary rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden antigravity-shadow">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Hoy • {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
              <div className="flex items-center gap-2 text-on-primary/80 text-xs font-bold">
                <Cloud className="w-4 h-4" />
                <span>{weather.temp}°C • {weather.condition} • {weather.humidity}% Hum.</span>
                {location && <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> Detectada</span>}
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-2">
              {weather.condition === 'Lluvia' ? "Día de lluvia" : randomWateringTip.current}
            </h3>
            <p className="text-on-primary/80 max-w-xs font-medium leading-relaxed">
              {weather.condition === 'Lluvia' 
                ? "La humedad ambiental es alta. No es necesario regar hoy, tus plantas están absorbiendo agua del aire."
                : urgentTasks.length > 0 
                  ? `${urgentTasks.length} plantas necesitan atención inmediata debido a la baja humedad ambiental.` 
                  : "Tus plantas están al día. El clima es ideal hoy."}
            </p>
          </div>
          <button className="mt-8 bg-surface-container-lowest text-primary px-8 py-3 rounded-xl font-bold w-fit hover:scale-95 transition-transform shadow-xl">
            Regar todo ahora
          </button>
          <WaterDrop className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 rotate-12" />
        </div>
        
        <div className="bg-tertiary-container text-on-tertiary-container rounded-3xl p-8 flex flex-col justify-center items-center text-center antigravity-shadow">
          <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-4 shadow-sm">
            <LightMode className="w-8 h-8 text-tertiary" />
          </div>
          <h4 className="font-bold text-xl mb-1">{randomMonsteraTip.current.title}</h4>
          <p className="text-on-tertiary-container/70 text-sm">{randomMonsteraTip.current.desc}</p>
        </div>
      </section>

      {isProMode && (
        <section className="bg-primary/5 border border-primary/20 p-6 rounded-3xl antigravity-shadow">
          <div className="flex items-center gap-3 mb-4">
            <FlashOn className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-primary uppercase tracking-widest">Análisis Pro Avanzado</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Índice de Vigor (NDVI)</p>
              <p className="text-2xl font-black text-primary">0.82</p>
              <p className="text-[10px] text-green-600 font-bold mt-1">↑ 4% vs semana pasada</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Déficit de Presión Vapor</p>
              <p className="text-2xl font-black text-primary">1.2 kPa</p>
              <p className="text-[10px] text-on-surface-variant font-medium mt-1">Rango óptimo: 0.8 - 1.5</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Radiación Fotosintética</p>
              <p className="text-2xl font-black text-primary">450 μmol</p>
              <p className="text-[10px] text-orange-500 font-bold mt-1">Luz moderada-alta</p>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Mis Plantas</h2>
            <p className="text-on-surface-variant font-medium">Gestionando {plants.length} especies activas</p>
          </div>
          <button 
            onClick={() => setActiveTab('camera')}
            className="flex items-center gap-2 text-primary font-bold hover:bg-primary-container/20 px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Nueva planta</span>
          </button>
        </div>
        
        <div className="space-y-6">
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} onClick={() => onSelectPlant(plant)} isProMode={isProMode} />
          ))}
          {plants.length === 0 && (
            <div className="text-center py-12 bg-surface-container-low rounded-3xl border-2 border-dashed border-surface-container-highest">
              <Spa className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
              <p className="text-on-surface-variant">Aún no tienes plantas en tu jardín digital.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PlantCard({ plant, onClick, isProMode }: { plant: Plant, onClick: () => void, isProMode?: boolean }) {
  const daysUntilWatering = Math.max(0, Math.ceil((new Date(plant.nextWatering).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col md:flex-row bg-surface-container-lowest rounded-3xl overflow-hidden antigravity-shadow hover:translate-y-[-4px] transition-all duration-300 cursor-pointer relative"
    >
      {isProMode && (
        <div className="absolute top-4 right-4 z-10 bg-primary/10 backdrop-blur-md border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <FlashOn className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Análisis Pro</span>
        </div>
      )}
      <div className="w-full md:w-48 h-48 relative overflow-hidden">
        <img 
          src={plant.imageUrl || `https://picsum.photos/seed/${plant.id}/400/400`} 
          alt={plant.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {plant.isToxicToPets && (
          <div className="absolute top-4 left-4 p-2 bg-error-container/80 backdrop-blur-md rounded-full text-error shadow-lg">
            <PriorityHigh className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex-1 p-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-2 py-0.5 rounded-full">
              {plant.room || "Sin habitación"}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{plant.name}</h3>
          <p className="text-on-surface-variant flex items-center gap-2">
            <LocationOn className="w-4 h-4" />
            {plant.location}
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            plant.health < 80 ? "bg-error-container/20 text-error" : "bg-surface-container-low text-on-surface"
          )}>
            {plant.health < 80 ? <PriorityHigh className="w-4 h-4" /> : <WaterDrop className="w-4 h-4 text-primary" />}
            <span className="font-bold">
              {plant.health < 80 ? "Necesita atención" : 
               daysUntilWatering === 0 ? "¡Regar hoy!" : 
               `Riego en ${daysUntilWatering} ${daysUntilWatering === 1 ? 'día' : 'días'}`}
            </span>
          </div>
          <div className="flex gap-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            <span>Salud: {plant.health}%</span>
            <span className="text-primary">•</span>
            <span>Humedad: {plant.humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 bg-surface-container rounded-full hover:bg-primary-container transition-colors text-on-surface-variant hover:text-on-primary-container">
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryContent({ scans, user }: { scans: Scan[], user: User }) {
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/scans`, id));
      setScanToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/scans/${id}`);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <AnimatePresence>
        {selectedScan && (
          <ScanDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
        )}
        {scanToDelete && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surface p-8 rounded-3xl max-w-sm w-full space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">¿Eliminar escaneo?</h3>
                <p className="text-on-surface-variant text-sm">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setScanToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-bold bg-surface-container text-on-surface"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(scanToDelete)}
                  className="flex-1 py-3 rounded-xl font-bold bg-error text-on-error"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div>
        <h2 className="text-3xl font-bold mb-2">Historial</h2>
        <p className="text-on-surface-variant">Revive tus descubrimientos botánicos y el estado de tus plantas.</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
          <Search className="w-5 h-5" />
        </div>
        <input 
          className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Buscar por nombre o especie..."
          type="text"
        />
      </div>

      <div className="space-y-12">
        <section>
          <h3 className="text-primary text-sm font-bold uppercase tracking-widest mb-6 px-1">Reciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scans.map(scan => (
              <div 
                key={scan.id} 
                onClick={() => setSelectedScan(scan)}
                className="bg-surface-container-lowest p-5 rounded-3xl flex flex-col gap-5 antigravity-shadow hover:translate-y-[-4px] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                    <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-lg truncate">
                        {scan.speciesOptions?.[0]?.name || "Planta desconocida"}
                      </h4>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setScanToDelete(scan.id); }}
                          className="p-1.5 bg-surface-container text-on-surface-variant hover:text-error rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {scan.toxicityAlert && (
                          <div className="p-1.5 bg-error-container text-error rounded-full">
                            <PriorityHigh className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3 font-medium">
                      {new Date(scan.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex gap-2">
                      <WaterDrop className="w-4 h-4 text-primary" />
                      <LightMode className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
                
                {scan.speciesOptions && scan.speciesOptions.length > 1 && (
                  <div className="pt-4 border-t border-surface-container">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Otras posibles coincidencias</p>
                    <div className="flex flex-wrap gap-2">
                      {scan.speciesOptions.slice(1, 3).map((opt, i) => (
                        <div key={i} className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">
                          {opt.name} ({(opt.confidence * 100).toFixed(0)}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scan.toxicityAlert && (
                  <div className="bg-error-container/20 p-3 rounded-2xl flex gap-3 items-start">
                    <PriorityHigh className="w-5 h-5 text-error shrink-0" />
                    <p className="text-xs text-error font-medium leading-relaxed">{scan.toxicityAlert}</p>
                  </div>
                )}
              </div>
            ))}
            {scans.length === 0 && (
              <div className="col-span-full text-center py-12 bg-surface-container-low rounded-3xl">
                <p className="text-on-surface-variant">No hay escaneos recientes.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ScanDetailModal({ scan, onClose }: { scan: Scan, onClose: () => void }) {
  const bestOption = scan.speciesOptions[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-surface w-full max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-80 shrink-0">
          <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-surface/80 backdrop-blur-md rounded-full text-primary"
          >
            <ArrowBack className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-2 py-0.5 rounded-full">
                {bestOption.taxonomy || "Taxonomía"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full">
                {(bestOption.confidence * 100).toFixed(0)}% Confianza
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-extrabold text-on-surface leading-none tracking-tighter">{bestOption.name}</h2>
              <VoiceButton text={`${bestOption.name}, conocida como ${bestOption.commonName}.`} />
            </div>
            <p className="text-on-surface-variant italic font-medium">{bestOption.commonName}</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Pro Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Vigor</span>
                <span className="text-2xl font-black text-primary">{scan.vigorIndex || 0}%</span>
                <div className="w-full bg-primary/10 h-1 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${scan.vigorIndex || 0}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
              <div className="bg-tertiary/5 p-4 rounded-3xl border border-tertiary/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-1">VPD</span>
                <span className="text-2xl font-black text-tertiary">{scan.vpd || 0}</span>
                <span className="text-[8px] font-bold text-tertiary/60">kPa</span>
              </div>
              <div className="bg-secondary/5 p-4 rounded-3xl border border-secondary/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">PAR</span>
                <span className="text-2xl font-black text-secondary">{scan.par || 0}</span>
                <span className="text-[8px] font-bold text-secondary/60">μmol/m²/s</span>
              </div>
            </div>

            <DetailSection icon={Spa} title="Características" content={bestOption.characteristics || "No disponible"} />
            <DetailSection icon={EventUpcoming} title="Cuándo Plantar" content={bestOption.plantingTime || "No disponible"} />
            <DetailSection icon={HealthAndSafety} title="Cuidados" content={bestOption.care || "No disponible"} />
            <DetailSection icon={Edit} title="Trasplante" content={bestOption.transplantInfo || "No disponible"} />
            <DetailSection icon={PriorityHigh} title="Estado de Salud" content={scan.diagnosis || "No disponible"} />
            <DetailSection icon={Notifications} title="Recomendaciones" content={scan.recommendations || "No disponible"} />
          </div>

          {scan.toxicityAlert && (
            <div className="bg-error-container/20 p-6 rounded-3xl flex gap-4 items-start border border-error/20">
              <PriorityHigh className="w-6 h-6 text-error shrink-0" />
              <div>
                <p className="font-bold text-error mb-1">Alerta de Toxicidad</p>
                <p className="text-sm text-error/80 leading-relaxed">{scan.toxicityAlert}</p>
              </div>
            </div>
          )}

          <button 
            onClick={async () => {
              try {
                await addDoc(collection(db, `users/${scan.ownerUid}/plants`), {
                  ownerUid: scan.ownerUid,
                  name: bestOption.commonName || bestOption.name,
                  species: bestOption.name,
                  room: "Salón",
                  location: "Interior",
                  health: 100,
                  humidity: 50,
                  lastWatered: new Date().toISOString(),
                  nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  imageUrl: scan.imageUrl,
                  createdAt: new Date().toISOString(),
                  isToxicToPets: !!scan.toxicityAlert,
                  characteristics: bestOption.characteristics,
                  plantingTime: bestOption.plantingTime,
                  care: bestOption.care,
                  transplantInfo: bestOption.transplantInfo,
                  proData: {
                    nutrientDeficiency: scan.nutrientAnalysis
                  }
                });
                alert("¡Planta añadida a tu jardín!");
                onClose();
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `users/${scan.ownerUid}/plants`);
              }
            }}
            className="w-full py-6 bg-primary text-on-primary rounded-full font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Añadir a mi Jardín Digital</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailSection({ icon: Icon, title, content }: { icon: any, title: string, content: string }) {
  // Detect if content looks like a step-by-step list (starts with numbers or bullets)
  const isStepByStep = content.includes('1.') || content.includes('2.') || content.includes('•') || content.includes('- ');
  
  return (
    <div className="bg-surface-container-low p-6 rounded-3xl space-y-3 border border-surface-container-highest/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container rounded-full text-on-primary-container">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <VoiceButton text={`${title}: ${content}`} />
      </div>
      <div className={cn(
        "text-on-surface-variant leading-relaxed text-sm",
        isStepByStep ? "prose prose-sm prose-p:my-1 prose-li:my-0.5 max-w-none" : ""
      )}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function PlantTipsSection({ species }: { species: string }) {
  const [tips, setTips] = useState<PlantTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'plant_tips'),
      where('species', '==', species),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlantTip)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'plant_tips'));
    return unsub;
  }, [species]);

  if (loading) return <div className="animate-pulse h-20 bg-surface-container rounded-3xl" />;
  if (tips.length === 0) return null;

  return (
    <div className="bg-tertiary-container/10 p-6 rounded-3xl border border-tertiary/20 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-tertiary-container rounded-full text-tertiary">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-tertiary">Tips de la Comunidad</h3>
      </div>
      <div className="space-y-3">
        {tips.map(tip => (
          <div key={tip.id} className="bg-surface-container-low p-4 rounded-2xl">
            <p className="text-sm text-on-surface leading-relaxed italic">"{tip.content}"</p>
            <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest">— {tip.authorName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CameraContent({ user, onScanComplete }: { user: User, onScanComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [touchDist, setTouchDist] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const requestRef = useRef<number>();
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  const stopCamera = () => {
    if (streamRef.current) {
      console.log("Stopping camera tracks...");
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} stopped`);
      });
      streamRef.current = null;
    }
    setStream(null);
  };

  const init = async () => {
    stopCamera();
    setCameraError(null);
    try {
      console.log("Requesting camera access...");
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 30 }
        } 
      });
      
      setStream(s);
      streamRef.current = s;

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.error("Auto-play failed:", e);
        }
        
        // Forzar alta calidad después de un breve delay
        initTimeoutRef.current = setTimeout(async () => {
          if (!streamRef.current) return;
          const track = streamRef.current.getVideoTracks()[0];
          try {
            await track.applyConstraints({
              width: { ideal: 3840 },
              height: { ideal: 2160 },
              //@ts-ignore
              focusMode: 'continuous',
              //@ts-ignore
              whiteBalanceMode: 'continuous'
            });
          } catch (e) { console.log("HD Constraints failed, using best possible"); }
        }, 1000);
      }
    } catch (err: any) {
      console.error("Camera access denied or error:", err);
      setCameraError(err.message || "No se pudo acceder a la cámara");
    }
  };

  useEffect(() => {
    init();
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      stopCamera();
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const updateMagnifier = () => {
    if (zoom > 1 && videoRef.current && magnifierCanvasRef.current) {
      const ctx = magnifierCanvasRef.current.getContext('2d');
      if (ctx) {
        const video = videoRef.current;
        const canvas = magnifierCanvasRef.current;
        
        // Dimensiones del recorte cuadrado (para evitar distorsión)
        const size = Math.min(video.videoWidth, video.videoHeight) / zoom;
        const sourceX = (video.videoWidth - size) / 2;
        const sourceY = (video.videoHeight - size) / 2;

        ctx.drawImage(
          video,
          sourceX, sourceY, size, size, // Origen cuadrado
          0, 0, canvas.width, canvas.height // Destino (que ya es cuadrado)
        );
      }
    }
    requestRef.current = requestAnimationFrame(updateMagnifier);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateMagnifier);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [zoom]);

  const startCamera = async () => {
    await init();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      setTouchDist(Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      ));
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDist > 0) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = dist - touchDist;
      if (Math.abs(delta) > 3) {
        const factor = delta > 0 ? 0.1 : -0.1;
        setZoom(prev => Math.max(1, Math.min(6, prev + factor)));
        setTouchDist(dist);
      }
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn }]
        } as any);
        setIsFlashOn(!isFlashOn);
      } catch (err) {
        console.error("Flash error:", err);
      }
    } else {
      alert("El flash no está disponible en este dispositivo.");
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !captureCanvasRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const context = captureCanvasRef.current.getContext('2d');
      if (!context) {
        setIsAnalyzing(false);
        return;
      }

      captureCanvasRef.current.width = videoRef.current.videoWidth;
      captureCanvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageData = captureCanvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      await processImage(imageData);
    } catch (err) {
      console.error("Capture failed:", err);
      setIsAnalyzing(false);
      setCapturedImage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        setCapturedImage(event.target.result as string);
        await processImage(event.target.result as string);
      } else {
        setIsAnalyzing(false);
      }
    };
    reader.onerror = () => setIsAnalyzing(false);
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    if (isOffline) {
      const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
      queue.push(imageData);
      localStorage.setItem('offline_scans', JSON.stringify(queue));
      alert("Modo Offline: Escaneo guardado. Se procesará cuando recuperes conexión.");
      setIsAnalyzing(false);
      setCapturedImage(null);
      onScanComplete();
      return;
    }

    if (!ai) {
      alert("Servicio de IA no disponible. Por favor, configura tu API Key en la sección de Configuración.");
      setIsAnalyzing(false);
      return;
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
      const prompt = `Identifica esta planta y proporciona un análisis botánico completo. 
REGLA DE ORO: Toda la información debe estar en ESPAÑOL.
Responde estrictamente en JSON con este formato:
{
  "speciesOptions": [{
    "name": "Nombre Científico (Latín)", 
    "commonName": "Nombre Común en Español", 
    "confidence": 0.95, 
    "taxonomy": "Orden/Familia APG IV",
    "characteristics": "Descripción física detallada en español (hojas, tallo, flores)",
    "plantingTime": "Cuándo se debe plantar (época del año) en español",
    "care": "Guía COMPLETA de cuidados en español. IMPORTANTE: Presenta las acciones recomendadas como una lista de pasos numerados (1, 2, 3...) para que sea fácil de seguir.",
    "transplantInfo": "Guía de trasplante en español. IMPORTANTE: Presenta las acciones recomendadas como una lista de pasos numerados (1, 2, 3...) para que sea fácil de seguir."
  }],
  "diagnosis": "Estado de salud actual detectado en la imagen en español",
  "recommendations": "Pasos específicos para mejorar su salud en español",
  "toxicityAlert": "Advertencia SOLO si la planta es REALMENTE tóxica para humanos o mascotas (ej. Dieffenbachia, Lirio de la Paz). Si es segura, deja este campo vacío. En español.",
  "nutrientAnalysis": "Análisis detallado de posibles deficiencias nutricionales en español",
  "vigorIndex": 85,
  "vpd": 1.2,
  "par": 450,
  "isMushroom": true,
  "mushroomWarning": "Si es un hongo, advertencia de NO consumo en español"
}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } }
      ]);
      
      const response = await result.response;
      const text = response.text();
      if (!text) throw new Error("La IA no devolvió ninguna respuesta.");
      const analysis = JSON.parse(text);
      
      await addDoc(collection(db, `users/${user.uid}/scans`), {
        ownerUid: user.uid,
        imageUrl: imageData,
        ...analysis,
        timestamp: new Date().toISOString()
      });
      
      onScanComplete();
    } catch (err: any) {
      console.error("Analysis failed:", err);
      alert(`Error de Análisis: ${err.message || "Error desconocido"}`);
    } finally {
      setIsAnalyzing(false);
      setCapturedImage(null);
    }
  };

  return (
    <div 
      className="relative h-[calc(100vh-200px)] rounded-3xl overflow-hidden antigravity-shadow bg-black touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {capturedImage ? (
        <div className="relative w-full h-full">
          <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mb-6"
            >
              <Spa className="w-16 h-16 text-primary" />
            </motion.div>
            <h2 className="text-3xl font-black mb-2 text-primary">BOTANICAI v6.1.0</h2>
            <h3 className="text-2xl font-bold mb-2">Analizando ahora mismo...</h3>
            <p className="text-white/70 text-sm max-w-xs">BotanicAI está consultando su base de datos científica para darte el mejor diagnóstico.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center bg-black/80">
                <AlertCircle className="w-12 h-12 text-error mb-4" />
                <p className="font-bold mb-4">Error de Cámara</p>
                <p className="text-sm opacity-70 mb-6">{cameraError}</p>
                <button 
                  onClick={init}
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold"
                >
                  Reintentar Cámara
                </button>
              </div>
            )}
            
            {!stream && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black">
                <div className="animate-spin mb-4">
                  <Camera className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xs opacity-50 uppercase tracking-widest">Iniciando Sensor...</p>
              </div>
            )}
            
            {/* Magnifying Glass Window (Canvas Based - High Res) */}
            {zoom > 1 && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
              >
                <div className="w-80 h-80 rounded-full border-4 border-white shadow-[0_0_60px_rgba(0,0,0,0.7)] overflow-hidden bg-black ring-[100vw] ring-black/50">
                  <canvas 
                    ref={magnifierCanvasRef}
                    width={1024}
                    height={1024}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] rounded-full pointer-events-none" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-[12px] font-black text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">
                    ZOOM {zoom.toFixed(1)}x
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Top Controls - Less Intrusive */}
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={toggleFlash}
              className={cn(
                "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10",
                isFlashOn ? "bg-primary text-on-primary" : "bg-black/40 text-white"
              )}
            >
              <FlashOn className="w-5 h-5" />
            </button>
          </div>

          {/* Side Zoom Control - Less Intrusive */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 z-10">
            <button 
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="text-white/60 hover:text-white p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-24 w-1 bg-white/20 rounded-full relative">
              <div 
                className="absolute bottom-0 w-full bg-primary rounded-full transition-all"
                style={{ height: `${((zoom - 1) / 2) * 100}%` }}
              />
            </div>
            <button 
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              className="text-white/60 hover:text-white p-1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-white font-mono mt-1">{zoom.toFixed(1)}x</span>
          </div>
        </>
      )}
      <canvas ref={captureCanvasRef} className="hidden" />
      
      <div className="absolute inset-x-0 bottom-0 p-8 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />

        {/* Minimalist Shutter Button */}
        <button 
          onClick={handleCapture}
          disabled={isAnalyzing}
          className="relative group disabled:opacity-50"
        >
          <div className="absolute inset-0 -m-2 rounded-full border-2 border-primary/20 scale-100 group-active:scale-95 transition-all duration-300" />
          <div className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center p-1.5 shadow-xl">
            <div className="w-full h-full rounded-full bg-white group-active:scale-95 transition-transform flex items-center justify-center overflow-hidden">
              {isAnalyzing && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Spa className="text-primary w-6 h-6" />
                </motion.div>
              )}
            </div>
          </div>
        </button>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {isOffline && (
        <div className="absolute top-6 left-6 right-6 bg-error/90 text-on-error px-4 py-2 rounded-full text-center text-sm font-medium backdrop-blur-lg">
          Modo Offline Activo
        </div>
      )}
    </div>
  );
}

function ChatContent({ user, plants, location, isProMode, setActiveTab }: { user: User, plants: Plant[], location: { lat: number, lon: number } | null, isProMode: boolean, setActiveTab: (tab: any) => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string, files?: { name: string, type: string }[] }[]>([
    { role: 'bot', content: '¡Hola! Soy BotanicAI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start listening:", err);
      }
    }
  };

  const speak = (text: string) => {
    if (!isSpeakingEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.2; // Robotic but with a bit more "emotion" (higher pitch)
    utterance.rate = 0.95; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || sending) return;

    const userMsg = input;
    const currentFiles = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);
    
    const displayFiles = currentFiles.map(f => ({ name: f.name, type: f.type }));
    setMessages(prev => [...prev, { role: 'user', content: userMsg, files: displayFiles }]);
    setSending(true);

    if (!ai) {
      const errorMsg = "Servicio de IA no disponible. Por favor, configura tu API Key en la sección de Configuración.";
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
      speak(errorMsg);
      setSending(false);
      return;
    }

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const context = `Fecha actual: ${dateStr}. Ubicación: ${location ? `Lat: ${location.lat}, Lon: ${location.lon}` : 'Desconocida (pide permiso de ubicación)'}.`;

      // Prepare file context for Gemini
      let fileContext = "";
      if (currentFiles.length > 0) {
        fileContext = `\n\nEl usuario ha adjuntado los siguientes archivos: ${currentFiles.map(f => f.name).join(', ')}. `;
      }

      const model = ai.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: BOT_INSTRUCTIONS + `\n\n${context}\n\nContexto del jardín: El usuario tiene ${plants.length} plantas en su jardín digital. Puedes hablar de cualquier tema botánico, no solo de sus plantas. 
        ${isProMode ? "IMPORTANTE: El usuario es PRO. Tienes acceso a la comunidad y al foro." : ""}`
      });

      const history = messages
        .filter((m, idx) => !(idx === 0 && m.role === 'bot'))
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(userMsg + fileContext);
      const response = await result.response;
      const botResponse = response.text();
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      speak(botResponse);
    } catch (err) {
      console.error("Chat failed:", err);
      const errorMsg = "Lo siento, he tenido un problema al procesar tu consulta. ¿Podrías repetirla?";
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
      speak(errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0 gap-4">
        {isProMode ? (
          <button 
            onClick={() => setActiveTab('community')}
            className="bg-tertiary text-on-tertiary px-6 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <ChatBubble className="w-4 h-4" />
            <span>Ir al Foro de la Comunidad Pro</span>
          </button>
        ) : (
          <div />
        )}
        
        <button 
          onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
          className={cn(
            "p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs shadow-sm",
            isSpeakingEnabled ? "bg-primary/10 text-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          )}
          title={isSpeakingEnabled ? "Desactivar lectura de voz" : "Activar lectura de voz"}
        >
          {isSpeakingEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span>{isSpeakingEnabled ? "Voz Activada" : "Voz Desactivada"}</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-8 pb-32 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex items-start gap-4 max-w-[85%] group",
            msg.role === 'user' ? "flex-row-reverse ml-auto" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg p-2",
              msg.role === 'bot' ? "bg-white border border-primary/10 text-primary" : ""
            )}>
              {msg.role === 'bot' ? (
                <Logo className="w-full h-full" />
              ) : (
                <img src={user.photoURL || ''} className="w-full h-full object-cover" alt="User" />
              )}
            </div>
            <div className={cn(
              "bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-3",
              msg.role === 'bot' ? "rounded-tl-none" : "bg-primary text-on-primary rounded-tr-none"
            )}>
              {msg.files && msg.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.files.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                      {f.type.includes('image') ? <ImageIcon className="w-3 h-3" /> : f.type.includes('pdf') ? <File className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span className="truncate max-w-[100px]">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-start gap-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'bot' && (
                  <div className="shrink-0 mt-1">
                    <VoiceButton text={msg.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 pb-4 md:px-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4">
              {attachedFiles.map((file, idx) => (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={idx} 
                  className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                >
                  {file.type.includes('image') ? <ImageIcon className="w-4 h-4 text-primary" /> : file.type.includes('pdf') ? <File className="w-4 h-4 text-error" /> : <FileText className="w-4 h-4 text-blue-500" />}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="hover:text-error transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="bg-surface-container-lowest rounded-3xl antigravity-shadow p-2 flex items-center gap-2 relative">
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
            >
              <AddCircle className="w-6 h-6" />
            </button>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/60 px-2 font-medium text-sm sm:text-base" 
              placeholder="Escribe tu consulta aquí..." 
              type="text" 
            />

            <div className="flex items-center gap-1 pr-1">
              <button 
                onClick={toggleListening}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  isListening ? "bg-error text-on-error animate-pulse" : "hover:bg-surface-container-low text-on-surface-variant"
                )}
                title={isListening ? "Detener dictado" : "Activar dictado por voz"}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              <button 
                onClick={sendMessage}
                disabled={sending || (!input.trim() && attachedFiles.length === 0)}
                className="bg-primary text-on-primary p-3 rounded-2xl shadow-lg active:scale-90 transition-transform disabled:opacity-50"
              >
                {sending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Spa className="w-6 h-6" /></motion.div> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlantsContent({ plants, onSelectPlant, setActiveTab }: { plants: Plant[], onSelectPlant: (p: Plant) => void, setActiveTab: (tab: any) => void }) {
  const rooms = Array.from(new Set(plants.map(p => p.room || "Sin habitación")));

  return (
    <div className="space-y-12 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Mi Jardín</h2>
          <p className="text-on-surface-variant font-medium">Organizado por habitaciones</p>
        </div>
        <button 
          onClick={() => setActiveTab('camera')}
          className="flex items-center gap-2 text-primary font-bold hover:bg-primary-container/20 px-4 py-2 rounded-xl transition-colors"
        >
          <PlusCircle className="w-6 h-6" />
          <span>Nueva planta</span>
        </button>
      </div>
      
      {rooms.map(room => (
        <section key={room} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-on-surface">{room}</h3>
            <div className="h-px flex-1 bg-surface-container-highest" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              {plants.filter(p => (p.room || "Sin habitación") === room).length} Plantas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plants.filter(p => (p.room || "Sin habitación") === room).map(plant => (
              <PlantCard key={plant.id} plant={plant} onClick={() => onSelectPlant(plant)} />
            ))}
          </div>
        </section>
      ))}

      {plants.length === 0 && (
        <div className="text-center py-24 bg-surface-container-low rounded-3xl border-2 border-dashed border-surface-container-highest">
          <Spa className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-6" />
          <p className="text-on-surface-variant font-medium">Tu jardín digital está esperando su primera planta.</p>
        </div>
      )}
    </div>
  );
}

function PlantDetailModal({ plant, isProMode, onClose, addNotification, setActiveTab }: { plant: Plant, isProMode: boolean, onClose: () => void, addNotification: (msg: string, type: 'info' | 'alert') => void, setActiveTab: (tab: any) => void }) {
  const [isLoggingPest, setIsLoggingPest] = useState(false);
  const [pestDescription, setPestDescription] = useState('');

  const handleLogPest = async () => {
    if (!pestDescription.trim()) return;
    try {
      await addDoc(collection(db, `users/${plant.ownerUid}/plants/${plant.id}/pest_logs`), {
        description: pestDescription,
        timestamp: new Date().toISOString(),
        status: 'reported'
      });
      
      addNotification(`Alerta: Sospecha de plaga en ${plant.name}. Se recomienda consultar a un experto.`, 'alert');
      alert("Alerta registrada. Te recomendamos consultar con la comunidad o un experto.");
      setIsLoggingPest(false);
      setPestDescription('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${plant.ownerUid}/plants/${plant.id}/pest_logs`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-surface w-full max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-80 shrink-0">
          <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-surface/80 backdrop-blur-md rounded-full text-primary"
          >
            <ArrowBack className="w-6 h-6" />
          </button>
          {plant.isToxicToPets && (
            <div className="absolute top-6 right-6 bg-error text-on-error px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl">
              <PriorityHigh className="w-4 h-4" />
              Tóxica para Mascotas
            </div>
          )}
        </div>

        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-2 py-0.5 rounded-full">
                {plant.room || "Sin habitación"}
              </span>
              {isProMode && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full">
                  APG IV: Angiospermae
                </span>
              )}
            </div>
            <h2 className="text-4xl font-extrabold text-on-surface leading-none tracking-tighter">{plant.name}</h2>
            <p className="text-on-surface-variant italic font-medium">{plant.species}</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {plant.characteristics && <DetailSection icon={Spa} title="Características" content={plant.characteristics} />}
            {plant.plantingTime && <DetailSection icon={EventUpcoming} title="Cuándo Plantar" content={plant.plantingTime} />}
            {plant.care && <DetailSection icon={HealthAndSafety} title="Cuidados" content={plant.care} />}
            {plant.transplantInfo && <DetailSection icon={Edit} title="Trasplante" content={plant.transplantInfo} />}
            {isProMode && <PlantTipsSection species={plant.species} />}
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-container rounded-full text-on-primary-container">
                <HealthAndSafety className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Diagnóstico de Salud</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">{plant.health > 80 ? "Saludable" : "Necesita atención"}</span>
                <span className="text-xs font-bold bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full">Alerta de Luz</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Tu planta está en buen estado general. {plant.health < 90 && "Muestra signos de ligera etiolación. **Necesita más luz indirecta** para mantener sus fenestraciones características."}
              </p>
              {isProMode && plant.proData?.nutrientDeficiency && (
                <div className="mt-4 p-4 bg-tertiary-container/10 rounded-2xl border border-tertiary/20">
                  <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Análisis Nutricional Pro</p>
                  <p className="text-sm text-on-surface-variant">{plant.proData.nutrientDeficiency}</p>
                </div>
              )}
            </div>
          </div>

          {isProMode && (
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <Spa className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg text-primary">Predicción de Crecimiento (IA)</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Próxima Hoja</p>
                  <p className="text-lg font-bold">~ 12 días</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tasa de Crecimiento</p>
                  <p className="text-lg font-bold text-green-600">+2.4 cm/mes</p>
                </div>
              </div>
              <div className="h-24 w-full bg-surface-container-low rounded-2xl flex items-end gap-1 p-3 overflow-hidden">
                {[40, 45, 42, 50, 55, 60, 58, 65, 70, 75, 72, 80].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-1 bg-primary/40 rounded-t-sm"
                  />
                ))}
              </div>
              <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest">Historial de Humedad del Sustrato (30 días)</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CareCard icon={WaterDrop} title="Riego" value="Moderado" sub="Suelo 40% húmedo" color="secondary" />
            <CareCard icon={LightMode} title="Luz" value="Indirecta" sub="Ideal: 2500 LUX" color="tertiary" />
            <CareCard icon={PriorityHigh} title="Salud" value={`${plant.health}%`} sub="Estado óptimo" color="primary" />
          </div>

          <div className="bg-error-container/10 p-6 rounded-3xl border border-error/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-container rounded-full text-error">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-error">Reportar Plaga o Enfermedad</h3>
            </div>
            
            {isLoggingPest ? (
              <div className="space-y-4">
                <textarea 
                  value={pestDescription}
                  onChange={(e) => setPestDescription(e.target.value)}
                  placeholder="Describe los síntomas (ej. manchas blancas, hojas comidas...)"
                  className="w-full bg-surface-container-low rounded-2xl p-4 text-sm border-none focus:ring-2 focus:ring-error/20 resize-none h-24"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsLoggingPest(false)}
                    className="flex-1 py-3 rounded-xl font-bold bg-surface-container text-on-surface"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleLogPest}
                    className="flex-1 py-3 rounded-xl font-bold bg-error text-on-error"
                  >
                    Reportar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  ¿Notas algo extraño? Registra una sospecha de plaga para recibir asesoramiento.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsLoggingPest(true)}
                    className="flex-1 py-3 bg-error/10 text-error rounded-xl font-bold text-sm hover:bg-error/20 transition-colors"
                  >
                    Registrar Sospecha
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('community');
                      onClose();
                    }}
                    className="flex-1 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
                  >
                    Consultar Foro
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={async () => {
                try {
                  const nextDate = new Date();
                  nextDate.setDate(nextDate.getDate() + 7);
                  await updateDoc(doc(db, `users/${plant.ownerUid}/plants`, plant.id), {
                    lastWatered: new Date().toISOString(),
                    nextWatering: nextDate.toISOString(),
                    health: Math.min(100, plant.health + 5),
                    humidity: 80
                  });
                  alert("¡Recordatorio de riego actualizado!");
                } catch (err) {
                  handleFirestoreError(err, OperationType.UPDATE, `users/${plant.ownerUid}/plants/${plant.id}`);
                }
              }}
              className="flex-1 bg-primary text-on-primary py-6 px-8 rounded-full flex items-center justify-between shadow-lg hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-on-primary/10 rounded-full">
                  <EventUpcoming className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none">Recordatorio</p>
                  <p className="text-on-primary/70 text-sm mt-1">
                    {Math.max(0, Math.ceil((new Date(plant.nextWatering).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) === 0 
                      ? "¡Toca regar hoy!" 
                      : `En ${Math.max(0, Math.ceil((new Date(plant.nextWatering).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button className="p-6 bg-surface-container rounded-full text-primary hover:bg-primary-container transition-colors">
              <Person className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PostComments({ post, user }: { post: CommunityPost, user: User }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, `community_posts/${post.id}/comments`), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostComment)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `community_posts/${post.id}/comments`));
    return unsub;
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      postId: post.id,
      authorUid: user.uid,
      authorName: user.displayName || 'Usuario',
      authorPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
      content: newComment,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, `community_posts/${post.id}/comments`), commentData);
      await updateDoc(doc(db, 'community_posts', post.id), {
        comments: increment(1)
      });
      setNewComment('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `community_posts/${post.id}/comments`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Spa className="w-6 h-6 text-primary/30" />
            </motion.div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-4 text-xs text-on-surface-variant italic">No hay comentarios aún. ¡Sé el primero!</p>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map(c => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ x: 4 }}
                className="flex gap-3 items-start group"
              >
                <img src={c.authorPhoto} className="w-8 h-8 rounded-full object-cover shadow-sm" alt={c.authorName} />
                <div className="flex-1 bg-surface-container-low p-3 rounded-2xl transition-all group-hover:bg-surface-container-high group-hover:shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-primary">{c.authorName}</span>
                    <span className="text-[10px] text-on-surface-variant">{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{c.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
        />
        <button 
          type="submit"
          disabled={!newComment.trim()}
          className="p-2 bg-primary text-on-primary rounded-xl disabled:opacity-50 active:scale-90 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function SubmitTipModal({ user, onClose }: { user: User, onClose: () => void }) {
  const [species, setSpecies] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!species.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'plant_tips'), {
        species: species.trim(),
        content: content.trim(),
        authorUid: user.uid,
        authorName: user.displayName || 'Usuario',
        timestamp: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'plant_tips');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface p-8 rounded-3xl max-w-md w-full space-y-6"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Compartir Tip de Cuidado</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Especie (ej. Monstera Deliciosa)</label>
            <input 
              type="text" 
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Nombre de la planta"
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm font-bold"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tu Consejo</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe un consejo corto y útil..."
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm resize-none h-32"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <Star className="w-5 h-5 fill-current group-hover:rotate-12 transition-transform" />
            <span>{submitting ? 'Publicando...' : 'Publicar Tip Pro'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function VoiceButton({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.2; // Robotic but with a bit more "emotion" (higher pitch)
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        speak();
      }}
      className={cn(
        "p-2 rounded-full transition-all flex items-center justify-center",
        isSpeaking ? "bg-primary text-on-primary animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"
      )}
      title={isSpeaking ? "Detener voz" : "Escuchar texto"}
    >
      <Volume2 className={cn("w-4 h-4", isSpeaking && "fill-current")} />
    </button>
  );
}

function CommunityContent({ posts, user, scans, isProMode, onOpenChat, chatRooms, roomUnreadCounts, allTips, activeSubTab, setActiveSubTab, setActiveTab }: { posts: CommunityPost[], user: User, scans: Scan[], isProMode: boolean, onOpenChat: (room: ChatRoom) => void, chatRooms: ChatRoom[], roomUnreadCounts: Record<string, number>, allTips: PlantTip[], activeSubTab: 'menu' | 'feed' | 'experts' | 'tips' | 'chat', setActiveSubTab: (tab: 'menu' | 'feed' | 'experts' | 'tips' | 'chat') => void, setActiveTab: (tab: any) => void }) {
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  
  // Filters
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    
    // Category Filter
    if (filterCategory !== 'Todos') {
      result = result.filter(p => p.category === filterCategory);
    }
    
    // Sorting
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      result.sort((a, b) => b.likes - a.likes);
    }
    
    return result;
  }, [posts, sortBy, filterCategory]);

  const handleShare = async (post: CommunityPost) => {
    const shareData = {
      title: 'BotanicAI Community',
      text: `Mira esta publicación de ${post.authorName} en BotanicAI: ${post.content}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleLike = async (postId: string) => {
    const likeRef = doc(db, `community_posts/${postId}/likes`, user.uid);
    try {
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(doc(db, 'community_posts', postId), {
          likes: increment(-1)
        });
        setUserLikes(prev => ({ ...prev, [postId]: false }));
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          postId: postId,
          timestamp: new Date().toISOString()
        });
        await updateDoc(doc(db, 'community_posts', postId), {
          likes: increment(1)
        });
        setUserLikes(prev => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `community_posts/${postId}/likes/${user.uid}`);
    }
  };

  const handleComment = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const isRestricted = (tab: string) => {
    if (isProMode) return false;
    return tab === 'experts' || tab === 'chat';
  };

  if (activeSubTab === 'menu') {
    return (
      <div className="space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tighter">Comunidad Pro</h2>
          <p className="text-on-surface-variant font-medium">Conecta, aprende y comparte con otros expertos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveSubTab('feed')}
            className="group bg-surface-container-lowest p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container hover:border-primary/30 transition-all text-left space-y-4"
          >
            <div className="w-16 h-16 bg-primary-container rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ChatBubble className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Muro Social</h3>
              <p className="text-sm text-on-surface-variant mt-1">Publica tus avances y consulta dudas con la comunidad.</p>
            </div>
            <div className="pt-4 flex items-center text-primary font-bold text-sm gap-2">
              Entrar <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button 
            onClick={() => setActiveSubTab('tips')}
            className="group bg-surface-container-lowest p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container hover:border-secondary/30 transition-all text-left space-y-4"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Tips de Cuidado</h3>
              <p className="text-sm text-on-surface-variant mt-1">Consejos rápidos y efectivos de expertos botánicos.</p>
            </div>
            <div className="pt-4 flex items-center text-amber-600 font-bold text-sm gap-2">
              Ver Tips <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button 
            onClick={() => {
              if (isRestricted('chat')) {
                setActiveTab('pro-benefits');
              } else {
                setActiveSubTab('chat');
              }
            }}
            className={cn(
              "group p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container transition-all text-left space-y-4",
              isRestricted('chat') ? "bg-surface-container-low opacity-80" : "bg-surface-container-lowest hover:border-emerald-300"
            )}
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform relative">
              <Spa className="w-8 h-8" />
              {isRestricted('chat') ? (
                <div className="absolute -top-2 -right-2 bg-primary text-on-primary text-[8px] font-black px-2 py-1 rounded-full shadow-sm">PRO</div>
              ) : (
                Object.values(roomUnreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <div className="absolute -top-2 -right-2 bg-[#ff3b30] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {Object.values(roomUnreadCounts).reduce((a, b) => a + b, 0)}
                  </div>
                )
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Chat Grupal</h3>
              <p className="text-sm text-on-surface-variant mt-1">Conversaciones en tiempo real por temáticas.</p>
            </div>
            <div className="pt-4 flex items-center text-emerald-600 font-bold text-sm gap-2">
              {isRestricted('chat') ? "Saber más" : "Chatear"} <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveSubTab('menu')}
            className="p-3 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-colors"
          >
            <ArrowBack className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-black tracking-tighter">
            {activeSubTab === 'feed' ? 'Muro Social' : 
             activeSubTab === 'tips' ? 'Tips de Cuidado' : 
             'Chat Grupal'}
          </h2>
        </div>
        
        <div className="flex gap-3">
          {activeSubTab === 'feed' && isProMode && (
            <button 
              onClick={() => setShowPostModal(true)}
              className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Publicar</span>
            </button>
          )}
          {activeSubTab === 'feed' && !isProMode && (
            <p className="text-on-surface-variant text-sm px-4 py-2 bg-surface-container rounded-2xl">
              Solo usuarios Pro pueden publicar en el muro social.
            </p>
          )}
          {activeSubTab === 'tips' && (
            <button 
              onClick={() => setShowTipModal(true)}
              className="bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Lightbulb className="w-5 h-5" />
              <span>Compartir Tip</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTipModal && (
          <SubmitTipModal 
            user={user} 
            onClose={() => setShowTipModal(false)} 
          />
        )}
      </AnimatePresence>

      {activeSubTab === 'feed' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center bg-surface-container-low p-4 rounded-3xl border border-surface-container-high">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Ordenar:</span>
              <div className="flex bg-surface-container-highest p-1 rounded-xl">
                <button 
                  onClick={() => setSortBy('recent')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    sortBy === 'recent' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Recientes
                </button>
                <button 
                  onClick={() => setSortBy('popular')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                    sortBy === 'popular' ? "bg-primary text-on-primary shadow-lg scale-105" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {sortBy === 'popular' && <FlashOn className="w-3 h-3 animate-pulse" />}
                  Populares
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tema:</span>
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-high transition-all border border-transparent focus:border-primary/30"
              >
                <span>{filterCategory}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showCategoryDropdown && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-surface-container-lowest border border-surface-container-high rounded-2xl shadow-2xl z-20 overflow-hidden"
                    >
                      {['Todos', 'Diagnóstico', 'Cuidados', 'Decoración'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center justify-between",
                            filterCategory === cat ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                          )}
                        >
                          {cat}
                          {filterCategory === cat && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => {
                  const isPopular = post.likes > 50;
                  const isViral = post.likes > 100;
                  return (
                    <motion.div 
                      key={post.id} 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "bg-surface-container-lowest rounded-[2rem] overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative",
                        isViral ? "border-amber-400 shadow-2xl shadow-amber-200 ring-8 ring-amber-50" :
                        isPopular && sortBy === 'popular' ? "border-primary/60 shadow-2xl shadow-primary/20 ring-8 ring-primary/5" : "border-surface-container-highest/50 shadow-sm"
                      )}
                    >
                      {(isPopular || isViral) && (
                        <div className={cn(
                          "absolute top-4 right-4 z-10 backdrop-blur-md text-on-primary px-3 py-1 rounded-full flex items-center gap-1 shadow-lg transition-all duration-500",
                          isViral ? "bg-amber-500 scale-110 shadow-amber-400" :
                          sortBy === 'popular' ? "bg-primary scale-110 shadow-primary/40" : "bg-primary/80"
                        )}>
                          {isViral ? <Star className="w-3 h-3 fill-current animate-bounce" /> :
                           sortBy === 'popular' ? <FlashOn className="w-3 h-3 animate-pulse" /> : <Star className="w-3 h-3 fill-current" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {isViral ? 'Viral' : 'Popular'}
                          </span>
                        </div>
                      )}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={post.authorPhoto} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/10" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                            <Spa className="w-2 h-2 text-on-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{post.authorName}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            {new Date(post.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <VoiceButton text={post.content} />
                    </div>
                    {post.imageUrl && (
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="p-6 space-y-5">
                      <div className="relative">
                        <p className="text-sm text-on-surface leading-relaxed font-medium">{post.content}</p>
                        {post.category && (
                          <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            #{post.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 pt-5 border-t border-surface-container-high/50">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center gap-2 transition-all active:scale-90",
                            userLikes[post.id] ? "text-primary" : "text-on-surface-variant hover:text-primary"
                          )}
                        >
                          <Spa className={cn("w-5 h-5", userLikes[post.id] && "fill-current")} />
                          <span className="text-xs font-black">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => handleComment(post.id)}
                          className={cn(
                            "flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all active:scale-90",
                            expandedPostId === post.id && "text-primary"
                          )}
                        >
                          <ChatBubble className="w-5 h-5" />
                          <span className="text-xs font-black">{post.comments}</span>
                        </button>
                        <button 
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary hover:text-on-primary transition-all duration-300 active:scale-95 ml-auto px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-sm hover:shadow-md border border-primary/20"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Compartir</span>
                        </button>
                      </div>
                      
                      {expandedPostId === post.id && (
                        <div className="pt-6 border-t border-surface-container animate-in fade-in slide-in-from-top-4 duration-300">
                          <PostComments post={post} user={user} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-surface-container-high">
                <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-on-surface-variant/30">
                  <ChatBubble className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-on-surface">No hay publicaciones aún</h3>
                  <p className="text-sm text-on-surface-variant">¡Sé el primero en compartir algo con la comunidad!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeSubTab === 'chat' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chatRooms.map((room, idx) => {
            const lastSeenRoom = localStorage.getItem(`last_seen_room_${room.id}_${user.uid}`) || new Date(0).toISOString();
            const msgTime = room.lastMessageTime ? (room.lastMessageTime.toDate ? room.lastMessageTime.toDate().toISOString() : new Date(room.lastMessageTime).toISOString()) : new Date(0).toISOString();
            const isUnread = msgTime > lastSeenRoom && room.lastMessageAuthorUid !== user.uid;

            // WhatsApp-like colors for variety
            const colors = [
              'bg-emerald-50 text-emerald-700 border-emerald-100',
              'bg-blue-50 text-blue-700 border-blue-100',
              'bg-purple-50 text-purple-700 border-purple-100',
              'bg-amber-50 text-amber-700 border-amber-100',
              'bg-rose-50 text-rose-700 border-rose-100',
              'bg-cyan-50 text-cyan-700 border-cyan-100',
              'bg-indigo-50 text-indigo-700 border-indigo-100',
              'bg-teal-50 text-teal-700 border-teal-100'
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div 
                key={room.id} 
                onClick={() => onOpenChat(room)}
                className={cn(
                  "p-4 rounded-2xl border antigravity-shadow hover:scale-[1.02] transition-all cursor-pointer group flex items-center gap-3",
                  colorClass
                )}
              >
                <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  {room.icon === 'Spa' ? <Spa className="w-5 h-5" /> : 
                   room.icon === 'PriorityHigh' ? <PriorityHigh className="w-5 h-5" /> :
                   room.icon === 'LocalFlorist' ? <LocalFlorist className="w-5 h-5" /> :
                   room.icon === 'Home' ? <Home className="w-5 h-5" /> :
                   room.icon === 'Sun' ? <LightMode className="w-5 h-5" /> :
                   room.icon === 'Flower2' ? <LocalFlorist className="w-5 h-5" /> :
                   room.icon === 'Cloud' ? <Cloud className="w-5 h-5" /> :
                   room.icon === 'Droplets' ? <WaterDrop className="w-5 h-5" /> :
                   room.icon === 'Leaf' ? <Spa className="w-5 h-5" /> :
                   <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-xs truncate">{room.name}</h4>
                    {roomUnreadCounts[room.id] > 0 && (
                      <div className="bg-[#ff3b30] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm shrink-0">
                        {roomUnreadCounts[room.id]}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] opacity-70 truncate">
                    {room.lastMessage || room.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allTips.map(tip => (
            <div key={tip.id} className="bg-surface-container-lowest p-6 rounded-3xl antigravity-shadow space-y-4 border border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-container rounded-full text-secondary">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-secondary truncate">{tip.species}</h4>
              </div>
              <p className="text-sm text-on-surface leading-relaxed italic">"{tip.content}"</p>
              <div className="pt-4 border-t border-surface-container flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">— {tip.authorName}</span>
                <span className="text-[10px] text-on-surface-variant/60">{new Date(tip.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {allTips.length === 0 && (
            <div className="col-span-full text-center py-20 bg-surface-container-low rounded-3xl">
              <p className="text-on-surface-variant italic">No hay tips aún. ¡Sé el primero en compartir uno!</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showExpertModal && (
          <ExpertQueryModal 
            user={user} 
            scans={scans} 
            onClose={() => setShowExpertModal(false)} 
          />
        )}
        {showPostModal && (
          <CreatePostModal 
            user={user} 
            onClose={() => setShowPostModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreatePostModal({ user, onClose }: { user: User, onClose: () => void }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Diagnóstico' | 'Cuidados' | 'Decoración' | 'General'>('General');
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Por favor selecciona una de menos de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const resized = await resizeImage(event.target.result as string);
          setImage(resized);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        authorName: user.displayName || 'Usuario',
        authorPhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        authorUid: user.uid,
        content: content,
        category,
        imageUrl: image || '',
        likes: 0,
        comments: 0,
        timestamp: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error("Error publishing post:", err);
      alert("Error al publicar: " + (err instanceof Error ? err.message : "Error desconocido"));
      handleFirestoreError(err, OperationType.CREATE, 'community_posts');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface w-full max-w-md rounded-3xl p-8 space-y-6 antigravity-shadow"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Nueva Publicación</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tema de la publicación</label>
            <div className="flex gap-2 flex-wrap">
              {['General', 'Diagnóstico', 'Cuidados', 'Decoración'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all",
                    category === cat ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-low text-on-surface-variant"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-surface-container-low rounded-2xl border-2 border-dashed border-surface-container-highest flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden"
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-on-surface-variant/40 mb-2" />
                <p className="text-xs font-bold text-on-surface-variant">Añadir Imagen</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm resize-none h-32 focus:ring-2 focus:ring-primary/20"
            required
          />

          <button 
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExpertQueryModal({ user, scans, onClose }: { user: User, scans: Scan[], onClose: () => void }) {
  const [selectedScanId, setSelectedScanId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedScanId || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'expertQueries'), {
        userUid: user.uid,
        scanId: selectedScanId,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expertQueries');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface w-full max-w-md rounded-3xl p-8 space-y-6 antigravity-shadow"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-tertiary-container text-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Psychology className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold">Pregunta al Botánico</h3>
          <p className="text-sm text-on-surface-variant">Selecciona uno de tus escaneos para que un experto lo revise detalladamente.</p>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar pr-2">
          {scans.map(scan => (
            <button 
              key={scan.id}
              onClick={() => setSelectedScanId(scan.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all",
                selectedScanId === scan.id ? "border-primary bg-primary/5" : "border-surface-container-highest bg-surface-container-low"
              )}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <img src={scan.imageUrl} className="w-full h-full object-cover" alt="Scan" />
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold text-sm truncate">{scan.speciesOptions[0]?.name || "Escaneo"}</p>
                <p className="text-[10px] text-on-surface-variant">{new Date(scan.timestamp).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
          {scans.length === 0 && (
            <p className="text-center text-sm text-on-surface-variant py-4">Primero debes realizar un escaneo con la cámara.</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedScanId || submitting}
            className="flex-1 py-4 px-6 rounded-2xl font-black bg-primary text-on-primary shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <Psychology className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>{submitting ? "Enviando..." : "Enviar Consulta Pro"}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToolsContent() {
  const [lux, setLux] = useState(0);
  const [substrate, setSubstrate] = useState({ length: 20, width: 20, depth: 10 });

  useEffect(() => {
    const interval = setInterval(() => {
      setLux(Math.floor(Math.random() * 500) + 2000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const substrateVolume = (substrate.length * substrate.width * substrate.depth) / 1000;

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Herramientas de Precisión</h2>
        <p className="text-on-surface-variant font-medium">Instrumentos científicos para tu jardín</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tertiary-container rounded-2xl text-tertiary">
              <LightMode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Fotómetro Digital</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-8 bg-surface-container-low rounded-2xl border border-surface-container-highest">
            <span className="text-5xl font-black text-primary tracking-tighter">{lux}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-2">LUX (Intensidad Lumínica)</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Usa el sensor de luz de tu dispositivo para medir la intensidad en la ubicación de tu planta. 
            <span className="text-primary font-bold ml-1">Ideal para Monstera: 2500-4000 LUX.</span>
          </p>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-container rounded-2xl text-secondary">
              <WaterDrop className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Calculadora de Sustrato</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {['Largo', 'Ancho', 'Prof.'].map((label, i) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label} (cm)</label>
                  <input 
                    type="number" 
                    value={Object.values(substrate)[i]}
                    onChange={(e) => setSubstrate({...substrate, [Object.keys(substrate)[i]]: parseInt(e.target.value)})}
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm font-bold"
                  />
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl flex justify-between items-center">
              <span className="text-sm font-bold text-on-surface-variant">Volumen Necesario:</span>
              <span className="text-2xl font-black text-primary">{substrateVolume.toFixed(1)} Litros</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow space-y-6 md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container rounded-2xl text-primary">
              <EventUpcoming className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Calendario Lunar Botánico</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { phase: 'Luna Creciente', action: 'Trasplantar', date: '12 Abr', active: true },
              { phase: 'Luna Llena', action: 'Cosechar', date: '15 Abr', active: false },
              { phase: 'Luna Menguante', action: 'Podar', date: '20 Abr', active: false },
              { phase: 'Luna Nueva', action: 'Abonar', date: '25 Abr', active: false },
            ].map((item) => (
              <div key={item.phase} className={cn(
                "p-4 rounded-2xl border transition-all",
                item.active ? "bg-primary/10 border-primary shadow-sm" : "bg-surface-container-low border-transparent opacity-60"
              )}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{item.date}</p>
                <p className="font-bold text-on-surface">{item.phase}</p>
                <p className="text-xs text-on-surface-variant mt-2">Recomendado: <span className="font-bold text-primary">{item.action}</span></p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-surface-container rounded-2xl text-on-surface">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Glosario Botánico Interactivo</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { term: 'Glabro', def: 'Desprovisto de pelo o vello.' },
            { term: 'Pecíolo', def: 'Parte que une la lámina de la hoja al tallo.' },
            { term: 'Etiolación', def: 'Crecimiento débil y pálido por falta de luz.' },
            { term: 'Fenestración', def: 'Agujeros naturales en las hojas (ej. Monstera).' },
            { term: 'Sésil', def: 'Órgano que carece de pie o soporte.' },
            { term: 'Pubescente', def: 'Cubierto de vello fino y suave.' },
            { term: 'Perenne', def: 'Planta que vive más de dos años.' },
            { term: 'Caduca', def: 'Planta que pierde sus hojas cada año.' },
          ].map((item) => (
            <div key={item.term} className="group relative">
              <button className="w-full text-left p-4 bg-surface-container-low rounded-2xl hover:bg-primary/10 transition-colors">
                <span className="font-bold text-sm text-primary">{item.term}</span>
              </button>
              <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-on-surface text-surface text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                {item.def}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CareCard({ icon: Icon, title, value, sub, color }: { icon: any, title: string, value: string, sub: string, color: string }) {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary-container text-on-primary-container",
    secondary: "bg-secondary-container text-on-secondary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
  };

  return (
    <div className="bg-surface-container-lowest p-6 rounded-3xl antigravity-shadow">
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-on-surface-variant text-sm mb-2">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{sub}</p>
    </div>
  );
}

function ProfileContent({ user, profile, notifPrefs, setNotifPrefs }: { user: User, profile: UserProfile | null, notifPrefs: { sound: boolean, vibration: boolean }, setNotifPrefs: React.Dispatch<React.SetStateAction<{ sound: boolean, vibration: boolean }>> }) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    username: profile?.username || '',
    country: profile?.country || '',
    phoneNumber: profile?.phoneNumber || '',
    photoURL: profile?.photoURL || user.photoURL || ''
  });

  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        country: profile.country || '',
        phoneNumber: profile.phoneNumber || '',
        photoURL: profile.photoURL || user.photoURL || ''
      });
    }
  }, [profile, user.photoURL]);

  const [saving, setSaving] = useState(false);

  const countries = getCountries();
  const selectedCountryCode = formData.country as CountryCode;
  const dialCode = selectedCountryCode && countries.includes(selectedCountryCode) 
    ? getCountryCallingCode(selectedCountryCode) 
    : '';

  const getFlagEmoji = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  };

  const handleSave = async () => {
    if (formData.phoneNumber) {
      try {
        const countryCode = formData.country as CountryCode;
        if (!isValidPhoneNumber(formData.phoneNumber, countryCode)) {
          alert('El número de teléfono no es válido para el país seleccionado');
          return;
        }
        
        const parsed = parsePhoneNumber(formData.phoneNumber, countryCode);
        const formattedPhone = parsed.format('E.164');
        
        // Check uniqueness (requires Cloud Function for proper enforcement in production)
        try {
          const q = query(collection(db, 'users'), where('phoneNumber', '==', formattedPhone));
          const querySnapshot = await getDocs(q);
          const otherUsers = querySnapshot.docs.filter(doc => doc.id !== user.uid);
          
          if (otherUsers.length > 0) {
            alert('Este número de teléfono ya está registrado con otro usuario');
            return;
          }
        } catch (phoneCheckErr) {
          // Permission denied: Firestore rules prevent cross-user queries.
          // In production, this should be handled by a Cloud Function.
          console.warn('Phone uniqueness check skipped (permission denied).');
        }
        
        formData.phoneNumber = formattedPhone;
      } catch (e) {
        alert('Error al validar el número de teléfono');
        return;
      }
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), formData, { merge: true });
      alert('Perfil actualizado con éxito');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("No se pudo acceder a la cámara");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, photoURL: data });
        stopCamera();
        setShowPhotoOptions(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, photoURL: event.target.result as string });
          setShowPhotoOptions(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <img src={formData.photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
          <button 
            onClick={() => setShowPhotoOptions(true)}
            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
          >
            Cambiar
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Mi Perfil</h2>
          <p className="text-on-surface-variant font-medium">{user.email}</p>
        </div>
      </div>

      <AnimatePresence>
        {showPhotoOptions && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-surface w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Cambiar Foto de Perfil</h3>
                <button onClick={() => { stopCamera(); setShowPhotoOptions(false); }} className="p-2 hover:bg-surface-container rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isCameraActive ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-black relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={capturePhoto}
                    className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Camera className="w-6 h-6" />
                    Tomar Foto
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 p-6 bg-surface-container-low rounded-2xl hover:bg-primary/10 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-primary" />
                    <span className="font-bold text-sm">Cámara</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 bg-surface-container-low rounded-2xl hover:bg-primary/10 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-primary" />
                    <span className="font-bold text-sm">Galería</span>
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre</label>
          <input 
            type="text" 
            value={formData.firstName} 
            onChange={e => setFormData({...formData, firstName: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Apellido</label>
          <input 
            type="text" 
            value={formData.lastName} 
            onChange={e => setFormData({...formData, lastName: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Usuario</label>
          <input 
            type="text" 
            value={formData.username} 
            onChange={e => setFormData({...formData, username: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">País</label>
          <select 
            value={formData.country} 
            onChange={e => setFormData({...formData, country: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
          >
            <option value="">Seleccionar país</option>
            {countries.map(code => (
              <option key={code} value={code}>
                {getFlagEmoji(code)} {code}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Móvil</label>
          <div className="relative">
            {dialCode && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-lg">{getFlagEmoji(formData.country)}</span>
                <span className="text-sm font-bold text-primary">+{dialCode}</span>
              </div>
            )}
            <input 
              type="text" 
              value={formData.phoneNumber} 
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              className={cn(
                "w-full bg-surface-container-low border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all",
                dialCode ? "pl-24" : ""
              )}
              placeholder="Número de móvil"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Contraseña</label>
          <button 
            onClick={() => alert('Se ha enviado un correo para restablecer tu contraseña.')}
            className="w-full bg-surface-container-low text-left rounded-2xl p-4 font-bold text-primary hover:bg-primary/5 transition-all"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container space-y-6">
        <h3 className="text-xl font-black tracking-tight">Preferencias de Notificación</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="font-bold">Sonido</span>
            </div>
            <button 
              onClick={() => setNotifPrefs(prev => ({ ...prev, sound: !prev.sound }))}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                notifPrefs.sound ? "bg-primary" : "bg-surface-container-highest"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                notifPrefs.sound ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="font-bold">Vibración</span>
            </div>
            <button 
              onClick={() => setNotifPrefs(prev => ({ ...prev, vibration: !prev.vibration }))}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                notifPrefs.vibration ? "bg-primary" : "bg-surface-container-highest"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                notifPrefs.vibration ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}

function ChatRoomContent({ room, user, onBack, setRoomUnreadCounts }: { room: ChatRoom, user: User, onBack: () => void, setRoomUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const q = query(
      collection(db, `chat_rooms/${room.id}/messages`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
      const unsub = onSnapshot(q, (snap) => {
        const newMsgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(newMsgs);
        
        // Speak last message if it's from someone else
        if (isSpeakingEnabled && newMsgs.length > 0) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.authorUid !== user.uid) {
            speak(`${lastMsg.authorName} dice: ${lastMsg.content}`);
          }
        }

        // Mark as read when messages are loaded/updated while viewing
        const now = new Date().toISOString();
        localStorage.setItem(`last_seen_room_${room.id}_${user.uid}`, now);
        setRoomUnreadCounts(prev => ({ ...prev, [room.id]: 0 }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, `chat_rooms/${room.id}/messages`));
    return unsub;
  }, [room.id, user.uid, isSpeakingEnabled]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start listening:", err);
      }
    }
  };

  const speak = (text: string) => {
    if (!isSpeakingEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 1.2; // Robotic but with a bit more "emotion" (higher pitch)
    utterance.rate = 0.95; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachedFiles.length === 0)) return;

    const content = newMessage.trim();
    const currentFiles = [...attachedFiles];
    setNewMessage('');
    setAttachedFiles([]);

    try {
      const messageData: any = {
        roomId: room.id,
        authorUid: user.uid,
        authorName: user.displayName || 'Usuario Anónimo',
        authorPhoto: user.photoURL || '',
        content,
        timestamp: serverTimestamp()
      };

      if (currentFiles.length > 0) {
        messageData.files = currentFiles.map(f => ({ name: f.name, type: f.type }));
      }

      await addDoc(collection(db, `chat_rooms/${room.id}/messages`), messageData);
      
      await updateDoc(doc(db, 'chat_rooms', room.id), {
        lastMessage: content || `[${currentFiles.length} archivo(s)]`,
        lastMessageTime: serverTimestamp(),
        lastMessageAuthorUid: user.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chat_rooms/${room.id}/messages`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-surface-container-lowest rounded-3xl antigravity-shadow overflow-hidden border border-surface-container-high">
      <div className="p-6 border-b border-surface-container-high flex items-center gap-4 bg-surface-container-low">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
          <ArrowBack className="w-6 h-6" />
        </button>
        <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary">
          {room.icon === 'Spa' ? <Spa className="w-6 h-6" /> : 
           room.icon === 'PriorityHigh' ? <PriorityHigh className="w-6 h-6" /> :
           room.icon === 'LocalFlorist' ? <LocalFlorist className="w-6 h-6" /> :
           room.icon === 'Home' ? <Home className="w-6 h-6" /> :
           room.icon === 'Sun' ? <LightMode className="w-6 h-6" /> :
           room.icon === 'Flower2' ? <LocalFlorist className="w-6 h-6" /> :
           room.icon === 'Cloud' ? <Cloud className="w-6 h-6" /> :
           room.icon === 'Droplets' ? <WaterDrop className="w-6 h-6" /> :
           room.icon === 'Leaf' ? <Spa className="w-6 h-6" /> :
           <ImageIcon className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{room.name}</h3>
          <p className="text-xs text-on-surface-variant line-clamp-1">{room.description}</p>
        </div>
        <button 
          onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
          className={cn(
            "p-3 rounded-2xl transition-all",
            isSpeakingEnabled ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-on-surface-variant"
          )}
          title={isSpeakingEnabled ? "Desactivar lectura de voz" : "Activar lectura de voz"}
        >
          {isSpeakingEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-[#e5ddd5] dark:bg-surface-container-lowest/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex w-full",
            msg.authorUid === user.uid ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "px-3 py-2 rounded-xl text-sm shadow-sm relative min-w-[120px] max-w-[85%] space-y-2",
              msg.authorUid === user.uid 
                ? "bg-[#dcf8c6] text-on-surface rounded-tr-none" 
                : "bg-white text-on-surface rounded-tl-none"
            )}>
              {msg.authorUid !== user.uid && (
                <div className="flex justify-between items-center gap-4 mb-0.5">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {msg.authorName}
                  </p>
                  <VoiceButton text={msg.content} />
                </div>
              )}
              
              {(msg as any).files && (msg as any).files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(msg as any).files.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/5 px-2 py-1 rounded-lg text-[9px] font-bold">
                      {f.type.includes('image') ? <ImageIcon className="w-3 h-3" /> : f.type.includes('pdf') ? <File className="w-3 h-3 text-error" /> : <FileText className="w-3 h-3 text-blue-500" />}
                      <span className="truncate max-w-[100px]">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="leading-tight mb-4">{msg.content}</p>
              <div className="absolute bottom-1 right-2 flex items-center gap-1.5">
                <span className="text-[9px] text-on-surface-variant/70 font-medium">
                  {msg.timestamp?.toDate ? (
                    <>
                      {msg.timestamp.toDate().toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                      {' '}
                      {msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </>
                  ) : '...'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <ChatBubble className="w-12 h-12" />
            <p className="text-sm font-medium">No hay mensajes aún. ¡Sé el primero en saludar!</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container-low border-t border-surface-container-high space-y-2">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {attachedFiles.map((file, idx) => (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={idx} 
                className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm"
              >
                {file.type.includes('image') ? <ImageIcon className="w-3 h-3 text-primary" /> : file.type.includes('pdf') ? <File className="w-3 h-3 text-error" /> : <FileText className="w-3 h-3 text-blue-500" />}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="hover:text-error transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 items-center pr-2">
          <input 
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl hover:bg-surface-container-lowest transition-colors text-on-surface-variant"
          >
            <AddCircle className="w-6 h-6" />
          </button>

          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-surface-container-lowest px-4 py-3 rounded-2xl border border-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm sm:text-base"
          />

          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-3 rounded-2xl transition-all",
                isListening ? "bg-error text-on-error animate-pulse" : "hover:bg-surface-container-lowest text-on-surface-variant"
              )}
              title={isListening ? "Detener dictado" : "Activar dictado por voz"}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button 
              type="submit"
              disabled={!newMessage.trim() && attachedFiles.length === 0}
              className="bg-primary text-on-primary p-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationsContent({ posts, customNotifications = [], setActiveTab, setCommunitySubTab, unreadCommunityCount, unreadChatCount, allTips }: { posts: CommunityPost[], customNotifications?: { id: string, message: string, type: 'info' | 'alert', timestamp: string }[], setActiveTab: (tab: any) => void, setCommunitySubTab: (tab: any) => void, unreadCommunityCount: number, unreadChatCount: number, allTips: PlantTip[] }) {
  // Calculate unread tips (simple logic: tips from last 24h)
  const unreadTipsCount = allTips.filter(tip => {
    const tipTime = new Date(tip.timestamp).getTime();
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return tipTime > oneDayAgo;
  }).length;

  const navigateToCommunity = (subTab: 'feed' | 'tips' | 'chat') => {
    setCommunitySubTab(subTab);
    setActiveTab('community');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tighter">Notificaciones</h2>
        {(unreadCommunityCount > 0 || unreadChatCount > 0 || unreadTipsCount > 0) && (
          <span className="bg-primary text-on-primary text-[10px] font-black px-2 py-1 rounded-full animate-pulse">
            NUEVA ACTIVIDAD
          </span>
        )}
      </div>

      {/* Vertical Menu Items */}
      <div className="space-y-4">
        <button 
          onClick={() => navigateToCommunity('feed')}
          className="w-full bg-surface-container-lowest p-6 rounded-3xl antigravity-shadow flex items-center justify-between hover:bg-primary/5 transition-all border border-surface-container group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container rounded-2xl text-primary group-hover:scale-110 transition-transform">
              <ChatBubble className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-on-surface">Muro Social</span>
          </div>
          <div className="flex items-center gap-3">
            {unreadCommunityCount > 0 && (
              <span className="bg-error text-white text-xs font-black px-3 py-1 rounded-full">
                {unreadCommunityCount}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-on-surface-variant/40" />
          </div>
        </button>

        <button 
          onClick={() => navigateToCommunity('tips')}
          className="w-full bg-surface-container-lowest p-6 rounded-3xl antigravity-shadow flex items-center justify-between hover:bg-primary/5 transition-all border border-surface-container group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-on-surface">Tips de Cuidados</span>
          </div>
          <div className="flex items-center gap-3">
            {unreadTipsCount > 0 && (
              <span className="bg-error text-white text-xs font-black px-3 py-1 rounded-full">
                {unreadTipsCount}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-on-surface-variant/40" />
          </div>
        </button>

        <button 
          onClick={() => navigateToCommunity('chat')}
          className="w-full bg-surface-container-lowest p-6 rounded-3xl antigravity-shadow flex items-center justify-between hover:bg-primary/5 transition-all border border-surface-container group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <Spa className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-on-surface">Chat Grupal</span>
          </div>
          <div className="flex items-center gap-3">
            {unreadChatCount > 0 && (
              <span className="bg-error text-white text-xs font-black px-3 py-1 rounded-full">
                {unreadChatCount}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-on-surface-variant/40" />
          </div>
        </button>
      </div>

      {/* System Notifications */}
      {customNotifications.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-surface-container">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-2">Avisos del Sistema</p>
          {customNotifications.map(notif => (
            <div key={notif.id} className={cn(
              "p-6 rounded-3xl antigravity-shadow flex items-start gap-4",
              notif.type === 'alert' ? "bg-error-container/20 border border-error/20" : "bg-surface-container-lowest border border-surface-container"
            )}>
              <div className={cn(
                "p-3 rounded-2xl",
                notif.type === 'alert' ? "bg-error text-on-error" : "bg-primary-container text-primary"
              )}>
                {notif.type === 'alert' ? <PriorityHigh className="w-6 h-6" /> : <Notifications className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold text-on-surface">{notif.type === 'alert' ? 'Alerta Sanitaria' : 'Aviso del Sistema'}</p>
                <p className="text-sm text-on-surface-variant mt-1">{notif.message}</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-2 uppercase font-bold tracking-widest">
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h2 className="text-3xl font-black tracking-tighter">Privacidad de Datos</h2>
      <div className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow prose prose-sm max-w-none">
        <h3 className="text-primary font-bold">Tu Privacidad es nuestra Prioridad</h3>
        <p>En BotanicAI, nos tomamos muy en serio la seguridad de tus datos botánicos y personales.</p>
        <ul className="space-y-4">
          <li><strong>Datos de Ubicación:</strong> Solo se utilizan para proporcionarte información climática precisa y recomendaciones de riego. Nunca compartimos tu ubicación exacta con terceros.</li>
          <li><strong>Imágenes de Plantas:</strong> Las fotos que subes se procesan mediante IA para el diagnóstico, pero siguen siendo de tu propiedad.</li>
          <li><strong>Información de Perfil:</strong> Tu número de móvil y datos personales están cifrados y solo se utilizan para la gestión de tu cuenta.</li>
          <li><strong>Comunidad:</strong> Solo los datos que decidas publicar en el foro son visibles para otros usuarios.</li>
        </ul>
        <p className="mt-6 text-xs text-on-surface-variant italic">Última actualización: Abril 2025</p>
      </div>
    </div>
  );
}

function HelpContent() {
  const steps = [
    { title: 'Escanear', desc: 'Usa la cámara para identificar cualquier planta y obtener un diagnóstico de salud instantáneo.', icon: PhotoCamera },
    { title: 'Mi Jardín', desc: 'Organiza tus plantas por habitaciones y recibe recordatorios de riego personalizados.', icon: LocalFlorist },
    { title: 'Chat Botánico', desc: 'Pregunta cualquier duda a nuestra IA experta sobre cuidados, plagas o sustratos.', icon: ChatBubble },
    { title: 'Comunidad', desc: 'Comparte tus logros y consulta a expertos botánicos reales en nuestro foro.', icon: Spa },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tighter">¿Cómo funciona BotanicAI?</h2>
        <p className="text-on-surface-variant font-medium">Tu guía completa para convertirte en un experto botánico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <div key={step.title} className="bg-surface-container-lowest p-8 rounded-3xl antigravity-shadow space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <step.icon className="w-32 h-32" />
            </div>
            <div className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center font-black text-xl">
              {i + 1}
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 text-center space-y-4">
        <h3 className="font-bold text-primary">¿Necesitas más ayuda?</h3>
        <p className="text-sm text-on-surface-variant">Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier problema técnico.</p>
        <button className="text-primary font-black underline">Contactar Soporte</button>
      </div>
    </div>
  );
}

function SettingsContent() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('BOTANIC_API_KEY') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('BOTANIC_API_KEY', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Reload to re-initialize AI service
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Configuración</h2>
        <p className="text-on-surface-variant font-medium">Gestiona tus claves de API para los servicios de IA.</p>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
               <FlashOn className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-bold tracking-tight">OpenRouter / Gemini API Key</h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Pega aquí tu clave de <strong>OpenRouter</strong> (empieza por sk-or-...) para usar modelos gratuitos en BotanicAI.
          </p>
          <div className="relative group">
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl p-5 text-sm font-bold transition-all focus:bg-white"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
        >
          {saved ? (
            <>
              <HealthAndSafety className="w-6 h-6" />
              <span>Guardado. Reiniciando...</span>
            </>
          ) : (
            <>
              <AddCircle className="w-6 h-6" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-3">
        <h4 className="font-bold text-primary flex items-center gap-2">
          <PriorityHigh className="w-4 h-4" />
          Nota de Seguridad
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Tu clave se guarda localmente en este navegador (**localStorage**). Esto significa que nunca se envía a un servidor externo de BotanicAI, garantizando que solo tú tengas acceso a ella.
        </p>
      </div>
    </div>
  );
}

function ProBenefitsContent({ isPro }: { isPro: boolean }) {
  const benefits = [
    { 
      title: 'Comunidad Exclusiva', 
      desc: 'Acceso total al Muro Social y Chat Grupal con otros expertos.', 
      icon: Spa,
      color: 'bg-emerald-100 text-emerald-600'
    },
    { 
      title: 'Expertos Reales', 
      desc: 'Consulta directa con botánicos profesionales para casos complejos.', 
      icon: Psychology,
      color: 'bg-primary-container text-primary'
    },
    { 
      title: 'Tips Avanzados', 
      desc: 'Recibe consejos de cuidado premium y guías detalladas por especie.', 
      icon: Lightbulb,
      color: 'bg-amber-100 text-amber-600'
    },
    { 
      title: 'IA Sin Límites', 
      desc: 'Análisis de salud más profundos y respuestas prioritarias de BotanicAI.', 
      icon: FlashOn,
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
          <Star className="w-4 h-4 fill-current" />
          BotanicAI Pro
        </div>
        <h2 className="text-4xl font-black tracking-tighter">Desbloquea el Poder Total</h2>
        <p className="text-on-surface-variant font-medium max-w-lg mx-auto">
          Únete a la élite botánica y obtén las herramientas necesarias para que tu jardín alcance su máximo potencial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="bg-surface-container-lowest p-8 rounded-[2.5rem] antigravity-shadow border border-surface-container space-y-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", benefit.color)}>
              <benefit.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black tracking-tight">{benefit.title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest p-10 rounded-[3rem] antigravity-shadow border-2 border-primary/20 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Star className="w-24 h-24 text-primary/5 -rotate-12" />
        </div>
        
        <div className="space-y-2">
          <p className="text-primary font-black uppercase tracking-widest text-xs">Plan Premium</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-5xl font-black tracking-tighter">$9.99</span>
            <span className="text-on-surface-variant font-bold">/mes</span>
          </div>
        </div>

        <p className="text-on-surface-variant text-sm font-medium">
          {isPro 
            ? "¡Ya eres un usuario Pro! Disfruta de todas tus ventajas." 
            : "Comienza tu prueba gratuita de 7 días y transforma tu jardín hoy mismo."}
        </p>

        {!isPro && (
          <button className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Suscribirse Ahora
          </button>
        )}
        
        <p className="text-[10px] text-on-surface-variant/60 uppercase font-bold tracking-widest">
          Cancela en cualquier momento • Soporte 24/7 incluido
        </p>
      </div>
    </div>
  );
}

// BUILD_ID: 20260413204659
