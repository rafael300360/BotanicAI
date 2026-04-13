export interface UserProfile {
  uid: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  photoURL?: string;
  username?: string;
  country?: string;
  phoneNumber?: string;
  createdAt: string;
  isPremium: boolean;
  expertPoints: number;
  role: 'user' | 'expert' | 'admin';
}

export interface Plant {
  id: string;
  ownerUid: string;
  name: string;
  species: string;
  room: string; // "Living", "Jardín", "Balcón", etc.
  location: string;
  health: number;
  humidity: number;
  lastWatered: string;
  nextWatering: string;
  imageUrl: string;
  createdAt: string;
  lightLevel?: string;
  temperature?: string;
  characteristics?: string;
  plantingTime?: string;
  care?: string;
  transplantInfo?: string;
  isToxicToPets?: boolean;
  isToxicToHumans?: boolean;
  proData?: {
    etc?: number; // Evapotranspiración
    tensiometer?: number;
    soilProbe?: number;
    nutrientDeficiency?: string;
    nutrientAnalysis?: string;
  };
}

export interface Scan {
  id: string;
  ownerUid: string;
  imageUrl: string;
  speciesOptions: {
    name: string;
    confidence: number;
    commonName?: string;
    taxonomy?: string; // APG IV
    characteristics?: string;
    plantingTime?: string;
    care?: string;
    transplantInfo?: string;
  }[];
  diagnosis?: string;
  recommendations?: string;
  toxicityAlert?: string;
  nutrientAnalysis?: string;
  timestamp: string;
  isOffline?: boolean;
  vigorIndex?: number; // Índice de vigor (0-100)
  vpd?: number; // Déficit de presión vapor (kPa)
  par?: number; // Radiación fotosintética (μmol/m²/s)
}

export interface CommunityPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  imageUrl?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category?: 'Diagnóstico' | 'Cuidados' | 'Decoración' | 'General';
}

export interface ExpertQuery {
  id: string;
  userUid: string;
  scanId: string;
  status: 'pending' | 'answered';
  expertResponse?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  ownerUid: string;
  plantId: string;
  type: 'watering' | 'rotation' | 'fertilizing' | 'pruning' | 'transplant';
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface PostLike {
  userId: string;
  postId: string;
  timestamp: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  timestamp: string;
}

export interface PlantTip {
  id: string;
  species: string;
  content: string;
  authorUid: string;
  authorName: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageAuthorUid?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  timestamp: any; // serverTimestamp
}
