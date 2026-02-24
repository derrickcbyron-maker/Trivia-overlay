/* questions.js
   Builds window.TRIVIA_BANK with 2000 questions
   Fixes:
   - removes duplicates by question text
   - generates type-aware answer choices (numbers with numbers, years with years)
*/

(() => {
  // ---------------------------
  // Utilities
  // ---------------------------
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStringToSeed(str) {
    let h = 2166136261;
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

  function uniq(arr) {
    return Array.from(new Set(arr));
  }

  function normalizeQuestion(q) {
    return String(q)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .trim();
  }

  function isYearLike(s) {
    const t = String(s).trim();
    return /^\d{4}$/.test(t) && Number(t) >= 1000 && Number(t) <= 2100;
  }

  function isNumberLike(s) {
    const t = String(s).trim();
    return /^-?\d+(\.\d+)?$/.test(t);
  }

  // ---------------------------
  // Base pools
  // ---------------------------

  // These pools are intentionally broad and reusable.
  // The generator will expand and dedupe until it reaches 2000 unique question texts.

  const CATEGORY_POOLS = {
    Space: {
      correct: [
        ["Which planet is known as the Red Planet?", "Mars"],
        ["Which planet is closest to the Sun?", "Mercury"],
        ["Which planet is largest in our solar system?", "Jupiter"],
        ["What galaxy do we live in?", "Milky Way"],
        ["What is the name of our star?", "Sun"],
        ["What is the name of Earth's natural satellite?", "Moon"],
        ["Which planet is famous for its rings?", "Saturn"],
        ["Which dwarf planet is in the Kuiper Belt and was once classed as the 9th planet?", "Pluto"],
        ["What do we call a rock from space that reaches the ground?", "Meteorite"],
        ["What do we call a rocky object orbiting the Sun?", "Asteroid"]
      ],
      wrong: [
        "Venus","Neptune","Uranus","Andromeda","Orion","Comet","Nebula","Europa","Titan","Ganymede"
      ]
    },

    History: {
      correct: [
        ["The Great Pyramid of Giza is in which country?", "Egypt"],
        ["The Berlin Wall fell in which year?", "1989"],
        ["World War II ended in which year?", "1945"],
        ["The United States declared independence in which year?", "1776"],
        ["The Roman Empire fell in which year, traditionally?", "476"]
      ],
      wrong: [
        "Greece","Mexico","Peru","Italy","France","Germany","1918","1963","2001","1492"
      ]
    },

    Science: {
      correct: [
        ["Which element has the chemical symbol O?", "Oxygen"],
        ["Water is made of hydrogen and what other element?", "Oxygen"],
        ["What is the powerhouse of the cell?", "Mitochondria"],
        ["What gas do plants absorb from the air?", "Carbon dioxide"],
        ["What force pulls objects toward Earth?", "Gravity"]
      ],
      wrong: [
        "Osmium","Gold","Iron","Helium","Nitrogen","Photosynthesis","Evaporation","Friction","Inertia","Chlorophyll"
      ]
    },

    Music: {
      correct: [
        ["Who was known as the King of Pop?", "Michael Jackson"],
        ["A standard guitar typically has how many strings?", "6"],
        ["A piano keyboard has how many keys on a standard full size piano?", "88"],
        ["Tempo is most commonly measured in what unit?", "BPM"],
        ["What symbol indicates a sharp note in music?", "#"]
      ],
      wrong: [
        "Prince","Elvis Presley","Madonna","Beyonce","Taylor Swift","7","5","76","100","Hz"
      ]
    },

    Film: {
      correct: [
        ["Which series features the character Darth Vader?", "Star Wars"],
        ["Which film features the character Jack Sparrow?", "Pirates of the Caribbean"],
        ["Which movie franchise features a ring that must be destroyed?", "The Lord of the Rings"]
      ],
      wrong: [
        "Harry Potter","The Matrix","Titanic","Jurassic Park","Marvel","DC","Avatar","Inception"
      ]
    },

    Sports: {
      correct: [
        ["How many innings are in a standard baseball game?", "9"],
        ["How many players are on a soccer team on the field?", "11"],
        ["In basketball, how many points is a free throw worth?", "1"]
      ],
      wrong: [
        "7","8","10","12","5","6","2","3","15"
      ]
    },

    Tech: {
      correct: [
        ["Which company makes the iPhone?", "Apple"],
        ["What does HTML stand for?", "HyperText Markup Language"],
        ["What does CPU stand for?", "Central Processing Unit"]
      ],
      wrong: [
        "Japan","Linux","Google","Microsoft","Hyperlink Text Module Language","Central Power Unit","Control Processing Utility"
      ]
    }
  };

  const CATEGORY_NAMES = Object.keys(CATEGORY_POOLS);

  // Build category answer banks for smarter distractors
  const CATEGORY_ANSWER_BAGS = {};
  for (const cat of CATEGORY_NAMES) {
    const pool = CATEGORY_POOLS[cat];
    const bag = [];
    for (const pair of pool.correct) bag.push(pair[1]);
    for (const w of pool.wrong) bag.push(w);
    CATEGORY_ANSWER_BAGS[cat] = uniq(bag.map(String));
  }

  // Universal pools separated by type for better wrong answers
  const UNIVERSAL_TEXT = uniq(
    CATEGORY_NAMES.flatMap((c) => CATEGORY_ANSWER_BAGS[c])
      .filter((x) => !isNumberLike(x) && !isYearLike(x))
  );

  const UNIVERSAL_NUMBERS = uniq(
    CATEGORY_NAMES.flatMap((c) => CATEGORY_ANSWER_BAGS[c])
      .filter((x) => isNumberLike(x) && !isYearLike(x))
      .map((x) => String(x))
  );

  const UNIVERSAL_YEARS = uniq(
    CATEGORY_NAMES.flatMap((c) => CATEGORY_ANSWER_BAGS[c])
      .filter((x) => isYearLike(x))
      .map((x) => String(x))
  );

  // ---------------------------
  // Type aware distractors
  // ---------------------------
  function genNumericDistractors(correct, rnd) {
    const c = Number(correct);
    const deltas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
    shuffleInPlace(deltas, rnd);
    const out = [];
    for (const d of deltas) {
      const v1 = c + d;
      const v2 = c - d;
      if (out.length < 3 && v1 !== c) out.push(String(v1));
      if (out.length < 3 && v2 !== c && v2 >= 0) out.push(String(v2));
      if (out.length >= 3) break;
    }
    while (out.length < 3) {
      const fallback = String(Math.max(0, Math.floor(rnd() * 20)));
      if (fallback !== String(correct) && !out.includes(fallback)) out.push(fallback);
    }
    return out.slice(0, 3);
  }

  function genYearDistractors(correct, rnd) {
    const c = Number(correct);
    const deltas = [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40, 50];
    shuffleInPlace(deltas, rnd);
    const out = [];
    for (const d of deltas) {
      const a = c + d;
      const b = c - d;
      if (out.length < 3 && a >= 1000 && a <= 2100) out.push(String(a));
      if (out.length < 3 && b >= 1000 && b <= 2100) out.push(String(b));
      if (out.length >= 3) break;
    }
    // If still short, pull from universal year pool
    if (out.length < 3 && UNIVERSAL_YEARS.length) {
      const bag = UNIVERSAL_YEARS.filter((y) => y !== String(correct));
      shuffleInPlace(bag, rnd);
      for (const y of bag) {
        if (out.length >= 3) break;
        if (!out.includes(y)) out.push(y);
      }
    }
    while (out.length < 3) {
      const fallback = String(1900 + Math.floor(rnd() * 150));
      if (fallback !== String(correct) && !out.includes(fallback)) out.push(fallback);
    }
    return out.slice(0, 3);
  }

  function genTextDistractors(category, correct, rnd) {
    const bag = CATEGORY_ANSWER_BAGS[category] || UNIVERSAL_TEXT;
    const filtered = bag.filter((x) => String(x) !== String(correct) && !isNumberLike(x) && !isYearLike(x));
    shuffleInPlace(filtered, rnd);
    const out = [];
    for (const x of filtered) {
      if (out.length >= 3) break;
      if (!out.includes(x)) out.push(String(x));
    }
    // fallback to universal text
    if (out.length < 3) {
      const u = UNIVERSAL_TEXT.filter((x) => String(x) !== String(correct));
      shuffleInPlace(u, rnd);
      for (const x of u) {
        if (out.length >= 3) break;
        if (!out.includes(x)) out.push(String(x));
      }
    }
    // final filler
    while (out.length < 3) {
      const filler = pickOne(UNIVERSAL_TEXT, rnd) || "None of the above";
      if (String(filler) !== String(correct) && !out.includes(String(filler))) out.push(String(filler));
    }
    return out.slice(0, 3);
  }

  function makeQuestion(category, questionText, correctAnswer, rnd) {
    const correct = String(correctAnswer).trim();

    let wrongs;
    if (isYearLike(correct)) {
      wrongs = genYearDistractors(correct, rnd);
    } else if (isNumberLike(correct)) {
      wrongs = genNumericDistractors(correct, rnd);
    } else {
      wrongs = genTextDistractors(category, correct, rnd);
    }

    let answers = [correct, ...wrongs].map(String);
    answers = uniq(answers).slice(0, 4);

    // Ensure we always have 4 answers
    while (answers.length < 4) {
      if (isYearLike(correct)) {
        const extra = String(Number(correct) + 1 + Math.floor(rnd() * 9));
        if (!answers.includes(extra)) answers.push(extra);
      } else if (isNumberLike(correct)) {
        const extra = String(Number(correct) + 1 + Math.floor(rnd() * 9));
        if (!answers.includes(extra)) answers.push(extra);
      } else {
        const extra = pickOne(UNIVERSAL_TEXT, rnd) || "Other";
        if (!answers.includes(extra) && extra !== correct) answers.push(extra);
      }
    }

    shuffleInPlace(answers, rnd);
    const correctIndex = answers.indexOf(correct);

    return {
      category,
      question: String(questionText),
      answers,
      correct: correctIndex < 0 ? 0 : correctIndex
    };
  }

  // ---------------------------
  // Bank expansion with dedupe
  // ---------------------------
  function expandBank(targetSize, seedLabel) {
    const rnd = mulberry32(hashStringToSeed(seedLabel));
    const bank = [];
    const seenQ = new Set();

    function addQuestion(q) {
      const key = q.category + "|" + normalizeQuestion(q.question);
      if (seenQ.has(key)) return false;
      seenQ.add(key);
      bank.push(q);
      return true;
    }

    // seed from base pools first
    for (const cat of CATEGORY_NAMES) {
      const pool = CATEGORY_POOLS[cat];
      for (const pair of pool.correct) {
        const q = makeQuestion(cat, pair[0], pair[1], rnd);
        addQuestion(q);
      }
    }

    // Generate until we hit target
    let guard = 0;
    const guardMax = targetSize * 300;

    while (bank.length < targetSize && guard < guardMax) {
      guard++;

      const cat = pickOne(CATEGORY_NAMES, rnd);
      const pool = CATEGORY_POOLS[cat];

      // Mostly use the correct pool question templates, but change the answer choices type-safely
      const basePair = pickOne(pool.correct, rnd);
      const questionText = basePair[0];
      const correctAnswer = basePair[1];

      // Sometimes swap in another correct answer from same category bag if it fits type
      let chosenCorrect = correctAnswer;

      const bag = CATEGORY_ANSWER_BAGS[cat] || [];
      if (bag.length) {
        const wantsYear = isYearLike(correctAnswer);
        const wantsNumber = isNumberLike(correctAnswer) && !isYearLike(correctAnswer);
        const wantsText = !isNumberLike(correctAnswer) && !isYearLike(correctAnswer);

        const candidates = bag.filter((x) => {
          const s = String(x).trim();
          if (s === String(correctAnswer).trim()) return false;
          if (wantsYear) return isYearLike(s);
          if (wantsNumber) return isNumberLike(s) && !isYearLike(s);
          if (wantsText) return !isNumberLike(s) && !isYearLike(s);
          return false;
        });

        if (candidates.length) {
          chosenCorrect = pickOne(candidates, rnd);
        }
      }

      const q = makeQuestion(cat, questionText, chosenCorrect, rnd);
      addQuestion(q);
    }

    // If we still did not reach target, fill with safe generated math and year questions
    while (bank.length < targetSize) {
      const cat = "Mixed";
      const mode = Math.floor(rnd() * 2);

      if (mode === 0) {
        const a = 2 + Math.floor(rnd() * 40);
        const b = 2 + Math.floor(rnd() * 40);
        const correct = String(a + b);
        const q = makeQuestion("Math", `What is ${a} + ${b}?`, correct, rnd);
        addQuestion(q);
      } else {
        const year = 1200 + Math.floor(rnd() * 900);
        const correct = String(year);
        const q = makeQuestion("History", "Pick the year shown", correct, rnd);
        addQuestion(q);
      }
    }

    // Final shuffle for good mixing
    shuffleInPlace(bank, rnd);
    return bank.slice(0, targetSize);
  }

  // Build the bank
  window.TRIVIA_BANK = expandBank(2000, "dcb_trivia_bank_v2");

})();
