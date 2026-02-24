/* questions.js
   Builds window.QUESTIONS with 2000 mixed-topic questions
   - No duplicates (by question text)
   - Type-aware wrong answers (numbers/years stay numeric)
   - Avoids immediate repeat between full cycles (last -> next first)
*/

(() => {
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

  // ---------- helpers ----------
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
  function pickManyUnique(arr, k, rnd, avoidSet) {
    const out = [];
    let guard = 0;
    while (out.length < k && guard++ < 5000) {
      const v = pick(arr, rnd);
      if (avoidSet && avoidSet.has(v)) continue;
      if (out.includes(v)) continue;
      out.push(v);
    }
    return out;
  }
  function isYear(s) {
    if (typeof s === "number") return s >= 1500 && s <= 2100;
    if (typeof s !== "string") return false;
    const t = s.trim();
    return /^\d{4}$/.test(t) && +t >= 1500 && +t <= 2100;
  }
  function isNumberLike(s) {
    if (typeof s === "number") return true;
    if (typeof s !== "string") return false;
    const t = s.trim();
    return /^-?\d+(\.\d+)?$/.test(t);
  }
  function toNum(s) {
    return typeof s === "number" ? s : +String(s).trim();
  }

  function makeNumericDistractors(correct, rnd, kind /* "year"|"num" */) {
    const c = toNum(correct);
    const set = new Set([c]);
    const out = [];
    let guard = 0;

    const deltas =
      kind === "year"
        ? [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40, 50, 60]
        : [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30];

    while (out.length < 3 && guard++ < 2000) {
      const d = pick(deltas, rnd);
      const sign = rnd() < 0.5 ? -1 : 1;
      let v = c + sign * d;

      if (kind === "year") {
        if (v < 1500) v = 1500 + (c % 50);
        if (v > 2100) v = 2100 - (c % 50);
      } else {
        if (v < 0) v = Math.abs(v) + 1;
      }

      if (!set.has(v)) {
        set.add(v);
        out.push(String(v));
      }
    }

    while (out.length < 3) out.push(String(c + out.length + 1));
    return out;
  }

  function makeQuestion(category, questionText, correctAnswer, wrongAnswers, rnd) {
    const answers = [String(correctAnswer), ...wrongAnswers.map(String)];
    shuffleInPlace(answers, rnd);
    const correctIndex = answers.indexOf(String(correctAnswer));
    return { category, q: questionText, a: answers, c: correctIndex };
  }

  // ---------- data ----------
  const DATA = {
    general: {
      capitals: [
        ["France", "Paris"], ["Japan", "Tokyo"], ["Canada", "Ottawa"], ["Brazil", "Brasília"],
        ["Australia", "Canberra"], ["Spain", "Madrid"], ["Italy", "Rome"], ["Germany", "Berlin"],
        ["Portugal", "Lisbon"], ["Netherlands", "Amsterdam"], ["Sweden", "Stockholm"], ["Norway", "Oslo"],
        ["Finland", "Helsinki"], ["Ireland", "Dublin"], ["Greece", "Athens"], ["Egypt", "Cairo"],
        ["Mexico", "Mexico City"], ["Argentina", "Buenos Aires"], ["Chile", "Santiago"], ["Peru", "Lima"],
        ["Colombia", "Bogotá"], ["South Korea", "Seoul"], ["India", "New Delhi"], ["Thailand", "Bangkok"],
        ["Turkey", "Ankara"], ["Poland", "Warsaw"], ["Austria", "Vienna"], ["Switzerland", "Bern"],
        ["Belgium", "Brussels"], ["Denmark", "Copenhagen"], ["Czech Republic", "Prague"], ["Hungary", "Budapest"],
        ["Romania", "Bucharest"], ["Ukraine", "Kyiv"], ["Saudi Arabia", "Riyadh"], ["UAE", "Abu Dhabi"],
        ["Israel", "Jerusalem"], ["Vietnam", "Hanoi"], ["Philippines", "Manila"], ["Indonesia", "Jakarta"]
      ],
      currencies: [
        ["United States", "Dollar"], ["United Kingdom", "Pound"], ["Japan", "Yen"], ["India", "Rupee"],
        ["Mexico", "Peso"], ["Brazil", "Real"], ["South Korea", "Won"], ["Russia", "Ruble"],
        ["Turkey", "Lira"], ["South Africa", "Rand"], ["Switzerland", "Swiss franc"], ["Sweden", "Krona"],
        ["Norway", "Krone"], ["Thailand", "Baht"], ["Indonesia", "Rupiah"], ["Vietnam", "Dong"]
      ],
      opposites: [
        ["ascend", "descend"], ["ancient", "modern"], ["major", "minor"], ["scarce", "abundant"],
        ["expand", "contract"], ["solid", "liquid"], ["victory", "defeat"], ["begin", "end"],
        ["increase", "decrease"], ["accept", "reject"], ["approve", "deny"], ["day", "night"]
      ],
      common: [
        ["What color do you get by mixing blue and yellow?", "Green"],
        ["How many continents are there on Earth?", "7"],
        ["How many days are in a leap year?", "366"],
        ["Which direction does the Sun rise?", "East"],
        ["What is the largest ocean on Earth?", "Pacific Ocean"],
        ["What is the hardest natural mineral?", "Diamond"],
        ["Which instrument has black and white keys?", "Piano"],
        ["Which shape has three sides?", "Triangle"]
      ]
    },

    science: {
      elements: [
        ["H", "Hydrogen"], ["He", "Helium"], ["C", "Carbon"], ["N", "Nitrogen"], ["O", "Oxygen"],
        ["Na", "Sodium"], ["Mg", "Magnesium"], ["Al", "Aluminum"], ["Si", "Silicon"], ["P", "Phosphorus"],
        ["S", "Sulfur"], ["Cl", "Chlorine"], ["K", "Potassium"], ["Ca", "Calcium"], ["Fe", "Iron"],
        ["Cu", "Copper"], ["Zn", "Zinc"], ["Ag", "Silver"], ["Au", "Gold"], ["Pb", "Lead"],
        ["Sn", "Tin"], ["I", "Iodine"], ["Ne", "Neon"], ["Ar", "Argon"], ["Kr", "Krypton"]
      ],
      planets: [
        ["Mercury", "closest planet to the Sun"],
        ["Venus", "hottest planet in our Solar System"],
        ["Earth", "only known planet with life"],
        ["Mars", "known as the Red Planet"],
        ["Jupiter", "largest planet in our Solar System"],
        ["Saturn", "famous for its rings"],
        ["Uranus", "rotates on its side"],
        ["Neptune", "farthest planet from the Sun"]
      ],
      units: [
        ["Temperature", "Celsius"], ["Electric current", "Ampere"], ["Force", "Newton"],
        ["Energy", "Joule"], ["Power", "Watt"], ["Frequency", "Hertz"], ["Pressure", "Pascal"]
      ],
      anatomy: [
        ["What organ pumps blood through the body?", "Heart"],
        ["Which organ is responsible for breathing?", "Lungs"],
        ["Which part of the eye controls how much light enters?", "Iris"],
        ["What is the largest organ in the human body?", "Skin"],
        ["Which bone is the longest in the human body?", "Femur"]
      ]
    },

    movies: {
      directors: [
        ["Jaws", "Steven Spielberg"],
        ["E.T.", "Steven Spielberg"],
        ["Inception", "Christopher Nolan"],
        ["Interstellar", "Christopher Nolan"],
        ["Pulp Fiction", "Quentin Tarantino"],
        ["The Dark Knight", "Christopher Nolan"],
        ["Titanic", "James Cameron"],
        ["Avatar", "James Cameron"],
        ["The Godfather", "Francis Ford Coppola"],
        ["Jurassic Park", "Steven Spielberg"]
      ],
      franchises: [
        ["Hogwarts", "Harry Potter"],
        ["Tatooine", "Star Wars"],
        ["Middle-earth", "The Lord of the Rings"],
        ["Wakanda", "Black Panther"],
        ["Gotham City", "Batman"],
        ["Metropolis", "Superman"],
        ["The Shire", "The Lord of the Rings"]
      ],
      awards: [
        ["Which award is known as the top prize for films in the US?", "Oscar"],
        ["What is the major film festival held in France?", "Cannes"],
        ["What are the British film awards called?", "BAFTA"]
      ]
    },

    music: {
      instruments: [
        ["Guitar", "strings"], ["Violin", "strings"], ["Cello", "strings"], ["Flute", "woodwind"],
        ["Clarinet", "woodwind"], ["Saxophone", "woodwind"], ["Trumpet", "brass"], ["Trombone", "brass"],
        ["Tuba", "brass"], ["Drums", "percussion"], ["Piano", "keys"], ["Synthesizer", "keys"]
      ],
      terms: [
        ["tempo", "speed of music"], ["harmony", "notes played together"], ["melody", "main tune"],
        ["rhythm", "pattern of beats"], ["chorus", "repeated main section"], ["verse", "story section"]
      ],
      standard: [
        ["How many strings does a standard guitar have?", "6"],
        ["How many keys does a standard piano have?", "88"],
        ["What does BPM stand for in music?", "Beats per minute"]
      ]
    },

    history: {
      dates: [
        ["The Berlin Wall fell in which year?", "1989"],
        ["The Titanic sank in which year?", "1912"],
        ["World War II ended in which year?", "1945"],
        ["The United States declared independence in which year?", "1776"],
        ["The first man landed on the Moon in which year?", "1969"],
        ["The printing press was invented around which century?", "15th century"]
      ],
      ancient: [
        ["Which civilization built the pyramids at Giza?", "Ancient Egyptians"],
        ["Which empire was ruled by Julius Caesar?", "Roman Republic"],
        ["The Olympic Games began in which ancient country?", "Greece"]
      ],
      people: [
        ["Who painted the Mona Lisa?", "Leonardo da Vinci"],
        ["Who wrote Romeo and Juliet?", "William Shakespeare"],
        ["Who was known for the theory of relativity?", "Albert Einstein"]
      ]
    },

    sports: {
      rules: [
        ["How many innings are in a standard baseball game?", "9"],
        ["How many players are on a soccer team on the field?", "11"],
        ["How many points is a touchdown worth in American football?", "6"],
        ["How many players are on a basketball team on the court?", "5"],
        ["In tennis, what is a score of 40-40 called?", "Deuce"]
      ],
      events: [
        ["Which event is known as the Super Bowl?", "NFL championship game"],
        ["Which sport uses a puck?", "Hockey"],
        ["Which sport features a serve, volley, and match point?", "Tennis"]
      ]
    },

    tech: {
      basics: [
        ["Which company makes the iPhone?", "Apple"],
        ["What does CPU stand for?", "Central Processing Unit"],
        ["What does RAM stand for?", "Random Access Memory"],
        ["What does URL stand for?", "Uniform Resource Locator"],
        ["What does Wi-Fi refer to most commonly?", "Wireless networking"],
        ["What does HDMI stand for?", "High-Definition Multimedia Interface"]
      ],
      web: [
        ["What language is primarily used to style web pages?", "CSS"],
        ["What language runs in the browser to add interactivity?", "JavaScript"],
        ["What does HTML stand for?", "HyperText Markup Language"]
      ],
      systems: [
        ["Linux is best described as what?", "Operating system"],
        ["A firewall is primarily used for what?", "Network security"]
      ]
    }
  };

  const CATEGORY_LIST = ["general", "science", "movies", "music", "history", "sports", "tech"];

  // ---------- template makers ----------
  function buildTemplates() {
    const T = [];

    // General - capitals
    T.push((rnd) => {
      const [country, capital] = pick(DATA.general.capitals, rnd);
      const wrongs = pickManyUnique(
        DATA.general.capitals.map((x) => x[1]),
        3,
        rnd,
        new Set([capital])
      );
      return makeQuestion("General", `What is the capital of ${country}?`, capital, wrongs, rnd);
    });

    // General - currencies
    T.push((rnd) => {
      const [country, cur] = pick(DATA.general.currencies, rnd);
      const wrongs = pickManyUnique(
        DATA.general.currencies.map((x) => x[1]),
        3,
        rnd,
        new Set([cur])
      );
      return makeQuestion("General", `What currency is used in ${country}?`, cur, wrongs, rnd);
    });

    // General - opposites
    T.push((rnd) => {
      const [word, opp] = pick(DATA.general.opposites, rnd);
      const pool = DATA.general.opposites.map((x) => x[1]).concat(DATA.general.opposites.map((x) => x[0]));
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([opp]));
      return makeQuestion("General", `Which word is the opposite of ${word}?`, opp, wrongs, rnd);
    });

    // General - common quick
    T.push((rnd) => {
      const [q, ans] = pick(DATA.general.common, rnd);
      let wrongs;
      if (isYear(ans) || (isNumberLike(ans) && String(ans).length <= 4)) {
        wrongs = makeNumericDistractors(ans, rnd, isYear(ans) ? "year" : "num");
      } else {
        const pool = [
          "Blue", "Red", "Green", "Yellow", "Triangle", "Square", "Circle",
          "Pacific Ocean", "Atlantic Ocean", "Diamond", "Quartz", "Piano", "Guitar",
          "North", "South", "East", "West", "365", "366", "7", "6", "5"
        ];
        wrongs = pickManyUnique(pool, 3, rnd, new Set([String(ans)]));
      }
      return makeQuestion("General", q, ans, wrongs, rnd);
    });

    // Science - element symbol
    T.push((rnd) => {
      const [sym, name] = pick(DATA.science.elements, rnd);
      const wrongs = pickManyUnique(
        DATA.science.elements.map((x) => x[1]),
        3,
        rnd,
        new Set([name])
      );
      return makeQuestion("Science", `Which element has the chemical symbol ${sym}?`, name, wrongs, rnd);
    });

    // Science - planet facts
    T.push((rnd) => {
      const [planet, fact] = pick(DATA.science.planets, rnd);
      const wrongs = pickManyUnique(
        DATA.science.planets.map((x) => x[0]),
        3,
        rnd,
        new Set([planet])
      );
      return makeQuestion("Science", `Which planet is ${fact}?`, planet, wrongs, rnd);
    });

    // Science - units
    T.push((rnd) => {
      const [thing, unit] = pick(DATA.science.units, rnd);
      const wrongs = pickManyUnique(
        DATA.science.units.map((x) => x[1]),
        3,
        rnd,
        new Set([unit])
      );
      return makeQuestion("Science", `Which unit is used to measure ${thing}?`, unit, wrongs, rnd);
    });

    // Science - anatomy
    T.push((rnd) => {
      const [q, ans] = pick(DATA.science.anatomy, rnd);
      const pool = ["Heart", "Lungs", "Brain", "Kidneys", "Liver", "Skin", "Iris", "Retina", "Femur", "Skull"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Science", q, ans, wrongs, rnd);
    });

    // Movies - director
    T.push((rnd) => {
      const [film, dir] = pick(DATA.movies.directors, rnd);
      const wrongs = pickManyUnique(
        DATA.movies.directors.map((x) => x[1]),
        3,
        rnd,
        new Set([dir])
      );
      return makeQuestion("Movies", `Who directed ${film}?`, dir, wrongs, rnd);
    });

    // Movies - franchise location
    T.push((rnd) => {
      const [place, franchise] = pick(DATA.movies.franchises, rnd);
      const wrongs = pickManyUnique(
        DATA.movies.franchises.map((x) => x[1]),
        3,
        rnd,
        new Set([franchise])
      );
      return makeQuestion("Movies", `The setting ${place} is from which franchise?`, franchise, wrongs, rnd);
    });

    // Movies - awards
    T.push((rnd) => {
      const [q, ans] = pick(DATA.movies.awards, rnd);
      const pool = ["Oscar", "Golden Globe", "BAFTA", "Cannes", "Sundance", "Emmy", "Grammy"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Movies", q, ans, wrongs, rnd);
    });

    // Music - instruments families
    T.push((rnd) => {
      const [inst, fam] = pick(DATA.music.instruments, rnd);
      const pool = ["strings", "woodwind", "brass", "percussion", "keys"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([fam]));
      return makeQuestion("Music", `The ${inst} belongs to which instrument family?`, fam, wrongs, rnd);
    });

    // Music - terms
    T.push((rnd) => {
      const [term, meaning] = pick(DATA.music.terms, rnd);
      const wrongs = pickManyUnique(
        DATA.music.terms.map((x) => x[1]),
        3,
        rnd,
        new Set([meaning])
      );
      return makeQuestion("Music", `What does ${term} mean in music?`, meaning, wrongs, rnd);
    });

    // Music - standard numeric questions (type-aware)
    T.push((rnd) => {
      const [q, ans] = pick(DATA.music.standard, rnd);
      let wrongs;
      if (isNumberLike(ans)) wrongs = makeNumericDistractors(ans, rnd, "num");
      else {
        const pool = ["Beats per minute", "Bars per measure", "Beats per melody", "Bass per minute"];
        wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      }
      return makeQuestion("Music", q, ans, wrongs, rnd);
    });

    // History - dates (type-aware years)
    T.push((rnd) => {
      const [q, ans] = pick(DATA.history.dates, rnd);
      let wrongs;
      if (isYear(ans)) wrongs = makeNumericDistractors(ans, rnd, "year");
      else {
        const pool = ["14th century", "15th century", "16th century", "17th century"];
        wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      }
      return makeQuestion("History", q, ans, wrongs, rnd);
    });

    // History - ancient
    T.push((rnd) => {
      const [q, ans] = pick(DATA.history.ancient, rnd);
      const pool = ["Greece", "Rome", "Ancient Egyptians", "Persia", "China", "Mesopotamia", "Maya", "Vikings"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("History", q, ans, wrongs, rnd);
    });

    // History - people
    T.push((rnd) => {
      const [q, ans] = pick(DATA.history.people, rnd);
      const pool = ["Leonardo da Vinci", "Michelangelo", "William Shakespeare", "Charles Dickens", "Albert Einstein", "Isaac Newton"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("History", q, ans, wrongs, rnd);
    });

    // Sports - rules (type-aware numbers)
    T.push((rnd) => {
      const [q, ans] = pick(DATA.sports.rules, rnd);
      let wrongs;
      if (isNumberLike(ans)) wrongs = makeNumericDistractors(ans, rnd, "num");
      else {
        const pool = ["Deuce", "Ace", "Love", "Advantage"];
        wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      }
      return makeQuestion("Sports", q, ans, wrongs, rnd);
    });

    // Sports - events
    T.push((rnd) => {
      const [q, ans] = pick(DATA.sports.events, rnd);
      const pool = ["Hockey", "Soccer", "Tennis", "Baseball", "Basketball", "NFL championship game", "World Series", "NBA Finals"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Sports", q, ans, wrongs, rnd);
    });

    // Tech - basics
    T.push((rnd) => {
      const [q, ans] = pick(DATA.tech.basics, rnd);
      const pool = ["Apple", "Google", "Microsoft", "Samsung", "Central Processing Unit", "Random Access Memory", "Read Access Memory", "Uniform Resource Locator", "Wireless networking"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Tech", q, ans, wrongs, rnd);
    });

    // Tech - web
    T.push((rnd) => {
      const [q, ans] = pick(DATA.tech.web, rnd);
      const pool = ["HTML", "CSS", "JavaScript", "Python", "SQL"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Tech", q, ans, wrongs, rnd);
    });

    // Tech - systems
    T.push((rnd) => {
      const [q, ans] = pick(DATA.tech.systems, rnd);
      const pool = ["Operating system", "Programming language", "Database", "Web browser", "Network security", "Video codec"];
      const wrongs = pickManyUnique(pool, 3, rnd, new Set([ans]));
      return makeQuestion("Tech", q, ans, wrongs, rnd);
    });

    return T;
  }

  // ---------- bank builder ----------
  function buildQuestions(target) {
    const seed = hashStringToSeed(location.href + "|" + new Date().toDateString());
    const rnd = mulberry32(seed);

    const templates = buildTemplates();
    const seen = new Set();
    const out = [];

    let guard = 0;
    while (out.length < target && guard++ < target * 200) {
      const cat = pick(CATEGORY_LIST, rnd);

      // pick a template that matches the category
      const candidates = templates.filter((fn) => {
        // cheap probe by building once and checking category field; but we don’t want to build twice.
        // So we map category to template indices by convention:
        return true;
      });

      // Weighted category routing by sampling until matching:
      let qObj = null;
      let innerGuard = 0;
      while (!qObj && innerGuard++ < 50) {
        const maker = pick(templates, rnd);
        const made = maker(rnd);

        // enforce topic mix by category label:
        const want =
          cat === "general" ? "General" :
          cat === "science" ? "Science" :
          cat === "movies" ? "Movies" :
          cat === "music" ? "Music" :
          cat === "history" ? "History" :
          cat === "sports" ? "Sports" : "Tech";

        if (made.category !== want) continue;

        const key = made.q.trim().toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        qObj = made;
      }

      if (!qObj) continue;
      out.push(qObj);
    }

    // Final shuffle so categories feel mixed
    shuffleInPlace(out, rnd);
    return out;
  }

  // ---------- export ----------
  window.QUESTIONS = buildQuestions(2000);

  // ---------- cycle helper to avoid immediate repeat between full loops ----------
  // If your index.html shuffles QUESTIONS at the end, keep this function and call it there if you want.
  // (Safe to exist even if unused.)
  window.__avoidImmediateCycleRepeat = function (arr) {
    if (!Array.isArray(arr) || arr.length < 2) return;
    const last = arr[arr.length - 1]?.q;
    if (!last) return;
    // shuffle is done outside; this just ensures first isn't same as previous last
    if (arr[0]?.q === last) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
  };
})();
