/* questions.js
   Derrick C Byron Cinematic 24 7 Trivia
   Generates a balanced 2000 question bank automatically
   Your index.html should use TRIVIA_BANK as the source
*/

(function () {
  "use strict";

  // Seeded RNG so the shuffle is stable per load but still feels fresh
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a += 0x6D2B79F5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromNow() {
    const now = new Date();
    // changes a little each hour so it rotates across the day
    const base =
      now.getUTCFullYear() * 1000000 +
      (now.getUTCMonth() + 1) * 10000 +
      now.getUTCDate() * 100 +
      now.getUTCHours();
    return base >>> 0;
  }

  function shuffleInPlace(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function pickOne(arr, rnd) {
    return arr[Math.floor(rnd() * arr.length)];
  }

  function pickUnique(arr, count, rnd, bannedSet) {
    const out = [];
    const seen = new Set();
    const banned = bannedSet || new Set();

    // gentle guard to avoid infinite loops
    let guard = 0;
    while (out.length < count && guard < 5000) {
      guard++;
      const v = pickOne(arr, rnd);
      if (seen.has(v)) continue;
      if (banned.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  }

  function makeMCQ(category, question, answers, correctIndex) {
    return {
      category: String(category),
      question: String(question),
      answers: answers.map(String),
      correct: correctIndex
    };
  }

  // Core pools
  const SPACE_OBJECTS = [
    "Planet",
    "Moon",
    "Dwarf planet",
    "Comet",
    "Asteroid",
    "Galaxy",
    "Nebula",
    "Star",
    "Black hole",
    "Constellation"
  ];

  const PLANETS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  const DWARF_PLANETS = ["Pluto", "Ceres", "Eris", "Haumea", "Makemake"];
  const MOONS = ["Moon", "Europa", "Io", "Ganymede", "Callisto", "Titan", "Enceladus", "Triton", "Phobos", "Deimos"];
  const GALAXIES = ["Milky Way", "Andromeda", "Triangulum"];
  const STARS = ["Sun", "Sirius", "Vega", "Betelgeuse", "Polaris", "Rigel", "Proxima Centauri"];
  const SPACE_TERMS = [
    "Light year",
    "Astronomical unit",
    "Orbit",
    "Gravity",
    "Eclipse",
    "Supernova",
    "Nebula",
    "Red giant",
    "White dwarf",
    "Exoplanet"
  ];

  const SCIENCE_TERMS = [
    "Atom",
    "Molecule",
    "Element",
    "Gravity",
    "Friction",
    "Energy",
    "Mass",
    "Velocity",
    "Acceleration",
    "Electric current",
    "Voltage",
    "DNA",
    "Cell",
    "Mitochondria"
  ];

  const ELEMENTS = [
    { name: "Hydrogen", sym: "H" },
    { name: "Helium", sym: "He" },
    { name: "Carbon", sym: "C" },
    { name: "Nitrogen", sym: "N" },
    { name: "Oxygen", sym: "O" },
    { name: "Sodium", sym: "Na" },
    { name: "Chlorine", sym: "Cl" },
    { name: "Iron", sym: "Fe" },
    { name: "Copper", sym: "Cu" },
    { name: "Silver", sym: "Ag" },
    { name: "Gold", sym: "Au" }
  ];

  const MUSIC_INSTRUMENTS = [
    "Electric guitar",
    "Acoustic guitar",
    "Bass guitar",
    "Piano",
    "Keyboard",
    "Drums",
    "Snare drum",
    "Violin",
    "Cello",
    "Saxophone",
    "Trumpet",
    "Flute"
  ];

  const MUSIC_TERMS = [
    "Tempo",
    "Rhythm",
    "Melody",
    "Harmony",
    "Chord",
    "Scale",
    "Beat",
    "Crescendo",
    "Forte",
    "Piano"
  ];

  const MUSIC_GENRES = [
    "Rock",
    "Metal",
    "Pop",
    "Hip hop",
    "Jazz",
    "Classical",
    "EDM",
    "Reggae",
    "Blues",
    "Country"
  ];

  const FILM_TERMS = [
    "Director",
    "Producer",
    "Screenplay",
    "Soundtrack",
    "Cinematography",
    "Trailer",
    "Sequel",
    "Prequel",
    "Reboot",
    "Franchise"
  ];

  const FILM_GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Thriller",
    "Sci fi",
    "Fantasy",
    "Mystery",
    "Documentary",
    "Animation"
  ];

  const WORLD = {
    continents: ["Africa", "Antarctica", "Asia", "Europe", "North America", "South America", "Australia"],
    oceans: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Southern Ocean"],
    landmarks: ["Great Wall of China", "Eiffel Tower", "Colosseum", "Machu Picchu", "Taj Mahal", "Statue of Liberty"],
    countries: [
      "United States",
      "Canada",
      "Mexico",
      "Brazil",
      "Argentina",
      "United Kingdom",
      "France",
      "Germany",
      "Italy",
      "Spain",
      "Japan",
      "South Korea",
      "China",
      "India",
      "Australia",
      "New Zealand",
      "South Africa",
      "Egypt",
      "Turkey",
      "Greece"
    ],
    capitals: [
      { c: "United States", cap: "Washington, DC" },
      { c: "Canada", cap: "Ottawa" },
      { c: "Mexico", cap: "Mexico City" },
      { c: "Brazil", cap: "Brasilia" },
      { c: "Argentina", cap: "Buenos Aires" },
      { c: "United Kingdom", cap: "London" },
      { c: "France", cap: "Paris" },
      { c: "Germany", cap: "Berlin" },
      { c: "Italy", cap: "Rome" },
      { c: "Spain", cap: "Madrid" },
      { c: "Japan", cap: "Tokyo" },
      { c: "South Korea", cap: "Seoul" },
      { c: "China", cap: "Beijing" },
      { c: "India", cap: "New Delhi" },
      { c: "Australia", cap: "Canberra" },
      { c: "New Zealand", cap: "Wellington" },
      { c: "South Africa", cap: "Pretoria" },
      { c: "Egypt", cap: "Cairo" },
      { c: "Turkey", cap: "Ankara" },
      { c: "Greece", cap: "Athens" }
    ]
  };

  const HISTORY = {
    civilizations: ["Ancient Egypt", "Ancient Greece", "Ancient Rome", "Maya", "Inca", "Aztec", "Persian Empire"],
    concepts: ["Renaissance", "Industrial Revolution", "Cold War", "Middle Ages", "Age of Exploration"],
    inventions: ["Printing press", "Telephone", "Airplane", "Internet", "Steam engine"]
  };

  // Generic safe questions that do not depend on deep facts
  function qWhichIsFromList(category, prompt, correctList, wrongLists, rnd) {
    const correct = pickOne(correctList, rnd);
    const banned = new Set([correct]);

    const wrongPool = [].concat(...wrongLists);
    const wrongs = pickUnique(wrongPool, 3, rnd, banned);

    const answers = [correct].concat(wrongs);
    shuffleInPlace(answers, rnd);

    const correctIndex = answers.indexOf(correct);
    return makeMCQ(category, prompt, answers, correctIndex);
  }

  function qElementSymbol(rnd) {
    const e = pickOne(ELEMENTS, rnd);
    const correct = e.sym;
    const banned = new Set([correct]);

    const symbolPool = ELEMENTS.map(x => x.sym);
    const wrongs = pickUnique(symbolPool, 3, rnd, banned);

    const answers = [correct].concat(wrongs);
    shuffleInPlace(answers, rnd);

    return makeMCQ(
      "Science",
      "What is the chemical symbol for " + e.name + "?",
      answers,
      answers.indexOf(correct)
    );
  }

  function qCapital(rnd) {
    const pair = pickOne(WORLD.capitals, rnd);
    const correct = pair.cap;
    const banned = new Set([correct]);

    const caps = WORLD.capitals.map(x => x.cap);
    const wrongs = pickUnique(caps, 3, rnd, banned);

    const answers = [correct].concat(wrongs);
    shuffleInPlace(answers, rnd);

    return makeMCQ(
      "World facts",
      "What is the capital of " + pair.c + "?",
      answers,
      answers.indexOf(correct)
    );
  }

  function qSpaceClassification(rnd) {
    // Example: "Which of these is a planet?"
    const types = ["planet", "dwarf planet", "moon", "star", "galaxy"];
    const t = pickOne(types, rnd);

    let correctList = PLANETS;
    let wrong1 = DWARF_PLANETS;
    let wrong2 = MOONS;
    let wrong3 = STARS;

    if (t === "dwarf planet") {
      correctList = DWARF_PLANETS;
      wrong1 = PLANETS;
      wrong2 = MOONS;
      wrong3 = STARS;
    } else if (t === "moon") {
      correctList = MOONS;
      wrong1 = PLANETS;
      wrong2 = DWARF_PLANETS;
      wrong3 = STARS;
    } else if (t === "star") {
      correctList = STARS;
      wrong1 = PLANETS;
      wrong2 = MOONS;
      wrong3 = DWARF_PLANETS;
    } else if (t === "galaxy") {
      correctList = GALAXIES;
      wrong1 = STARS;
      wrong2 = PLANETS;
      wrong3 = MOONS;
    }

    return qWhichIsFromList(
      "Space",
      "Which of these is a " + t + "?",
      correctList,
      [wrong1, wrong2, wrong3],
      rnd
    );
  }

  function qMusicClassification(rnd) {
    const types = ["instrument", "music term", "music genre"];
    const t = pickOne(types, rnd);

    if (t === "instrument") {
      return qWhichIsFromList(
        "Music",
        "Which of these is a musical instrument?",
        MUSIC_INSTRUMENTS,
        [MUSIC_TERMS, MUSIC_GENRES, FILM_GENRES],
        rnd
      );
    }

    if (t === "music term") {
      return qWhichIsFromList(
        "Music",
        "Which of these is a music term?",
        MUSIC_TERMS,
        [MUSIC_INSTRUMENTS, MUSIC_GENRES, FILM_TERMS],
        rnd
      );
    }

    return qWhichIsFromList(
      "Music",
      "Which of these is a music genre?",
      MUSIC_GENRES,
      [MUSIC_INSTRUMENTS, MUSIC_TERMS, FILM_GENRES],
      rnd
    );
  }

  function qFilmClassification(rnd) {
    const types = ["film term", "film genre"];
    const t = pickOne(types, rnd);

    if (t === "film term") {
      return qWhichIsFromList(
        "Film",
        "Which of these is a film production term?",
        FILM_TERMS,
        [MUSIC_TERMS, MUSIC_GENRES, SCIENCE_TERMS],
        rnd
      );
    }

    return qWhichIsFromList(
      "Film",
      "Which of these is a film genre?",
      FILM_GENRES,
      [MUSIC_GENRES, MUSIC_TERMS, SCIENCE_TERMS],
      rnd
    );
  }

  function qWorldClassification(rnd) {
    const types = ["continent", "ocean", "landmark"];
    const t = pickOne(types, rnd);

    if (t === "continent") {
      return qWhichIsFromList(
        "World facts",
        "Which of these is a continent?",
        WORLD.continents,
        [WORLD.oceans, WORLD.countries, HISTORY.civilizations],
        rnd
      );
    }

    if (t === "ocean") {
      return qWhichIsFromList(
        "World facts",
        "Which of these is an ocean?",
        WORLD.oceans,
        [WORLD.continents, WORLD.countries, HISTORY.concepts],
        rnd
      );
    }

    return qWhichIsFromList(
      "World facts",
      "Which of these is a famous landmark?",
      WORLD.landmarks,
      [WORLD.countries, WORLD.continents, HISTORY.inventions],
      rnd
    );
  }

  function qHistoryClassification(rnd) {
    const types = ["civilization", "history era", "invention"];
    const t = pickOne(types, rnd);

    if (t === "civilization") {
      return qWhichIsFromList(
        "History",
        "Which of these is an ancient civilization or empire?",
        HISTORY.civilizations,
        [WORLD.countries, WORLD.landmarks, MUSIC_GENRES],
        rnd
      );
    }

    if (t === "history era") {
      return qWhichIsFromList(
        "History",
        "Which of these is a historical era or period?",
        HISTORY.concepts,
        [WORLD.oceans, MUSIC_TERMS, SPACE_TERMS],
        rnd
      );
    }

    return qWhichIsFromList(
      "History",
      "Which of these is a major invention?",
      HISTORY.inventions,
      [WORLD.landmarks, MUSIC_INSTRUMENTS, SPACE_OBJECTS],
      rnd
    );
  }

  function generateBank(size) {
    const rnd = mulberry32(seedFromNow());
    const bank = [];
    const seen = new Set();

    const makers = [
      () => qSpaceClassification(rnd),
      () => qMusicClassification(rnd),
      () => qFilmClassification(rnd),
      () => qWorldClassification(rnd),
      () => qHistoryClassification(rnd),
      () => qElementSymbol(rnd),
      () => qCapital(rnd)
    ];

    // Balanced rotation across makers
    let i = 0;
    let guard = 0;

    while (bank.length < size && guard < size * 50) {
      guard++;

      const q = makers[i % makers.length]();
      i++;

      // de dupe by question string plus answers
      const key = q.category + "|" + q.question + "|" + q.answers.join("|") + "|" + q.correct;
      if (seen.has(key)) continue;
      seen.add(key);

      bank.push(q);
    }

    // Final shuffle so categories still feel mixed
    shuffleInPlace(bank, rnd);
    return bank;
  }

  // Generate the final 2000 question bank
  window.TRIVIA_BANK = generateBank(2000);
})();
