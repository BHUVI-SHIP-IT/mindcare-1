import { User, JournalEntry, Session, Review } from '../types';

// Local storage utilities
export const storage = {
  // User data
  getUser: (): User | null => {
    const userData = localStorage.getItem('mindcare_user');
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem('mindcare_user', JSON.stringify(user));
  },

  // Journal entries
  getJournalEntries: (): JournalEntry[] => {
    const entries = localStorage.getItem('mindcare_journal');
    return entries ? JSON.parse(entries) : [];
  },

  addJournalEntry: (entry: JournalEntry): void => {
    const entries = storage.getJournalEntries();
    entries.push(entry);
    localStorage.setItem('mindcare_journal', JSON.stringify(entries));
  },

  // Sessions
  getSessions: (): Session[] => {
    const sessions = localStorage.getItem('mindcare_sessions');
    return sessions ? JSON.parse(sessions) : [];
  },

  addSession: (session: Session): void => {
    const sessions = storage.getSessions();
    sessions.push(session);
    localStorage.setItem('mindcare_sessions', JSON.stringify(sessions));
  },

  // Reviews
  getReviews: (): Review[] => {
    const reviews = localStorage.getItem('mindcare_reviews');
    return reviews ? JSON.parse(reviews) : [];
  },

  addReview: (review: Review): void => {
    const reviews = storage.getReviews();
    reviews.push(review);
    localStorage.setItem('mindcare_reviews', JSON.stringify(reviews));
  },

  // Coins
  updateCoins: (coins: number): void => {
    const user = storage.getUser();
    if (user) {
      user.coins = Math.max(0, coins);
      storage.setUser(user);
    }
  },

  // Language preference
  getLanguage: (): string => {
    return localStorage.getItem('mindcare_language') || 'en';
  },

  setLanguage: (language: string): void => {
    localStorage.setItem('mindcare_language', language);
  }
};

// Initialize default user if none exists
export const initializeUser = (): User => {
  let user = storage.getUser();
  if (!user) {
    user = {
      id: Date.now().toString(),
      name: 'User',
      email: '',
      language: 'en',
      coins: 20, // Starting coins
      joinDate: new Date()
    };
    storage.setUser(user);
  }
  return user;
};