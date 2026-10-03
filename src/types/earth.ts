export interface GeoLocation {
  id: string;
  name: string;
  nameUrdu: string;
  country: string;
  countryUrdu: string;
  lat: number;
  lng: number;
  population: string;
  timezone: string;
  tempC: number;
  weatherCondition: string;
  strategicNote: string;
  strategicNoteUrdu: string;
}

export interface SatelliteAsset {
  id: string;
  name: string;
  noradId: number;
  orbitType: 'LEO' | 'GEO' | 'MEO';
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  operator: string;
  mission: string;
  color: string;
}

export type GlobeViewMode = 'photoreal' | 'holographic' | 'meteorology' | 'satellites';

export interface GlobeState {
  targetLat: number;
  targetLng: number;
  targetZoom: number; // 2.5 (far) to 1.3 (close)
  autoRotate: boolean;
  rotationSpeed: number;
  viewMode: GlobeViewMode;
  selectedLocation: GeoLocation | null;
  selectedSatellite: SatelliteAsset | null;
  showSatellites: boolean;
  showClouds: boolean;
  showAtmosphere: boolean;
  showGrid: boolean;
}

export const CITIES_DATABASE: GeoLocation[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameUrdu: 'ٹوکیو',
    country: 'Japan',
    countryUrdu: 'جاپان',
    lat: 35.6762,
    lng: 139.6503,
    population: '37.4 Million',
    timezone: 'UTC+9 (JST)',
    tempC: 19,
    weatherCondition: 'Clear skies, mild coastal breeze',
    strategicNote: 'High-density megacity & major technological Pacific hub.',
    strategicNoteUrdu: 'بحر الکاہل کا اہم ترین صنعتی اور تکنیکی مرکز۔',
  },
  {
    id: 'karachi',
    name: 'Karachi',
    nameUrdu: 'کراچی',
    country: 'Pakistan',
    countryUrdu: 'پاکستان',
    lat: 24.8607,
    lng: 67.0011,
    population: '16.8 Million',
    timezone: 'UTC+5 (PKT)',
    tempC: 31,
    weatherCondition: 'Humid, Arabian Sea maritime wind 14 kt',
    strategicNote: 'Primary deep-water seaport & Arabian Sea trade artery.',
    strategicNoteUrdu: 'بحیرہ عرب کی اہم تجارتی اور سمندری بندرگاہ۔',
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    nameUrdu: 'اسلام آباد',
    country: 'Pakistan',
    countryUrdu: 'پاکستان',
    lat: 33.6844,
    lng: 73.0479,
    population: '1.2 Million',
    timezone: 'UTC+5 (PKT)',
    tempC: 24,
    weatherCondition: 'Sunny, Margalla Hills mountain air',
    strategicNote: 'Federal administrative capital & strategic command sector.',
    strategicNoteUrdu: 'وفاقی دارالحکومت اور تزویراتی کمانڈ مرکز۔',
  },
  {
    id: 'lahore',
    name: 'Lahore',
    nameUrdu: 'لاہور',
    country: 'Pakistan',
    countryUrdu: 'پاکستان',
    lat: 31.5204,
    lng: 74.3587,
    population: '13.5 Million',
    timezone: 'UTC+5 (PKT)',
    tempC: 28,
    weatherCondition: 'Clear skies, visibility 8 km',
    strategicNote: 'Cultural epicenter & eastern transport crossroads.',
    strategicNoteUrdu: 'ثقافتی مرکز اور مشرقی مواصلاتی گزرگاہ۔',
  },
  {
    id: 'london',
    name: 'London',
    nameUrdu: 'لندن',
    country: 'United Kingdom',
    countryUrdu: 'برطانیہ',
    lat: 51.5074,
    lng: -0.1278,
    population: '9.5 Million',
    timezone: 'UTC+1 (BST)',
    tempC: 15,
    weatherCondition: 'Partly cloudy, Atlantic jet stream',
    strategicNote: 'European financial hub & Greenwich Prime Meridian marker.',
    strategicNoteUrdu: 'عالمی مالیاتی دارالحکومت اور گرینچ پرائم میریڈین مرکز۔',
  },
  {
    id: 'newyork',
    name: 'New York',
    nameUrdu: 'نیویارک',
    country: 'United States',
    countryUrdu: 'امریکہ',
    lat: 40.7128,
    lng: -74.0060,
    population: '19.8 Million',
    timezone: 'UTC-4 (EDT)',
    tempC: 18,
    weatherCondition: 'Overcast, Atlantic ocean breeze 10 mph',
    strategicNote: 'Global financial capital & international diplomatic gateway.',
    strategicNoteUrdu: 'عالمی تجارتی اور سفارتی مرکز۔',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    nameUrdu: 'دبئی',
    country: 'United Arab Emirates',
    countryUrdu: 'متحدہ عرب امارات',
    lat: 25.2048,
    lng: 55.2708,
    population: '3.6 Million',
    timezone: 'UTC+4 (GST)',
    tempC: 34,
    weatherCondition: 'Desert heat, Persian Gulf coastal haze',
    strategicNote: 'Middle Eastern aerospace & global aviation hub.',
    strategicNoteUrdu: 'مشرقِ وسطیٰ کا بین الاقوامی فضائی اور مالیاتی مرکز۔',
  },
  {
    id: 'mecca',
    name: 'Mecca',
    nameUrdu: 'مکہ مکرمہ',
    country: 'Saudi Arabia',
    countryUrdu: 'سعودی عرب',
    lat: 21.4225,
    lng: 39.8262,
    population: '2.1 Million',
    timezone: 'UTC+3 (AST)',
    tempC: 36,
    weatherCondition: 'Clear, dry desert atmospheric profile',
    strategicNote: 'Holiest city of Islam & global pilgrimage destination.',
    strategicNoteUrdu: 'عالمِ اسلام کا سب سے مقدس ترین روحانی مرکز۔',
  },
  {
    id: 'paris',
    name: 'Paris',
    nameUrdu: 'پیرس',
    country: 'France',
    countryUrdu: 'فرانس',
    lat: 48.8566,
    lng: 2.3522,
    population: '11.1 Million',
    timezone: 'UTC+2 (CEST)',
    tempC: 17,
    weatherCondition: 'Scattered clouds, light mist',
    strategicNote: 'Continental European nexus & diplomatic node.',
    strategicNoteUrdu: 'براعظم یورپ کا اہم سیاسی اور ثقافتی مرکز۔',
  },
  {
    id: 'beijing',
    name: 'Beijing',
    nameUrdu: 'بیجنگ',
    country: 'China',
    countryUrdu: 'چین',
    lat: 39.9042,
    lng: 116.4074,
    population: '21.5 Million',
    timezone: 'UTC+8 (CST)',
    tempC: 21,
    weatherCondition: 'Mild breeze from Bohai sea',
    strategicNote: 'East Asian superpower capital & infrastructure command.',
    strategicNoteUrdu: 'مشرقی ایشیا کا طاقتور دارالحکومت اور تجارتی ہیڈکوارٹر۔',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    nameUrdu: 'سڈنی',
    country: 'Australia',
    countryUrdu: 'آسٹریلیا',
    lat: -33.8688,
    lng: 151.2093,
    population: '5.3 Million',
    timezone: 'UTC+10 (AEST)',
    tempC: 22,
    weatherCondition: 'Sunny, South Pacific oceanic swell',
    strategicNote: 'Southern hemisphere maritime monitoring station.',
    strategicNoteUrdu: 'جنوبی نصف کرے کا اہم ترین سمندری اور شہری مرکز۔',
  },
  {
    id: 'cairo',
    name: 'Cairo',
    nameUrdu: 'قاہرہ',
    country: 'Egypt',
    countryUrdu: 'مصر',
    lat: 30.0444,
    lng: 31.2357,
    population: '22.1 Million',
    timezone: 'UTC+3 (EEST)',
    tempC: 29,
    weatherCondition: 'Dry heat, Nile valley microclimate',
    strategicNote: 'Suez Canal maritime transit oversight & African gateway.',
    strategicNoteUrdu: 'نہرِ سوئز اور افریقی خطے کا تزویراتی داخلی راستہ۔',
  },
];

export const SATELLITES_DATABASE: SatelliteAsset[] = [
  {
    id: 'iss',
    name: 'International Space Station (ISS)',
    noradId: 25544,
    orbitType: 'LEO',
    altitudeKm: 418,
    velocityKmS: 7.66,
    inclinationDeg: 51.6,
    operator: 'NASA / ESA / JAXA / CSA',
    mission: 'Habitable orbital microgravity research laboratory',
    color: '#00f3ff',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    noradId: 20580,
    orbitType: 'LEO',
    altitudeKm: 535,
    velocityKmS: 7.59,
    inclinationDeg: 28.5,
    operator: 'NASA / ESA',
    mission: 'Deep field optical astronomy & cosmological survey',
    color: '#ffb703',
  },
  {
    id: 'landsat9',
    name: 'Landsat 9 Earth Explorer',
    noradId: 49260,
    orbitType: 'LEO',
    altitudeKm: 705,
    velocityKmS: 7.50,
    inclinationDeg: 98.2,
    operator: 'USGS / NASA',
    mission: 'High-resolution multispectral planetary surface imaging',
    color: '#06d6a0',
  },
  {
    id: 'tiangong',
    name: 'Tiangong Space Station',
    noradId: 48274,
    orbitType: 'LEO',
    altitudeKm: 390,
    velocityKmS: 7.68,
    inclinationDeg: 41.5,
    operator: 'CNSA',
    mission: 'Permanent crewed space exploration station',
    color: '#ef233c',
  },
  {
    id: 'starlink',
    name: 'Starlink Constellation Mesh',
    noradId: 44713,
    orbitType: 'LEO',
    altitudeKm: 550,
    velocityKmS: 7.61,
    inclinationDeg: 53.0,
    operator: 'SpaceX',
    mission: 'Low-latency global broadband satellite telemetry',
    color: '#c084fc',
  },
];
