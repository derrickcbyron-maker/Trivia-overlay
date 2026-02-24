(function(){
  function mulberry32(seed){
    let a = seed >>> 0;
    return function(){
      a += 0x6D2B79F5;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleInPlace(arr, rnd){
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickDistinct(rnd, pool, n, forbidSet){
    const out = [];
    let guard = 0;
    while (out.length < n && guard < 5000){
      guard++;
      const v = pool[Math.floor(rnd() * pool.length)];
      const key = v.toLowerCase();
      if (forbidSet.has(key)) continue;
      forbidSet.add(key);
      out.push(v);
    }
    return out;
  }

  function makeQuestion(category, question, correctAnswer, wrongPool, rnd){
    const forbid = new Set([String(correctAnswer).toLowerCase()]);
    const wrongs = pickDistinct(rnd, wrongPool, 3, forbid);

    const answers = [correctAnswer, ...wrongs];
    shuffleInPlace(answers, rnd);

    const correctIndex = answers.findIndex(a => a === correctAnswer);

    return {
      category,
      question,
      answers,
      correct: correctIndex
    };
  }

  const CORE = [
    { category:"Space", question:"Which planet is known as the Red Planet?", answers:["Mars","Jupiter","Venus","Mercury"], correct:0 },
    { category:"Science", question:"Which element has the chemical symbol O?", answers:["Gold","Osmium","Oxygen","Iron"], correct:2 },
    { category:"History", question:"The Great Pyramid of Giza is in which country?", answers:["Mexico","Egypt","Greece","Peru"], correct:1 },
    { category:"Geography", question:"What is the largest ocean on Earth?", answers:["Atlantic Ocean","Indian Ocean","Pacific Ocean","Arctic Ocean"], correct:2 },
    { category:"Music", question:"Who was known as the King of Pop?", answers:["Prince","Michael Jackson","Elvis Presley","Madonna"], correct:1 },
    { category:"Film", question:"Which film features the quote May the Force be with you?", answers:["Star Wars","Blade Runner","The Matrix","Alien"], correct:0 },
    { category:"Nature", question:"What gas do plants absorb from the atmosphere?", answers:["Oxygen","Carbon dioxide","Nitrogen","Helium"], correct:1 },
    { category:"Sports", question:"How many players are on the field for one soccer team?", answers:["9","10","11","12"], correct:2 },
    { category:"World Facts", question:"Which language has the most native speakers worldwide?", answers:["English","Spanish","Mandarin Chinese","Arabic"], correct:2 },
    { category:"Tech", question:"What does CPU stand for?", answers:["Central Processing Unit","Computer Personal Unit","Core Processing Utility","Central Program Upload"], correct:0 },
  ];

  const wrongPoolUniversal = [
    "Saturn","Neptune","Uranus","Pluto",
    "Hydrogen","Carbon","Sodium","Chlorine",
    "Brazil","Canada","Japan","Australia",
    "Mozart","Beyonce","Drake","Adele",
    "Tokyo","Paris","New York","Cairo",
    "Ruby","Python","Java","Swift",
    "Shark","Dolphin","Eagle","Tiger",
    "Basketball","Tennis","Cricket","Rugby"
  ];

  const CATEGORY_POOLS = {
    Space: {
      correct: [
        ["Which is the largest planet in our solar system?","Jupiter"],
        ["Which planet is closest to the Sun?","Mercury"],
        ["Which planet has prominent rings?","Saturn"],
        ["Which planet is known for its blue color due to methane?","Neptune"],
        ["Which planet is known as the Morning Star?","Venus"]
      ],
      wrong: ["Mars","Venus","Mercury","Saturn","Neptune","Uranus","Jupiter","Pluto","Europa","Titan"]
    },
    Science: {
      correct: [
        ["What is H2O commonly known as?","Water"],
        ["What force pulls objects toward Earth?","Gravity"],
        ["What is the center of an atom called?","Nucleus"],
        ["What is the hardest natural substance?","Diamond"],
        ["Which vitamin is produced by sunlight exposure?","Vitamin D"]
      ],
      wrong: ["Osmium","Gold","Iron","Helium","Neon","Quartz","Granite","Vinegar","Salt","Sugar"]
    },
    History: {
      correct: [
        ["Who was the first President of the United States?","George Washington"],
        ["In which year did World War II end?","1945"],
        ["Which ancient civilization built Machu Picchu?","Inca"],
        ["The Renaissance began in which country?","Italy"],
        ["The Berlin Wall fell in which year?","1989"]
      ],
      wrong: ["1776","1492","1914","1969","2001","Egypt","Greece","Rome","China","France"]
    },
    Geography: {
      correct: [
        ["What is the longest river in the world?","Nile"],
        ["Which continent is the largest by area?","Asia"],
        ["What is the capital of Canada?","Ottawa"],
        ["Which desert is the largest hot desert?","Sahara"],
        ["Mount Everest is located in which mountain range?","Himalayas"]
      ],
      wrong: ["Amazon","Yangtze","Europe","Africa","Sydney","Toronto","Gobi","Kalahari","Andes","Alps"]
    },
    Music: {
      correct: [
        ["Which instrument has 88 keys?","Piano"],
        ["Which music term means gradually getting louder?","Crescendo"],
        ["Which singer is known for the album Thriller?","Michael Jackson"],
        ["Which band performed Bohemian Rhapsody?","Queen"],
        ["A standard guitar typically has how many strings?","6"]
      ],
      wrong: ["Violin","Cello","Trumpet","Flute","Prince","Madonna","Adele","Drake","7","12"]
    },
    Film: {
      correct: [
        ["Which movie features a character named Jack Sparrow?","Pirates of the Caribbean"],
        ["Which film is about dreams within dreams?","Inception"],
        ["Which movie features dinosaurs brought back to life?","Jurassic Park"],
        ["Which film features a character named Neo?","The Matrix"],
        ["Which film is set on the ship Titanic?","Titanic"]
      ],
      wrong: ["Avatar","Alien","Gladiator","Jaws","The Godfather","Frozen","Rocky","Interstellar","The Lion King","Casablanca"]
    },
    Nature: {
      correct: [
        ["What is the largest land animal?","African elephant"],
        ["What is the fastest land animal?","Cheetah"],
        ["What do bees primarily collect from flowers?","Nectar"],
        ["What is the process plants use to make food?","Photosynthesis"],
        ["What is a group of wolves called?","Pack"]
      ],
      wrong: ["Lion","Tiger","Giraffe","Shark","Whale","Pollen","Sap","Oxygen","Respiration","Herd"]
    },
    Sports: {
      correct: [
        ["How many points is a touchdown worth in American football?","6"],
        ["How many innings are in a standard baseball game?","9"],
        ["What sport uses a shuttlecock?","Badminton"],
        ["In basketball, how many points is a free throw worth?","1"],
        ["What sport is known as the beautiful game?","Soccer"]
      ],
      wrong: ["3","5","7","10","12","Cricket","Tennis","Hockey","Rugby","Golf"]
    },
    "World Facts": {
      correct: [
        ["Which country has the largest population?","China"],
        ["Which continent has the most countries?","Africa"],
        ["What is the most widely used currency in Europe?","Euro"],
        ["Which ocean borders California?","Pacific Ocean"],
        ["What is the main language spoken in Brazil?","Portuguese"]
      ],
      wrong: ["India","USA","Russia","Asia","Europe","Dollar","Yen","Peso","Atlantic Ocean","Spanish"]
    },
    Tech: {
      correct: [
        ["What does RAM stand for?","Random Access Memory"],
        ["What does URL stand for?","Uniform Resource Locator"],
        ["Which company makes the iPhone?","Apple"],
        ["What is the name of the operating system by Google for phones?","Android"],
        ["What does Wi Fi commonly refer to in home networking?","Wireless networking"]
      ],
      wrong: ["Read Access Mode","Universal Resource Link","Samsung","Microsoft","iOS","Linux","Bluetooth","Ethernet","Router","Modem"]
    }
  };

  function expandBank(target){
    const seed = 24601;
    const rnd = mulberry32(seed);

    const bank = [];
    const seen = new Set();

    function add(q){
      const key = (q.category + "|" + q.question + "|" + q.answers.join("|") + "|" + q.correct).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      bank.push(q);
    }

    for (const q of CORE) add(q);

    const categories = Object.keys(CATEGORY_POOLS);

    let guard = 0;
    while (bank.length < target && guard < target * 200){
      guard++;

      const cat = categories[Math.floor(rnd() * categories.length)];
      const pack = CATEGORY_POOLS[cat];

      const pair = pack.correct[Math.floor(rnd() * pack.correct.length)];
      const questionText = pair[0];
      const correctAnswer = pair[1];

      const wrongPool = pack.wrong.concat(wrongPoolUniversal);

      const q = makeQuestion(cat, questionText, correctAnswer, wrongPool, rnd);

      const keyLoose = (cat + "|" + q.question + "|" + q.answers.join("|") + "|" + q.correct).toLowerCase();
      if (seen.has(keyLoose)) continue;

      add(q);
    }

    return bank.slice(0, target);
  }

  window.TRIVIA_BANK = expandBank(2000);
})();
