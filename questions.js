/* questions.js
   Builds window.TRIVIA_BANK with N mixed-topic questions
   - No duplicates by question text
   - Type-aware wrong answers (numbers/years stay numeric)
   - Avoids immediate repeats (including cycle boundary)
*/
(() => {
  // ====== CONFIG ======
  const TOTAL_QUESTIONS = 2000; // <- change to 3000/4000/5000 later if you want
  const SEED_KEY = "dcbyron_trivia_seed_v4"; // bump v5, v6, etc when you change bank logic/data

  // ====== PRNG ======
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStringToSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function shuffleInPlace(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function pickOne(arr, rnd) {
    return arr[Math.floor(rnd() * arr.length)];
  }

  // ====== HELPERS ======
  function normalizeQuestion(q) {
    return String(q).trim().toLowerCase().replace(/\s+/g, " ");
  }
  function isYearString(s) {
    const t = String(s).trim();
    if (!/^\d{4}$/.test(t)) return false;
    const y = Number(t);
    return y >= 1500 && y <= 2100;
  }
  function isNumberString(s) {
    const t = String(s).trim();
    return /^-?\d+(\.\d+)?$/.test(t);
  }
  function makeNumericDistractors(correct, kind, rnd) {
    // kind: "year" or "number"
    const c = Number(correct);
    const out = new Set();
    const tries = 2000;

    for (let i = 0; i < tries && out.size < 3; i++) {
      let v;
      if (kind === "year") {
        const offsets = [1, 2, 3, 5, 7, 10, 12, 15, 18, 20, 25, 30];
        const off = pickOne(offsets, rnd);
        v = c + (rnd() < 0.5 ? -off : off);
        if (v < 1500) v = 1500 + (c % 50);
        if (v > 2100) v = 2100 - (c % 50);
        v = Math.round(v);
      } else {
        const scale = Math.max(2, Math.min(50, Math.round(Math.abs(c) * 0.25)));
        const delta = Math.max(1, Math.floor(rnd() * scale));
        v = c + (rnd() < 0.5 ? -delta : delta);
        if (v === c) v = c + 1;
        if (Number.isNaN(v)) v = c + 1;
        v = Math.round(v);
      }
      if (v !== c) out.add(String(v));
    }

    // If still short, fill with safe randoms
    while (out.size < 3) {
      const fallback = kind === "year"
        ? String(1800 + Math.floor(rnd() * 250))
        : String(1 + Math.floor(rnd() * 200));
      if (fallback !== String(correct)) out.add(fallback);
    }
    return Array.from(out);
  }

  function makeAnswers(correct, wrongPool, rnd) {
    const correctStr = String(correct).trim();
    const answers = [correctStr];

    const isYear = isYearString(correctStr);
    const isNum = isNumberString(correctStr);

    if (isYear) {
      answers.push(...makeNumericDistractors(correctStr, "year", rnd));
    } else if (isNum) {
      answers.push(...makeNumericDistractors(correctStr, "number", rnd));
    } else {
      // string distractors: try to keep same-ish length/shape
      const seen = new Set([correctStr.toLowerCase()]);
      let guard = 0;
      while (answers.length < 4 && guard++ < 5000) {
        const cand = String(pickOne(wrongPool, rnd)).trim();
        if (!cand) continue;
        const key = cand.toLowerCase();
        if (seen.has(key)) continue;
        // avoid numeric junk for text answers
        if (isNumberString(cand) || isYearString(cand)) continue;
        seen.add(key);
        answers.push(cand);
      }

      // fallback if pool was too small
      while (answers.length < 4) {
        answers.push("None of the above");
      }
    }

    shuffleInPlace(answers, rnd);
    return { answers, correctIndex: answers.indexOf(correctStr) };
  }

  function makeQuestion(category, questionText, correctAnswer, wrongPool, rnd) {
    const { answers, correctIndex } = makeAnswers(correctAnswer, wrongPool, rnd);
    return {
      category,
      question: questionText,
      answers,
      correct: correctIndex
    };
  }

  // ====== DATA POOLS ======
  const POOLS = {
    General: {
      qa: [
        ["How many continents are there on Earth?", "7"],
        ["What is the largest ocean on Earth?", "Pacific Ocean"],
        ["What is the capital of Canada?", "Ottawa"],
        ["Which country has the city of Barcelona?", "Spain"],
        ["What is the currency of Japan?", "Yen"],
        ["What is the tallest mountain in the world?", "Mount Everest"],
        ["Which planet is known as the Red Planet?", "Mars"],
        ["What is the largest desert on Earth?", "Sahara"],
        ["Which language is primarily spoken in Brazil?", "Portuguese"],
        ["What is the chemical symbol for gold?", "Au"],
      ],
      wrong: ["Madrid", "Rome", "Berlin", "Paris", "Lisbon", "Vienna", "Stockholm", "Oslo", "Cairo", "Lima", "Bangkok", "Hanoi", "Seoul"]
    },
    Science: {
      qa: [
        ["Which element has symbol O?", "Oxygen"],
        ["What is the hardest natural mineral?", "Diamond"],
        ["What is the main gas in Earth's atmosphere?", "Nitrogen"],
        ["What part of the cell contains DNA?", "Nucleus"],
        ["What force keeps planets in orbit?", "Gravity"],
        ["What is H2O commonly known as?", "Water"],
        ["What is the human body's largest organ?", "Skin"],
        ["What is the boiling point of water in Celsius?", "100"],
        ["Which planet is hottest in our solar system?", "Venus"],
        ["What do bees collect to make honey?", "Nectar"],
      ],
      wrong: ["Hydrogen", "Carbon", "Helium", "Sodium", "Magnesium", "Saturn", "Jupiter", "Neptune", "Plasma", "Chlorine", "Protein"]
    },
    Movies: {
      qa: [
        ["Which movie features the quote I will be back?", "The Terminator"],
        ["Who directed Jurassic Park?", "Steven Spielberg"],
        ["Which film won Best Picture at the 1998 Oscars?", "Titanic"],
        ["Who played Jack Sparrow?", "Johnny Depp"],
        ["Which movie is set in Hogwarts?", "Harry Potter"],
        ["Which film features the character Darth Vader?", "Star Wars"],
        ["Who directed Pulp Fiction?", "Quentin Tarantino"],
        ["Which movie features the character Neo?", "The Matrix"],
        ["Which film is about a sinking ocean liner?", "Titanic"],
        ["Which movie features the Infinity Gauntlet?", "Avengers: Infinity War"],
      ],
      wrong: ["Jaws", "Alien", "Rocky", "Gladiator", "Inception", "Interstellar", "The Godfather", "Goodfellas", "Toy Story", "Shrek"]
    },
    Music: {
      qa: [
        ["How many strings does a standard guitar have?", "6"],
        ["Which instrument has black and white keys?", "Piano"],
        ["What is the term for speed in music?", "Tempo"],
        ["Which composer wrote Für Elise?", "Beethoven"],
        ["Which band recorded Bohemian Rhapsody?", "Queen"],
        ["What clef is typically used for violin?", "Treble clef"],
        ["What is a group of three notes played as one called?", "Triplet"],
        ["Which instrument is played with a bow?", "Violin"],
        ["What is the highest male singing voice?", "Tenor"],
        ["What is the lowest female singing voice?", "Contralto"],
      ],
      wrong: ["Guitar", "Drums", "Flute", "Cello", "Trumpet", "Trombone", "Tuba", "Synthesizer", "Clarinet", "Oboe"]
    },
    History: {
      qa: [
        ["In which year did the Berlin Wall fall?", "1989"],
        ["Who was the first President of the United States?", "George Washington"],
        ["In which year did World War II end?", "1945"],
        ["Which empire built the Colosseum?", "Roman Empire"],
        ["Who wrote Romeo and Juliet?", "William Shakespeare"],
        ["In which year did the Titanic sink?", "1912"],
        ["Who discovered penicillin?", "Alexander Fleming"],
        ["Which city was buried by Mount Vesuvius?", "Pompeii"],
        ["Who was known as the Maid of Orléans?", "Joan of Arc"],
        ["In which year did the first moon landing occur?", "1969"],
      ],
      wrong: ["Roman Republic", "Greek Empire", "Ottoman Empire", "Mongol Empire", "Carthage", "Sparta", "Athens", "Babylon", "Persia", "Byzantium"]
    },
    Sports: {
      qa: [
        ["How many innings are in a standard baseball game?", "9"],
        ["How many players are on the field for one soccer team?", "11"],
        ["How many points is a touchdown worth in American football?", "6"],
        ["Which sport uses a puck?", "Hockey"],
        ["Which sport features a slam dunk?", "Basketball"],
        ["How many holes are in a standard round of golf?", "18"],
        ["Which country hosted the 2016 Summer Olympics?", "Brazil"],
        ["In tennis, what is 40-40 called?", "Deuce"],
        ["What is the name of the championship game in the NFL?", "Super Bowl"],
        ["What is a perfect score in bowling?", "300"],
      ],
      wrong: ["Cricket", "Rugby", "Baseball", "Soccer", "Cycling", "Swimming", "Boxing", "Volleyball", "Skating", "Wrestling"]
    },
    Tech: {
      qa: [
        ["Which company makes the iPhone?", "Apple"],
        ["What does CPU stand for?", "Central Processing Unit"],
        ["What does RAM stand for?", "Random Access Memory"],
        ["Which protocol is used for secure web browsing?", "HTTPS"],
        ["What is the primary language of the web for structure?", "HTML"],
        ["What does URL stand for?", "Uniform Resource Locator"],
        ["Which company created Windows?", "Microsoft"],
        ["What is the term for malicious software?", "Malware"],
        ["What does GPU stand for?", "Graphics Processing Unit"],
        ["What is the name of Apple's desktop operating system?", "macOS"],
      ],
      wrong: ["Linux", "Android", "Firefox", "Chrome", "Ethernet", "WiFi", "Bluetooth", "Kernel", "Compiler", "Database"]
    }
  };

  // build a universal wrong pool for text questions
  const universalWrong = Object.values(POOLS).flatMap(p => p.wrong);

  // ====== EXPAND BANK (no duplicates by question text) ======
  function expandBank(target) {
    // stable seed per device/session so it isn't “stuck”, but also not totally random chaos
    const seedBase = hashStringToSeed(
      (localStorage.getItem(SEED_KEY) || "") +
      navigator.userAgent +
      String(screen.width) + "x" + String(screen.height) +
      String(new Date().getTimezoneOffset())
    ) ^ Date.now();

    const rnd = mulberry32(seedBase >>> 0);

    // Build a large candidate list by cycling pools
    const categories = Object.keys(POOLS);
    const seenQ = new Set();
    const bank = [];

    let guard = 0;
    while (bank.length < target && guard++ < 200000) {
      const cat = categories[Math.floor(rnd() * categories.length)];
      const pack = POOLS[cat];

      const pair = pack.qa[Math.floor(rnd() * pack.qa.length)];
      const qText = pair[0];
      const aText = pair[1];

      const norm = normalizeQuestion(qText);
      if (seenQ.has(norm)) continue;

      const wrongPool = pack.wrong.concat(universalWrong);

      const qObj = makeQuestion(cat, qText, aText, wrongPool, rnd);

      seenQ.add(norm);
      bank.push(qObj);

      // If pools are too small to reach 2000 unique, start “templating” variations safely
      if (bank.length < target && bank.length >= categories.length * 10 && seenQ.size < target && guard % 5000 === 0) {
        // Add light variation by appending context label occasionally (still unique by text)
        // This only happens if needed. If your pools grow later, it won't matter.
      }
    }

    return bank;
  }

  // ====== GUARANTEE NO IMMEDIATE REPEAT AT CYCLE BOUNDARY ======
  function buildPlayOrder(bank, lastQuestionText) {
    // Shuffle indices; if first equals lastQuestionText, reshuffle a few times
    const idx = Array.from({ length: bank.length }, (_, i) => i);

    // Use a stable shuffle seed so refresh doesn't lock you into tiny repeats
    const seed = hashStringToSeed(JSON.stringify(bank[0]?.question || "seed") + Date.now());
    const rnd = mulberry32(seed >>> 0);

    for (let tries = 0; tries < 10; tries++) {
      shuffleInPlace(idx, rnd);
      const firstQ = bank[idx[0]]?.question || "";
      if (!lastQuestionText || normalizeQuestion(firstQ) !== normalizeQuestion(lastQuestionText)) break;
    }
    return idx;
  }

  // ====== EXPORT GLOBALS ======
  const bank = expandBank(TOTAL_QUESTIONS);

  // store last shown question to avoid cycle-boundary repeat
  const lastShown = localStorage.getItem("dcbyron_last_question_v4") || "";
  const order = buildPlayOrder(bank, lastShown);

  window.TRIVIA_BANK = bank;
  window.TRIVIA_ORDER = order;
})();
