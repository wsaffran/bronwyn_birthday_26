export const MAP_START = {
  lat: 40.7726,
  lng: -73.926,
  zoom: 16,
}

export const MAP_MIN_ZOOM = 13
export const MAP_MAX_ZOOM = 19

/** Screen-pixel reach from the avatar (map center) to a pin's tip. */
export const PIN_OPEN_RADIUS_PX = 110

export const mapPins = [
  {
    id: 'long-island-city',
    // 40°44'50.4"N 73°57'29.2"W
    lat: 40 + 44 / 60 + 50.4 / 3600,
    lng: -(73 + 57 / 60 + 29.2 / 3600),
    title: 'Long Island City Date',
    photo: 'pins/long-island-city.jpg',
  },
  {
    id: 'city-acres',
    // 29-18 Queens Plaza S, Long Island City, NY 11101
    lat: 40.7490721,
    lng: -73.938124,
    title: 'City Acres & Food Market',
    photo: 'pins/city-acres.jpg',
  },
  {
    id: 'coffee-ave',
    // 34-56 33rd St, Astoria, NY 11106
    lat: 40.7576556,
    lng: -73.9269034,
    title: 'Coffee Ave Date',
  },
  {
    id: 'cafe-xochimilco',
    // 38-01 29th St, Long Island City, NY 11101
    lat: 40.7544429,
    lng: -73.9335482,
    title: 'Cafe Xochimilco',
  },
  {
    id: 'yanagi',
    // 38-01 31st St, Long Island City, NY 11101
    lat: 40.7536125,
    lng: -73.932023,
    title: 'Yanagi Sushi & Ramen',
  },
  {
    id: 'salsa-in-queens',
    // 32-04 38th Ave, Long Island City, NY 11101
    lat: 40.75313,
    lng: -73.93114,
    title: 'Salsa in Queens',
  },
  {
    id: 'darjeeling',
    // 31-12 36th Ave, Long Island City, NY 11106
    lat: 40.7562584,
    lng: -73.9293522,
    title: 'Darjeeling',
  },
  {
    id: 'mamas-empanadas',
    // 32-41 Steinway St, Astoria, NY 11103
    lat: 40.7578315,
    lng: -73.9197121,
    title: "Mama's Empanadas",
  },
  {
    id: 'malu',
    // 40-05 Broadway, Astoria, NY 11103
    lat: 40.759001,
    lng: -73.9185856,
    title: 'Malu',
  },
  {
    id: 'mrs-georgia',
    // 37-10 31st Avenue, Long Island City, NY 11103
    lat: 40.761733,
    lng: -73.918471,
    title: 'Mrs. Georgia',
  },
  {
    id: 'gaia-masala',
    // 33-11 Broadway, Astoria, NY 11106
    lat: 40.761218,
    lng: -73.923203,
    title: 'Gaia Masala',
  },
  {
    id: 'first-kiss',
    // 31-02 Steinway St, Astoria, NY 11103
    lat: 40.761299,
    lng: -73.91748,
    title: 'First Kiss',
  },
  {
    id: 'united-brothers-fruit-market',
    // 32-24 30th Ave., Astoria, NY 11102
    lat: 40.765993,
    lng: -73.920128,
    title: 'United Brothers Fruit Market',
  },
  {
    id: 'ambrosia-garden',
    // 29-11 23rd Ave, Astoria, NY 11105
    lat: 40.774971,
    lng: -73.913298,
    title: 'Ambrosia Garden',
  },
  {
    id: 'h-mart',
    // 48-18 Northern Blvd, Long Island City, NY 11101
    lat: 40.752505,
    lng: -73.914311,
    title: 'H-Mart',
  },
  {
    id: 'bella',
    // 32-30 Steinway St, Long Island City, NY 11103
    lat: 40.758326,
    lng: -73.919808,
    title: 'Bella',
  },
  {
    id: 'satori-laser',
    // 143 E 57th St Fl 2, New York, NY 10022
    lat: 40.760981,
    lng: -73.968573,
    title: 'Satori Laser',
  },
  {
    id: 'bergdorf-goodman',
    // 754 5th Ave, New York, NY 10019
    lat: 40.763683,
    lng: -73.973934,
    title: 'Bergdorf Goodman',
  },
  {
    id: 'mala-project',
    // 245 E 53rd St, New York, NY 10022
    lat: 40.757164,
    lng: -73.967634,
    title: 'MáLà Project',
  },
  {
    id: 'van-leeuwen',
    // 943 2nd Ave, New York, NY 10022
    lat: 40.755093,
    lng: -73.968718,
    title: 'Van Leeuwen',
  },
  {
    id: 'east-river-esplanade',
    // Park South, Sutton Pl S, New York, NY 10022
    lat: 40.75669,
    lng: -73.96021,
    title: 'East River Esplanade',
  },
  {
    id: 'bryant-park',
    // Bryant Park
    lat: 40.75382,
    lng: -73.98373,
    title: 'Bryant Park',
  },
  {
    id: 'moma',
    // 11 W 53rd St, New York, NY 10019
    lat: 40.761194,
    lng: -73.977013,
    title: 'MoMA',
  },
  {
    id: 'katagiri',
    // 370 Lexington Ave, New York, NY 10017
    lat: 40.750764,
    lng: -73.976959,
    title: 'Katagiri',
  },
  {
    id: 'grand-central',
    // Grand Central
    lat: 40.752732,
    lng: -73.977218,
    title: 'Grand Central',
  },
  {
    id: 'desi-galli',
    // 101 Lexington Ave, New York, NY 10016
    lat: 40.742088,
    lng: -73.982552,
    title: 'Desi Galli',
  },
  {
    id: 'gonzalez-y-gonzalez',
    // 192 Mercer St, New York, NY 10012
    lat: 40.726172,
    lng: -73.996787,
    title: 'Gonzalez y Gonzalez',
  },
  {
    id: 'washington-square-park',
    // Washington Square Park
    lat: 40.73089,
    lng: -73.9976,
    title: 'Washington Square Park',
  },
  {
    id: 'glur',
    // 144 W 19th St, New York, NY 10011
    lat: 40.741123,
    lng: -73.996709,
    title: 'Glur',
  },
  {
    id: 'chama-mama',
    // 149 W 14th St, New York, NY 10011
    lat: 40.7385,
    lng: -73.998853,
    title: 'Chama Mama',
  },
  {
    id: 'venchi',
    // 861 Broadway, New York, NY 10003
    lat: 40.737451,
    lng: -73.990432,
    title: 'Venchi',
  },
  {
    id: 'lenlen',
    // 40 E 20th St, New York, NY 10003
    lat: 40.738475,
    lng: -73.988599,
    title: 'LenLen',
  },
  {
    id: 'soothr',
    // 204 E 13th St, New York, NY 10003
    lat: 40.732282,
    lng: -73.98735,
    title: 'Soothr',
  },
  {
    id: 'brooklyn-bridge',
    // Brooklyn Bridge
    lat: 40.7062175,
    lng: -73.9970208,
    title: 'Brooklyn Bridge',
  },
  {
    id: 'outside-janes-carousel',
    // 1 Old, Dock St, Brooklyn, NY 11201
    lat: 40.704438,
    lng: -73.992384,
    title: "Outside Jane's Carousel",
  },
  {
    id: 'fishs-eddy',
    // 81 Front St, Brooklyn, NY 11201
    lat: 40.702772,
    lng: -73.990385,
    title: 'Fishs Eddy',
  },
  {
    id: 'kaya-bliss-dispensary',
    // 64 Henry St, Brooklyn, NY 11201
    lat: 40.699049,
    lng: -73.992495,
    title: 'Kaya Bliss Dispensary',
  },
  {
    id: 'ignazios',
    // 4 Water St, Brooklyn, NY 11201
    lat: 40.703139,
    lng: -73.993708,
    title: "Ignazio's",
  },
  {
    id: 'ramen-danbo',
    // 52 7th Ave, Brooklyn, NY 11217
    lat: 40.67614,
    lng: -73.974588,
    title: 'Ramen DANBO',
  },
  {
    id: 'prospect-park',
    // 40.66632818230466, -73.97001628831673
    lat: 40.66632818230466,
    lng: -73.97001628831673,
    title: 'Prospect Park',
  },
  {
    id: 'ras-plant-based',
    // 739 Franklin Ave, Brooklyn, NY 11238
    lat: 40.673417,
    lng: -73.956709,
    title: 'RAS Plant Based',
  },
  {
    id: 'lisbonata',
    // 619 St Johns Pl, Brooklyn, NY 11238
    lat: 40.672623,
    lng: -73.957671,
    title: 'Lisbonata',
  },
  {
    id: 'bagel-pub',
    // 775 Franklin Ave, Brooklyn, NY 11238
    lat: 40.672238,
    lng: -73.957103,
    title: 'Bagel Pub',
  },
  {
    id: 'mccarren-park-track',
    // 769 Lorimer St, Brooklyn, NY 11222
    lat: 40.72022,
    lng: -73.95065,
    title: 'McCarren Park Track',
  },
  {
    id: 'pierozek',
    // 592 Manhattan Ave, Brooklyn, NY 11222
    lat: 40.72305,
    lng: -73.95013,
    title: 'Pierozek',
  },
  {
    id: 'cibone-ote',
    // 50 Norman Ave, Brooklyn, NY 11222
    lat: 40.724619,
    lng: -73.953591,
    title: "CIBONE O'TE",
  },
  {
    id: 'caffe-panna',
    // 16 Norman Ave, Brooklyn, NY 11222
    lat: 40.724316,
    lng: -73.954629,
    title: 'Caffè Panna',
  },
  {
    id: 'twins-lounge',
    // 732 Manhattan Ave, Brooklyn, NY 11222
    lat: 40.726332,
    lng: -73.951933,
    title: 'Twins Lounge',
  },
  {
    id: 'hangawi',
    // 12 E 32nd St, New York, NY 10016
    lat: 40.746617,
    lng: -73.984752,
    title: 'Hangawi',
  },
  {
    id: 'queens-night-market',
    // 47-01 111th St, Corona, NY 11368
    lat: 40.747359,
    lng: -73.851695,
    title: 'Queens Night Market',
  },
  {
    id: 'hindu-temple-canteen',
    // 143-09 Holly Ave, Flushing, NY 11355
    lat: 40.752669,
    lng: -73.816449,
    title: 'Hindu Temple Canteen',
  },
  {
    id: 'cafe-w',
    // 35-29 154th St, Flushing, NY 11354
    lat: 40.76511,
    lng: -73.81062,
    title: 'Cafe W',
  },
  {
    id: 'bronwyns-apartment',
    // 31-18 41st St, Long Island City, NY 11103
    lat: 40.760568,
    lng: -73.91685,
    title: "Bronwyn's Apartment",
  },
  {
    id: 'long-kin-thai',
    // 500 Prospect Pl, Brooklyn, NY 11238
    lat: 40.675649,
    lng: -73.960029,
    title: 'Long Kin Thai',
  },
]

