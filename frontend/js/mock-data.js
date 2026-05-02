// Mock creatives — replaces the backend until we build it.
// Locations are around Pretoria, South Africa.
// Some have avatars (testing photo state), some don't (testing fallback shape).
// pravatar.cc is a free placeholder portrait service for prototypes.

const MOCK_CREATIVES = [
  { id: 1,  name: 'Thando M.',  category: 'photographer', lat: -25.7461, lng: 28.1881, distance: 0.4, avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 2,  name: 'Lerato K.',  category: 'designer',     lat: -25.7521, lng: 28.1936, distance: 0.8, avatar: null },
  { id: 3,  name: 'Sipho N.',   category: 'musician',     lat: -25.7398, lng: 28.1812, distance: 1.2, avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 4,  name: 'Naledi P.',  category: 'videographer', lat: -25.7585, lng: 28.2019, distance: 1.5, avatar: null },
  { id: 5,  name: 'Kabelo D.',  category: 'uiux',         lat: -25.7434, lng: 28.1745, distance: 0.9, avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: 6,  name: 'Amahle B.',  category: 'writer',       lat: -25.7612, lng: 28.1890, distance: 1.8, avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 7,  name: 'Tshepo R.',  category: 'marketer',     lat: -25.7472, lng: 28.2087, distance: 2.1, avatar: null },
  { id: 8,  name: 'Bongiwe S.', category: 'photographer', lat: -25.7350, lng: 28.1955, distance: 1.6, avatar: 'https://i.pravatar.cc/150?img=23' },
  { id: 9,  name: 'Mandla J.',  category: 'designer',     lat: -25.7689, lng: 28.1768, distance: 2.7, avatar: null },
  { id: 10, name: 'Zanele V.',  category: 'musician',     lat: -25.7301, lng: 28.2042, distance: 2.4, avatar: 'https://i.pravatar.cc/150?img=44' }
];