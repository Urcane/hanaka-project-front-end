export const standardSizes = [
  { id: 'size-16', label: '16', fullLabel: 'Ukuran 16 cm', price: 120000 },
  { id: 'size-18', label: '18', fullLabel: 'Ukuran 18 cm', price: 170000 },
  { id: 'size-20', label: '20', fullLabel: 'Ukuran 20 cm', price: 220000 },
  { id: 'size-22', label: '22', fullLabel: 'Ukuran 22 cm', price: 270000 },
]

export const cakeCatalog = [
  {
    id: 'black-forest',
    name: 'Black Forest Cake',
    shortDescription:
      'Manis, lembut, dengan perpaduan cokelat, krim, dan alsen segar dari ceri.',
    longDescription:
      'Tekstur lembut dan rasa cokelat yang kaya berpadu dengan krim segar. Lapisan ceri di atasnya memberikan rasa manis dan segar yang seimbang, menjadikannya kue klasik yang sempurna untuk berbagai momen.',
    featured: true,
    coverGradient: 'linear-gradient(135deg, #8a5a44 0%, #bc8b73 100%)',
    sizes: standardSizes,
    maxMessageLength: 60,
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet Cake',
    shortDescription:
      'Manis, lembut, sedikit cokelat dengan sentuhan keju krim yang gurih.',
    longDescription:
      'Tekstur lembut dan rasa manis ringan berpadu sentuhan cokelat. Lapisan krim keju di atasnya memberikan rasa gurih dan creamy yang seimbang, menjadikannya kue yang elegan dan istimewa untuk berbagai momen.',
    featured: true,
    coverGradient: 'linear-gradient(135deg, #d38182 0%, #f0b1a6 100%)',
    sizes: standardSizes,
    maxMessageLength: 60,
  },
  {
    id: 'vanilla-cake',
    name: 'Vanila Cake',
    shortDescription: 'Sponge vanilla ringan dengan buttercream silky.',
    longDescription:
      'Sponge vanilla yang ringan dan lembut dengan lapisan buttercream silky. Rasa klasik yang selalu disukai, cocok untuk segala acara.',
    featured: false,
    coverGradient: 'linear-gradient(135deg, #f7e9d5 0%, #f3d7bb 100%)',
    sizes: standardSizes,
    maxMessageLength: 60,
  },
  {
    id: 'lemon-cake',
    name: 'Lemon Cake',
    shortDescription: 'Rasa lemon segar dengan frosting cream cheese ringan.',
    longDescription:
      'Cake lemon yang segar dengan frosting cream cheese ringan. Perpaduan rasa asam manis yang menyegarkan, cocok untuk pecinta citrus.',
    featured: false,
    coverGradient: 'linear-gradient(135deg, #f5e6a3 0%, #e8d77b 100%)',
    sizes: standardSizes,
    maxMessageLength: 60,
  },
  {
    id: 'rainbow-cake',
    name: 'Rainbow Cake',
    shortDescription: 'Cake warna-warni yang ceria dengan rasa vanilla lembut.',
    longDescription:
      'Cake berlapis warna-warni yang ceria dengan rasa vanilla lembut di setiap lapisannya. Pilihan sempurna untuk acara ulang tahun anak-anak.',
    featured: false,
    coverGradient: 'linear-gradient(135deg, #f5a3a3 0%, #a3d5f5 50%, #a3f5c4 100%)',
    sizes: standardSizes,
    maxMessageLength: 60,
  },
]

export const storeProfile = {
  name: 'Hanaka Cake',
  address:
    'Jl. DR. Sukono Rt 09 No 11, Karang Rejo, Balikpapan Kota, Kalimantan Timur. 76124',
  operationalHours: '07.00 AM - 11.00 PM',
  pickupInfo: 'Pengambilan tersedia setiap hari, 07.00 - 23.00 WITA',
  whatsappNumber: '6281299998888',
  whatsappLabel: '0812-9999-8888',
  instagramHandle: 'hanakacake.id',
}
