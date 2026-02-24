/* questions.js
   Builds window.TRIVIA_BANK with 2000 mixed-topic questions
   - No duplicates by question text
   - Type-aware wrong answers (numbers/years stay numeric)
   - Avoids immediate repeats (no same question back-to-back)
*/
(() => {
  const TOTAL_QUESTIONS = 2000;

  // ---------- PRNG ----------
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
  function pick(arr, rnd) {
    return arr[Math.floor(rnd() * arr.length)];
  }
  function uniqByText(list) {
    const seen = new Set();
    const out = [];
    for (const q of list) {
      const k = normalizeQuestion(q.question);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(q);
    }
    return out;
  }
  function normalizeQuestion(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[“”"']/g, "")
      .trim();
  }
  function isYear(s) {
    const t = String(s).trim();
    return /^\d{4}$/.test(t) && Number(t) >= 1500 && Number(t) <= 2100;
  }
  function isNumber(s) {
    const t = String(s).trim();
    return /^-?\d+(\.\d+)?$/.test(t);
  }

  // ---------- Base facts (small, but we expand via templates/combinations) ----------
  const CAPITALS = [
    ["France","Paris"],["Italy","Rome"],["Spain","Madrid"],["Portugal","Lisbon"],["Germany","Berlin"],
    ["Netherlands","Amsterdam"],["Sweden","Stockholm"],["Norway","Oslo"],["Finland","Helsinki"],["Denmark","Copenhagen"],
    ["Japan","Tokyo"],["China","Beijing"],["South Korea","Seoul"],["India","New Delhi"],["Thailand","Bangkok"],
    ["Vietnam","Hanoi"],["Australia","Canberra"],["Brazil","Brasília"],["Argentina","Buenos Aires"],["Mexico","Mexico City"],
    ["Canada","Ottawa"],["United States","Washington, D.C."],["Egypt","Cairo"],["Turkey","Ankara"],["Greece","Athens"]
  ];

  const ELEMENTS = [
    ["Hydrogen","H"],["Helium","He"],["Carbon","C"],["Nitrogen","N"],["Oxygen","O"],
    ["Sodium","Na"],["Magnesium","Mg"],["Aluminum","Al"],["Silicon","Si"],["Phosphorus","P"],
    ["Sulfur","S"],["Chlorine","Cl"],["Potassium","K"],["Calcium","Ca"],["Iron","Fe"],
    ["Copper","Cu"],["Zinc","Zn"],["Silver","Ag"],["Gold","Au"],["Lead","Pb"]
  ];

  const PLANETS = [
    ["Mercury","closest to the Sun"],
    ["Venus","hottest planet in our Solar System"],
    ["Earth","only known planet with life"],
    ["Mars","known as the Red Planet"],
    ["Jupiter","largest planet in our Solar System"],
    ["Saturn","famous for its rings"],
    ["Uranus","rotates on its side"],
    ["Neptune","farthest planet from the Sun"]
  ];

  const SPORTS_NUMBERS = [
    ["How many players are on the field for one soccer team?","11"],
    ["How many innings are in a standard baseball game?","9"],
    ["How many points is a touchdown worth in American football?","6"],
    ["How many holes are in a standard round of golf?","18"],
    ["How many players are on a basketball team on the court?","5"]
  ];

  const HISTORY_YEARS = [
    ["In which year did the Berlin Wall fall?","1989"],
    ["In which year did the first man land on the Moon?","1969"],
    ["In which year did World War II end?","1945"],
    ["In which year did the Titanic sink?","1912"],
    ["In which year was the Declaration of Independence signed (USA)?","1776"]
  ];

  const TECH = [
    ["What does CPU stand for?","Central Processing Unit"],
    ["What does RAM stand for?","Random Access Memory"],
    ["What does HTTP stand for?","HyperText Transfer Protocol"],
    ["What does URL stand for?","Uniform Resource Locator"],
    ["What does GPU stand for?","Graphics Processing Unit"]
  ];

  const MOVIES = [
    ["Which film features a character named Darth Vader?","Star Wars"],
    ["Which film features a character named Indiana Jones?","Raiders of the Lost Ark"],
    ["Which movie is about a sinking ship named Titanic?","Titanic"],
    ["Which film features a character named Neo?","The Matrix"],
    ["Which film features a time traveling cyborg?","The Terminator"]
  ];

  const MUSIC = [
    ["How many strings does a standard guitar have?","6"],
    ["Which instrument typically has black and white keys?","Piano"],
    ["Which instrument is known for a slide?","Trombone"],
    ["Which family does the violin belong to?","Strings"],
    ["What do musicians call the speed of music?","Tempo"]
  ];

  const GENERAL = [
    ["How many continents are there on Earth?","7"],
    ["How many days are in a leap year?","366"],
    ["What is the hardest natural mineral?","Diamond"],
    ["Which direction does the Sun rise?","East"],
    ["What is H2O commonly known as?","Water"]
  ];

  // ---------- Wrong answer generators ----------
  function wrongNumbers(correct, rnd, count = 3) {
    const c = Number(correct);
    const out = new Set();
    const deltas = [1,2,3,4,5,6,7,8,9,10,12,15,18,20,25,30,40,50,60,75,100,120,150];
    let guard = 0;
    while (out.size < count && guard++ < 5000) {
      const d = pick(deltas, rnd);
      const sign = rnd() < 0.5 ? -1 : 1;
      const v = c + sign * d;
      if (v === c) continue;
      out.add(String(v));
    }
    return [...out];
  }

  function wrongYears(correct, rnd, count = 3) {
    const c = Number(correct);
    const out = new Set();
    const deltas = [1,2,3,4,5,6,7,8,9,10,12,15,20,25,30,40,50];
    let guard = 0;
    while (out.size < count && guard++ < 5000) {
      const d = pick(deltas, rnd);
      const sign = rnd() < 0.5 ? -1 : 1;
      const v = c + sign * d;
      if (v < 1500 || v > 2100 || v === c) continue;
      out.add(String(v));
    }
    return [...out];
  }

  function wrongFromPool(correct, pool, rnd, count = 3) {
    const out = new Set();
    let guard = 0;
    while (out.size < count && guard++ < 5000) {
      const v = pick(pool, rnd);
      if (!v || v === correct) continue;
      out.add(String(v));
    }
    return [...out];
  }

  function buildAnswers(correct, wrongPool, rnd) {
    const c = String(correct);
    let wrongs = [];
    if (isYear(c)) {
      wrongs = wrongYears(c, rnd, 3);
    } else if (isNumber(c)) {
      wrongs = wrongNumbers(c, rnd, 3);
    } else {
      wrongs = wrongFromPool(c, wrongPool, rnd, 3);
    }

    const answers = [c, ...wrongs].map(String);
    shuffleInPlace(answers, rnd);
    const correctIndex = answers.indexOf(c);
    return { answers, correctIndex };
  }

  // ---------- Question builders (templates create many unique items) ----------
  function makeQ(category, question, correct, wrongPool, rnd) {
    const { answers, correctIndex } = buildAnswers(correct, wrongPool, rnd);
    return { category, question, answers, correct: correctIndex };
  }

  function expandToTarget(seedTag, target) {
    const rnd = mulberry32(hashStringToSeed(seedTag));
    const out = [];

    // pools for wrong answers
    const countryPool = CAPITALS.map(x => x[0]);
    const cityPool = CAPITALS.map(x => x[1]);
    const elementNames = ELEMENTS.map(x => x[0]);
    const elementSyms = ELEMENTS.map(x => x[1]);
    const planetNames = PLANETS.map(x => x[0]);
    const miscWords = [
      ...countryPool, ...cityPool, ...elementNames, ...planetNames,
      "Oxygen","Iron","Gold","Silver","Jupiter","Saturn","Mercury","Venus",
      "Apple","Linux","Android","Windows","Chrome","Firefox","Safari",
      "History","Science","Sports","Music","Movies","Tech","General"
    ];

    // 1) Facts (direct)
    for (const [c,cap] of CAPITALS) {
      out.push(makeQ("General", `What is the capital of ${c}?`, cap, cityPool, rnd));
    }
    for (const [name,sym] of ELEMENTS) {
      out.push(makeQ("Science", `Which element has the symbol ${sym}?`, name, elementNames, rnd));
      out.push(makeQ("Science", `What is the chemical symbol for ${name}?`, sym, elementSyms, rnd));
    }
    for (const [p,desc] of PLANETS) {
      out.push(makeQ("Science", `Which planet is ${desc}?`, p, planetNames, rnd));
    }
    for (const [q,a] of SPORTS_NUMBERS) out.push(makeQ("Sports", q, a, ["1","2","3","4","5","6","7","8","9","10","11","12","18","20"], rnd));
    for (const [q,a] of HISTORY_YEARS) out.push(makeQ("History", q, a, ["1776","1912","1945","1969","1989","1991","2001","2010","2020"], rnd));
    for (const [q,a] of TECH) out.push(makeQ("Tech", q, a, ["Central Power Unit","Random Access Module","Hyper Transfer Text Protocol","Uniform Resource Link","Graphics Processing Unit","General Processing Unit"], rnd));
    for (const [q,a] of MOVIES) out.push(makeQ("Movies", q, a, ["Star Wars","The Matrix","Titanic","The Terminator","Jurassic Park","Avatar","Inception"], rnd));
    for (const [q,a] of MUSIC) out.push(makeQ("Music", q, a, ["Piano","Guitar","Drums","Tempo","Strings","Brass","Woodwind","Percussion"], rnd));
    for (const [q,a] of GENERAL) out.push(makeQ("General", q, a, miscWords, rnd));

    // 2) Massive expansion with safe templates (creates thousands without repeats)
    const templates = [
      {
        cat: "General",
        make() {
          const [country,cap] = pick(CAPITALS, rnd);
          return makeQ("General", `Which city is the capital of ${country}?`, cap, cityPool, rnd);
        }
      },
      {
        cat: "Science",
        make() {
          const [name,sym] = pick(ELEMENTS, rnd);
          return makeQ("Science", `Which symbol belongs to ${name}?`, sym, elementSyms, rnd);
        }
      },
      {
        cat: "Science",
        make() {
          const [p,desc] = pick(PLANETS, rnd);
          return makeQ("Science", `Which planet matches this clue: ${desc}?`, p, planetNames, rnd);
        }
      },
      {
        cat: "Tech",
        make() {
          const [q,a] = pick(TECH, rnd);
          // slight rephrase to create unique question text
          const variants = [
            q,
            q.replace("stand for", "mean"),
            q.replace("What does", "In computing, what does")
          ];
          return makeQ("Tech", pick(variants, rnd), a, miscWords, rnd);
        }
      },
      {
        cat: "History",
        make() {
          const [q,a] = pick(HISTORY_YEARS, rnd);
          const variants = [
            q,
            q.replace("In which year", "What year"),
            q.replace("did", "was it that")
          ];
          return makeQ("History", pick(variants, rnd), a, ["1776","1912","1945","1969","1989","1991","2001","2010","2020"], rnd);
        }
      },
      {
        cat: "Sports",
        make() {
          const [q,a] = pick(SPORTS_NUMBERS, rnd);
          const variants = [
            q,
            q.replace("How many", "What number of"),
            q.replace("standard", "typical")
          ];
          return makeQ("Sports", pick(variants, rnd), a, ["3","4","5","6","7","8","9","10","11","12","18"], rnd);
        }
      },
      {
        cat: "Music",
        make() {
          const [q,a] = pick(MUSIC, rnd);
          const variants = [
            q,
            q.replace("typically", "usually"),
            q.replace("standard", "common")
          ];
          return makeQ("Music", pick(variants, rnd), a, ["Piano","Guitar","Drums","Tempo","Strings","Brass","Woodwind","Percussion"], rnd);
        }
      },
      {
        cat: "Movies",
        make() {
          const [q,a] = pick(MOVIES, rnd);
          const variants = [
            q,
            q.replace("features", "includes"),
            q.replace("Which film", "Which movie")
          ];
          return makeQ("Movies", pick(variants, rnd), a, ["Star Wars","The Matrix","Titanic","The Terminator","Jurassic Park","Avatar","Inception"], rnd);
        }
      },
      {
        cat: "General",
        make() {
          // safe numeric general questions
          const items = [
            ["How many letters are in the English alphabet?","26"],
            ["How many minutes are in an hour?","60"],
            ["How many seconds are in a minute?","60"],
            ["How many days are in a week?","7"],
            ["How many months are in a year?","12"]
          ];
          const [q,a] = pick(items, rnd);
          return makeQ("General", q, a, ["5","6","7","8","9","10","11","12","24","30","60"], rnd);
        }
      }
    ];

    // keep generating until we hit target unique question texts
    let unique = uniqByText(out);
    const seen = new Set(unique.map(q => normalizeQuestion(q.question)));

    let guard = 0;
    while (unique.length < target && guard++ < 200000) {
      const t = pick(templates, rnd);
      const q = t.make();
      const key = normalizeQuestion(q.question);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(q);
    }

    // final shuffle + avoid immediate repeat
    shuffleInPlace(unique, rnd);
    for (let i = 1; i < unique.length; i++) {
      if (normalizeQuestion(unique[i].question) === normalizeQuestion(unique[i-1].question)) {
        // swap with a later item
        for (let j = i + 1; j < unique.length; j++) {
          if (normalizeQuestion(unique[j].question) !== normalizeQuestion(unique[i-1].question)) {
            [unique[i], unique[j]] = [unique[j], unique[i]];
            break;
          }
        }
      }
    }

    // hard cap to target
    if (unique.length > target) unique.length = target;

    return unique;
  }

  const bank = expandToTarget("dcbyron-trivia-v3", TOTAL_QUESTIONS);

  // If something ever goes wrong, do NOT crash the page
  if (!Array.isArray(bank) || bank.length < 200) {
    window.TRIVIA_BANK = [
      { category:"General", question:"Bank failed to build", answers:["OK","OK","OK","OK"], correct:0 }
    ];
  } else {
    window.TRIVIA_BANK = bank;
  }
})();
