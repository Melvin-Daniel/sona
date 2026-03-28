/**
 * Seeded challenges for demo / offline / Demo Mode (10+ words).
 */
import { buildSemanticGraph } from "./graphUtils";
import type {
  ChallengeRound,
  DistractorTaxonomy,
  EngineOutput,
  POS,
  SenseSlot,
} from "./types";

type Wrong = {
  text: string;
  tax: DistractorTaxonomy;
  explainTa: string;
  explainEn: string;
};

function makeRound(
  senseId: string,
  sentence: string,
  correct: string,
  a: Wrong,
  b: Wrong,
  c: Wrong
): ChallengeRound {
  return {
    senseId,
    sentence,
    options: [correct, a.text, b.text, c.text],
    correctIndex: 0,
    optionRoles: ["correct", a.tax, b.tax, c.tax],
    explainWrongTa: [null, a.explainTa, b.explainTa, c.explainTa],
    explainWrongEn: [null, a.explainEn, b.explainEn, c.explainEn],
  };
}

function makeWord(
  word: string,
  defs: Array<{
    id: string;
    pos: POS;
    glossEn: string;
    meaningTa: string;
    sentenceTemplate: string;
    wordForm: string;
    sentence: string;
    correct: string;
    morphForms?: string[];
    wrongs: [Wrong, Wrong, Wrong];
  }>
): Omit<EngineOutput, "source"> {
  const senses: SenseSlot[] = defs.map((d) => ({
    id: d.id,
    pos: d.pos,
    glossEn: d.glossEn,
    meaningTa: d.meaningTa,
    sentenceTemplate: d.sentenceTemplate,
    wordForm: d.wordForm,
    morphForms: d.morphForms,
  }));
  const rounds = defs.map((d) =>
    makeRound(d.id, d.sentence, d.correct, d.wrongs[0], d.wrongs[1], d.wrongs[2])
  );
  return {
    inputWord: word,
    normalizedWord: word,
    senses,
    rounds,
    graph: buildSemanticGraph(word, senses, rounds),
  };
}

const W = (
  text: string,
  tax: DistractorTaxonomy,
  explainTa: string,
  explainEn: string
): Wrong => ({ text, tax, explainTa, explainEn });

const SEED: Record<string, Omit<EngineOutput, "source">> = {
  ...Object.fromEntries(
    [
      makeWord("படி", [
        {
          id: "padi-v-read",
          pos: "Verb",
          glossEn: "to read",
          meaningTa: "படித்தல் (வாசித்தல்)",
          sentenceTemplate: "அவள் தேர்வுக்காக பாடம் _____.",
          wordForm: "படிக்கிறாள்",
          morphForms: ["படி", "படித்தேன்", "படிப்பேன்"],
          sentence: "அவள் தேர்வுக்காக பாடம் படிக்கிறாள்.",
          correct: "படிக்கிறாள்",
          wrongs: [
            W("ஏறினாள்", "same_POS_wrong_sense", "ஏறுதல் படிக்குதல் அல்ல.", "Climbing, not reading."),
            W("அளக்கிறாள்", "collocation_break", "அளவிடல் இங்கே பொருந்தாது.", "Measuring doesn’t fit this lesson context."),
            W("படித்து", "near_synonym", "வடிவம் வினையின் முடிவு; இங்கே தேவையானது நிகழ்கால வடிவம்.", "Different inflection than needed here."),
          ],
        },
        {
          id: "padi-n-stair",
          pos: "Noun",
          glossEn: "step / stair",
          meaningTa: "படி (படிக்கட்டு)",
          sentenceTemplate: "வீட்டு _____ உயரமாக இருந்தது.",
          wordForm: "படி",
          morphForms: ["படிகள்", "படியில்", "படியேறு"],
          sentence: "வீட்டு படி உயரமாக இருந்தது.",
          correct: "படி",
          wrongs: [
            W("படியில்", "wrong_POS", "இடம் குறிக்கும் வடிவம்; இங்கே படிக்கட்டு பெயர்ச்சொல் வேண்டும்.", "Locative form; here you need the stair noun itself."),
            W("படிப்பு", "same_POS_wrong_sense", "கல்வி பொருள்; படிக்கட்டு அல்ல.", "Education sense, not physical stair."),
            W("படிக்க", "wrong_POS", "வினைச்சொல் வடிவம்; இங்கே பெயர்ச்சொல்.", "Verb form; slot needs a noun."),
          ],
        },
        {
          id: "padi-n-measure",
          pos: "Noun",
          glossEn: "traditional measure (unit)",
          meaningTa: "படி (அளவு அலகு)",
          sentenceTemplate: "நிலத்தின் அகலம் ஐந்து _____ எனக் கணக்கிட்டார்.",
          wordForm: "படி",
          morphForms: ["ஒரு படி", "படி அளவு", "படிகள்"],
          sentence: "நிலத்தின் அகலம் ஐந்து படி எனக் கணக்கிட்டார்.",
          correct: "படி",
          wrongs: [
            W("அடி", "same_POS_wrong_sense", "வேறு நில அளவு அலகு; இங்கே படி எனும் அலகு பொருந்தும்.", "Different land-measure unit."),
            W("மீட்டர்", "same_POS_wrong_sense", "மெட்ரிக் அலகு; பாரம்பரிய படி அல்ல.", "Metric unit."),
            W("படிகள்", "near_synonym", "படிக்கட்டுகள் பொருளில் வரும்; இங்கே அளவு எண்ணுக்கு ஒருமை படி.", "Stairs plural vs measure sense."),
          ],
        },
      ]),
      makeWord("கல்", [
        {
          id: "kal-n-stone",
          pos: "Noun",
          glossEn: "stone",
          meaningTa: "கல் (கற்பொருள்)",
          sentenceTemplate: "சுவரில் _____ சுவையாக செதுக்கினான்.",
          wordForm: "கல்",
          morphForms: ["கல்லை", "கற்கள்", "கல்லால்"],
          sentence: "சுவரில் கல் சுவையாக செதுக்கினான்.",
          correct: "கல்",
          wrongs: [
            W("கல்லை", "near_synonym", "பொருள் ஒன்றே; இங்கே எழுவாய் இடத்தில் அடிப்படை வடிவம் பொருந்தும்.", "Object case differs; base noun fits this pattern better."),
            W("கற்பனை", "collocation_break", "சுவரில் கற்பனை என்பது பொருத்தமற்றது.", "Imagery doesn’t collocate with wall carving."),
            W("கவனம்", "wrong_POS", "சொல் வகை மாறுபாடு; கற்பொருள் வேண்டும்.", "Wrong lexical field."),
          ],
        },
        {
          id: "kal-v-learn",
          pos: "Verb",
          glossEn: "to learn",
          meaningTa: "கற்றல்",
          sentenceTemplate: "நாள் பழக்கங்களை நான் _____ வேண்டும்.",
          wordForm: "கற்க",
          morphForms: ["கற்றேன்", "கற்கிறேன்", "கற்போம்"],
          sentence: "நாள் பழக்கங்களை நான் கற்க வேண்டும்.",
          correct: "கற்க",
          wrongs: [
            W("கல்லை", "wrong_POS", "பெயர்ச்சொல்; இங்கே வினைச்சொல் தேவை.", "Noun stone; verb slot."),
            W("வருக", "same_POS_wrong_sense", "வருதல்; கற்றல் அல்ல.", "Come/go sense."),
            W("நடக்க", "same_POS_wrong_sense", "நடத்தல்; கற்றல் அல்ல.", "Walking vs learning."),
          ],
        },
      ]),
      makeWord("ஆறு", [
        {
          id: "aaru-n-river",
          pos: "Noun",
          glossEn: "river",
          meaningTa: "ஆறு (நதி)",
          sentenceTemplate: "உன்னை _____ பார்க்க வந்தான்.",
          wordForm: "ஆற்றில்",
          morphForms: ["ஆறு", "ஆற்றங்கரை", "ஆற்றின்"],
          sentence: "உன்னை ஆற்றில் பார்க்க வந்தான்.",
          correct: "ஆற்றில்",
          wrongs: [
            W("அழகு", "collocation_break", "அழகுடன் பார்க்க வந்தான் என்பது வேறு பொருள்.", "Beauty collocation changes meaning."),
            W("ஆசை", "collocation_break", "ஆசையுடன் என்பது உணர்வு; நதி அல்ல.", "Desire, not river."),
            W("ஆறாக", "near_synonym", "எண் பொருளில் பயன்படும் வடிவம்; இங்கே நதி இடம் வேண்டும்.", "Number-related form; wrong sense."),
          ],
        },
        {
          id: "aaru-num-six",
          pos: "Noun",
          glossEn: "six (number)",
          meaningTa: "ஆறு (எண்)",
          sentenceTemplate: "குழந்தைகள் _____ பேர் விளையாடினர்.",
          wordForm: "ஆறு",
          morphForms: ["ஆற்றில்", "ஆறாம்", "ஆறுக்கு"],
          sentence: "குழந்தைகள் ஆறு பேர் விளையாடினர்.",
          correct: "ஆறு",
          wrongs: [
            W("ஐந்து", "same_POS_wrong_sense", "வேறு எண்.", "Different numeral."),
            W("ஏழு", "same_POS_wrong_sense", "வேறு எண்.", "Different numeral."),
            W("பத்து", "same_POS_wrong_sense", "வேறு எண்.", "Different numeral."),
          ],
        },
      ]),
    ].map((o) => [o.inputWord, o] as const)
  ),
};

const EXTRA: Record<string, Omit<EngineOutput, "source">> = {
  திங்கள்: makeWord("திங்கள்", [
    {
      id: "thingal-monday",
      pos: "Noun",
      glossEn: "Monday",
      meaningTa: "திங்கள் (வார நாள்)",
      sentenceTemplate: "_____ கிழமை கூட்டம் உண்டு.",
      wordForm: "திங்கள்",
      morphForms: ["திங்கட்", "திங்களில்"],
      sentence: "திங்கள் கிழமை கூட்டம் உண்டு.",
      correct: "திங்கள்",
      wrongs: [
        W("சந்திரன்", "same_POS_wrong_sense", "கிரகப் பெயர்; வார நாள் அல்ல.", "Celestial body, not weekday."),
        W("மாதம்", "same_POS_wrong_sense", "கால அலகு; இங்கே வார நாள் வேண்டும்.", "Month unit vs weekday."),
        W("ஞாயிறு", "same_POS_wrong_sense", "வேறு நாள்.", "Different weekday."),
      ],
    },
    {
      id: "thingal-moon",
      pos: "Noun",
      glossEn: "the moon",
      meaningTa: "திங்கள் (நிலவு)",
      sentenceTemplate: "இரவு வானில் _____ பிரகாசமாக தெரிந்தது.",
      wordForm: "திங்கள்",
      morphForms: ["நிலவு", "சந்திரன்"],
      sentence: "இரவு வானில் திங்கள் பிரகாசமாக தெரிந்தது.",
      correct: "திங்கள்",
      wrongs: [
        W("நட்சத்திரம்", "same_POS_wrong_sense", "விண்மீன்; நிலவு அல்ல.", "Star, not moon."),
        W("மேகம்", "same_POS_wrong_sense", "வானிலை; நிலவு அல்ல.", "Cloud."),
        W("சூரியன்", "same_POS_wrong_sense", "பகல் ஒளி; நிலவு அல்ல.", "Sun."),
      ],
    },
  ]),
  கை: makeWord("கை", [
    {
      id: "kai-n-hand",
      pos: "Noun",
      glossEn: "hand",
      meaningTa: "கை (உறுப்பு)",
      sentenceTemplate: "அவன் _____ களைந்து வேலை செய்தான்.",
      wordForm: "கை",
      morphForms: ["கைகள்", "கையில்", "கையால்"],
      sentence: "அவன் கை களைந்து வேலை செய்தான்.",
      correct: "கை",
      wrongs: [
        W("கால்", "same_POS_wrong_sense", "உறுப்பு வேறு; கை அல்ல.", "Different body part."),
        W("தலை", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Head."),
        W("கண்", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Eye."),
      ],
    },
    {
      id: "kai-n-helper",
      pos: "Noun",
      glossEn: "helper / aide",
      meaningTa: "கை (துணை)",
      sentenceTemplate: "அவனுக்கு நல்ல _____ இருக்கிறார்.",
      wordForm: "கை",
      morphForms: ["கைக்காரர்", "கைங்கள்"],
      sentence: "அவனுக்கு நல்ல கை இருக்கிறார்.",
      correct: "கை",
      wrongs: [
        W("வீடு", "collocation_break", "நல்ல வீடு — வேறு தொடர்.", "Collocation shifts meaning."),
        W("நண்பன்", "near_synonym", "பொருள் நெருக்கம்; இங்கே உதவியாளர் உருவகம்.", "Friend vs aide metaphor."),
        W("பணம்", "wrong_POS", "பொருள் துறை வேறு.", "Money field."),
      ],
    },
  ]),
  நாள்: makeWord("நாள்", [
    {
      id: "nal-day",
      pos: "Noun",
      glossEn: "day (time)",
      meaningTa: "நாள் (நேர அலகு)",
      sentenceTemplate: "ஒவ்வொரு _____ காலையும் நடை போவேன்.",
      wordForm: "நாள்",
      morphForms: ["நாட்கள்", "நாளில்"],
      sentence: "ஒவ்வொரு நாள் காலையும் நடை போவேன்.",
      correct: "நாள்",
      wrongs: [
        W("மாதம்", "same_POS_wrong_sense", "நீண்ட கால அலகு.", "Month vs day."),
        W("வருடம்", "same_POS_wrong_sense", "நீண்ட கால அலகு.", "Year."),
        W("நிமிடம்", "same_POS_wrong_sense", "குறுகிய அலகு.", "Minute."),
      ],
    },
    {
      id: "nal-festival",
      pos: "Noun",
      glossEn: "festival day",
      meaningTa: "நாள் (திருநாள்)",
      sentenceTemplate: "இன்று பெரிய _____ கொண்டாடுகிறோம்.",
      wordForm: "நாள்",
      morphForms: ["திருநாள்", "பண்டிகை"],
      sentence: "இன்று பெரிய நாள் கொண்டாடுகிறோம்.",
      correct: "நாள்",
      wrongs: [
        W("விருந்து", "collocation_break", "பெரிய விருந்து — வேறு பொருள்.", "Feast wording."),
        W("கூட்டம்", "collocation_break", "கொண்டாட்டத்தின் பகுதி அல்ல மையச்சொல்.", "Crowd vs holiday."),
        W("இரவு", "same_POS_wrong_sense", "நேரக்குறிப்பு; திருநாள் அல்ல.", "Night vs festival day."),
      ],
    },
  ]),
  முன்: makeWord("முன்", [
    {
      id: "mun-before",
      pos: "Other",
      glossEn: "before (time)",
      meaningTa: "முன் (முன்பு)",
      sentenceTemplate: "_____ அவர் இங்கே வேலை செய்தார்.",
      wordForm: "முன்",
      morphForms: ["முன்பு", "முன்னால்"],
      sentence: "முன் அவர் இங்கே வேலை செய்தார்.",
      correct: "முன்",
      wrongs: [
        W("பின்", "same_POS_wrong_sense", "பின்பகுதி; நேரம் அல்ல.", "After vs before."),
        W("இப்போது", "same_POS_wrong_sense", "தற்போது; கடந்த காலம் அல்ல.", "Now vs before."),
        W("நேற்று", "near_synonym", "குறிப்பிட்ட நாள்; பொதுப் பின்னணி அல்ல.", "Specific day."),
      ],
    },
    {
      id: "mun-front",
      pos: "Noun",
      glossEn: "front",
      meaningTa: "முன் (முன்புறம்)",
      sentenceTemplate: "வீட்டு _____ தோட்டம் அழகாக உள்ளது.",
      wordForm: "முன்",
      morphForms: ["முன்புறம்", "முன்னே"],
      sentence: "வீட்டு முன் தோட்டம் அழகாக உள்ளது.",
      correct: "முன்",
      wrongs: [
        W("பின்", "same_POS_wrong_sense", "பின்புறம்; முன் அல்ல.", "Back."),
        W("மேல்", "same_POS_wrong_sense", "மேல்தளம்; முன்புறம் அல்ல.", "Top."),
        W("அகம்", "wrong_POS", "உள்ளே; வெளிப்புறம் அல்ல.", "Inside."),
      ],
    },
  ]),
  மனம்: makeWord("மனம்", [
    {
      id: "manam-mind",
      pos: "Noun",
      glossEn: "mind / heart",
      meaningTa: "மனம் (சிந்தனை)",
      sentenceTemplate: "அவள் _____ அமைதியாக இருந்தது.",
      wordForm: "மனம்",
      morphForms: ["மனதில்", "மனதை"],
      sentence: "அவள் மனம் அமைதியாக இருந்தது.",
      correct: "மனம்",
      wrongs: [
        W("தலை", "collocation_break", "தலை அமைதி என்பது இயல்பற்றது.", "Head doesn’t collocate."),
        W("குரல்", "collocation_break", "குரல் அமைதி வேறு பொருள்.", "Voice silence."),
        W("கண்", "collocation_break", "கண் அமைதி பொருந்தாது.", "Eye."),
      ],
    },
    {
      id: "manam-consent",
      pos: "Noun",
      glossEn: "consent / will",
      meaningTa: "மனம் (ஒப்புதல்)",
      sentenceTemplate: "அவர் _____ கொடுத்த பிறகே தொடங்கினோம்.",
      wordForm: "மனம்",
      morphForms: ["மனம் கொடு", "மனநிலை"],
      sentence: "அவர் மனம் கொடுத்த பிறகே தொடங்கினோம்.",
      correct: "மனம்",
      wrongs: [
        W("அனுமதி", "near_synonym", "பொருள் நெருக்கம்; இங்கே மனம் கொடு தொடர்.", "Permission vs idiom."),
        W("கை", "collocation_break", "கை கொடு வேறு உருவகம்.", "Hand idiom."),
        W("வார்த்தை", "collocation_break", "வார்த்தை கொடு — வேறு தொடர்.", "Word collocation."),
      ],
    },
  ]),
  தீ: makeWord("தீ", [
    {
      id: "thee-fire",
      pos: "Noun",
      glossEn: "fire",
      meaningTa: "தீ (நெருப்பு)",
      sentenceTemplate: "சமையலறையில் _____ மூட்டினாள்.",
      wordForm: "தீ",
      morphForms: ["தீயை", "தீயின்"],
      sentence: "சமையலறையில் தீ மூட்டினாள்.",
      correct: "தீ",
      wrongs: [
        W("நீர்", "same_POS_wrong_sense", "எதிர் தன்மை.", "Opposite element."),
        W("காற்று", "same_POS_wrong_sense", "வேறு தத்துவம்.", "Air."),
        W("மண்", "same_POS_wrong_sense", "வேறு தத்துவம்.", "Earth."),
      ],
    },
    {
      id: "thee-harm",
      pos: "Noun",
      glossEn: "harm / evil",
      meaningTa: "தீ (தீங்கு)",
      sentenceTemplate: "அரசியல் _____ பேச்சுக்கள் நடந்தன.",
      wordForm: "தீ",
      morphForms: ["தீங்கு", "தீய"],
      sentence: "அரசியல் தீ பேச்சுக்கள் நடந்தன.",
      correct: "தீ",
      wrongs: [
        W("நல்", "wrong_POS", "நல் என்பது பண்புப் பெயர்; இங்கே பெயர்ச்சொல் தீ.", "Good vs harm noun."),
        W("நகைச்சுவை", "collocation_break", "பொருத்தமற்ற இணைப்பு.", "Humor collocation."),
        W("அமைதி", "collocation_break", "எதிர் பொருள் தொடர்.", "Peace opposite."),
      ],
    },
  ]),
  வாசல்: makeWord("வாசல்", [
    {
      id: "vasal-entrance",
      pos: "Noun",
      glossEn: "entrance",
      meaningTa: "வாசல் (நுழைவு)",
      sentenceTemplate: "வீட்டு _____ அழகாக அலங்கரிக்கப்பட்டது.",
      wordForm: "வாசல்",
      morphForms: ["வாசலில்", "வாசலை"],
      sentence: "வீட்டு வாசல் அழகாக அலங்கரிக்கப்பட்டது.",
      correct: "வாசல்",
      wrongs: [
        W("மேற்கூரை", "same_POS_wrong_sense", "கட்டிடப் பகுதி வேறு.", "Roof part."),
        W("ஜன்னல்", "same_POS_wrong_sense", "திறப்பு வேறு.", "Window."),
        W("சுவர்", "same_POS_wrong_sense", "கட்டமைப்பு வேறு.", "Wall."),
      ],
    },
    {
      id: "vasal-threshold",
      pos: "Noun",
      glossEn: "threshold (fig.)",
      meaningTa: "வாசல் (எல்லை)",
      sentenceTemplate: "புதிய தொழிலின் _____ கடந்தோம்.",
      wordForm: "வாசல்",
      morphForms: ["வாசல் கட", "வாசல் தாண்டு"],
      sentence: "புதிய தொழிலின் வாசல் கடந்தோம்.",
      correct: "வாசல்",
      wrongs: [
        W("கதவு", "near_synonym", "இயல்பான நுழைவு; இங்கே உருவக எல்லை.", "Literal door vs threshold metaphor."),
        W("முடிவு", "same_POS_wrong_sense", "முடிவு எல்லை வேறு கோணம்.", "End vs threshold."),
        W("தொடக்கம்", "near_synonym", "பொருள் நெருக்கம்; இங்கே வாசல் உருவகம் பொருந்தும்.", "Start vs doorway metaphor."),
      ],
    },
  ]),
  பால்: makeWord("பால்", [
    {
      id: "paal-milk",
      pos: "Noun",
      glossEn: "milk",
      meaningTa: "பால் (பால் பொருள்)",
      sentenceTemplate: "குழந்தைக்கு சூடான _____ கொடு.",
      wordForm: "பால்",
      morphForms: ["பாலை", "பாலில்"],
      sentence: "குழந்தைக்கு சூடான பால் கொடு.",
      correct: "பால்",
      wrongs: [
        W("தண்ணீர்", "same_POS_wrong_sense", "வேறு பானம்.", "Water."),
        W("சாறு", "same_POS_wrong_sense", "பழச்சாறு.", "Juice."),
        W("காபி", "same_POS_wrong_sense", "வேறு பானம்.", "Coffee."),
      ],
    },
    {
      id: "paal-bridge",
      pos: "Noun",
      glossEn: "bridge",
      meaningTa: "பால் (பாலம்)",
      sentenceTemplate: "நதியின் மீது புதிய _____ கட்டினர்.",
      wordForm: "பால்",
      morphForms: ["பாலம்", "பாலின்"],
      sentence: "நதியின் மீது புதிய பால் கட்டினர்.",
      correct: "பால்",
      wrongs: [
        W("படகு", "same_POS_wrong_sense", "போக்குவரத்து வேறு.", "Boat."),
        W("துறைமுகம்", "same_POS_wrong_sense", "கட்டமைப்பு வேறு.", "Port."),
        W("ஆறு", "collocation_break", "நதி மீது ஆறு என்பது பொருத்தமற்றது.", "River on river."),
      ],
    },
  ]),
  சொல்: makeWord("சொல்", [
    {
      id: "sol-n-word",
      pos: "Noun",
      glossEn: "word",
      meaningTa: "சொல் (சொற்கள்)",
      sentenceTemplate: "அவர் ஒரு அழகான _____ பயன்படுத்தினார்.",
      wordForm: "சொல்",
      morphForms: ["சொற்கள்", "சொல்லை"],
      sentence: "அவர் ஒரு அழகான சொல் பயன்படுத்தினார்.",
      correct: "சொல்",
      wrongs: [
        W("பாட்டு", "same_POS_wrong_sense", "இசைப்பாடல்.", "Song."),
        W("ஓசை", "same_POS_wrong_sense", "ஒலி.", "Sound."),
        W("எழுத்து", "near_synonym", "எழுத்துரு; பேச்சுச் சொல் அல்ல.", "Letter vs word."),
      ],
    },
    {
      id: "sol-v-say",
      pos: "Verb",
      glossEn: "to say",
      meaningTa: "சொல் (சொல்லுதல்)",
      sentenceTemplate: "உண்மையை _____ அஞ்சாதே.",
      wordForm: "சொல்",
      morphForms: ["சொல்லு", "சொல்வேன்"],
      sentence: "உண்மையை சொல் அஞ்சாதே.",
      correct: "சொல்",
      wrongs: [
        W("எழுது", "same_POS_wrong_sense", "எழுத்து செயல்.", "Write."),
        W("கேள்", "same_POS_wrong_sense", "கேட்டல்.", "Listen."),
        W("நினை", "same_POS_wrong_sense", "நினைத்தல்.", "Think."),
      ],
    },
  ]),
  விடு: makeWord("விடு", [
    {
      id: "vidu-leave",
      pos: "Verb",
      glossEn: "to leave / let go",
      meaningTa: "விடு (விட்டுவிடு)",
      sentenceTemplate: "கோபத்தை _____ முடியவில்லை.",
      wordForm: "விட",
      morphForms: ["விட்டேன்", "விடுவேன்", "விடு"],
      sentence: "கோபத்தை விட முடியவில்லை.",
      correct: "விட",
      wrongs: [
        W("பிடி", "same_POS_wrong_sense", "எதிர்ச்சொல் தொடர்.", "Hold vs let go."),
        W("கொள்", "same_POS_wrong_sense", "பெறுதல்.", "Take."),
        W("சேர்", "same_POS_wrong_sense", "இணைத்தல்.", "Join."),
      ],
    },
    {
      id: "vidu-except",
      pos: "Other",
      glossEn: "except",
      meaningTa: "விட (தவிர)",
      sentenceTemplate: "அனைவரும் வந்தனர்; அவனை _____.",
      wordForm: "விட்டு",
      morphForms: ["விட", "தவிர"],
      sentence: "அனைவரும் வந்தனர்; அவனை விட்டு.",
      correct: "விட்டு",
      wrongs: [
        W("உடன்", "same_POS_wrong_sense", "இணைப்பு; தவிர அல்ல.", "With vs except."),
        W("மட்டும்", "near_synonym", "கட்டுப்பாடு வேறு வகை.", "Only vs except."),
        W("போல", "wrong_POS", "ஒப்பீடு; தவிர அல்ல.", "Like/simile."),
      ],
    },
  ]),
  நூல்: makeWord("நூல்", [
    {
      id: "nool-thread",
      pos: "Noun",
      glossEn: "thread / yarn",
      meaningTa: "நூல் (நூற்பு)",
      sentenceTemplate: "பழைய _____ கிழிந்துவிட்டது.",
      wordForm: "நூல்",
      morphForms: ["நூல்கள்", "நூலால்"],
      sentence: "பழைய நூல் கிழிந்துவிட்டது.",
      correct: "நூல்",
      wrongs: [
        W("கயிறு", "near_synonym", "தடிமன் கயிறு; மெல்லிய நூல் அல்ல.", "Rope vs fine thread."),
        W("துணி", "same_POS_wrong_sense", "நெசவுப் பொருள்; நூல் அல்ல.", "Cloth."),
        W("நாடா", "same_POS_wrong_sense", "இணைப்புப் பட்டை; நூற்பு அல்ல.", "Tape/ribbon."),
      ],
    },
    {
      id: "nool-book",
      pos: "Noun",
      glossEn: "book / text",
      meaningTa: "நூல் (இலக்கிய நூல்)",
      sentenceTemplate: "அந்த பழங்கால _____ நூலகத்தில் உள்ளது.",
      wordForm: "நூல்",
      morphForms: ["நூலகம்", "நூல் வரி"],
      sentence: "அந்த பழங்கால நூல் நூலகத்தில் உள்ளது.",
      correct: "நூல்",
      wrongs: [
        W("காகிதம்", "same_POS_wrong_sense", "பொருள்; நூல் எனும் நூல் அல்ல.", "Paper."),
        W("பத்திரிகை", "same_POS_wrong_sense", "கால இதழ்; நூல் அல்ல.", "Magazine."),
        W("குறிப்பேடு", "collocation_break", "பழங்கால குறிப்பேடு — வேறு பொருள்.", "Notebook collocation."),
      ],
    },
  ]),
  முகம்: makeWord("முகம்", [
    {
      id: "mugam-face",
      pos: "Noun",
      glossEn: "face",
      meaningTa: "முகம் (முகம்)",
      sentenceTemplate: "அவள் _____ புன்னகைத்தாள்.",
      wordForm: "முகம்",
      morphForms: ["முகத்தில்", "முகங்கள்"],
      sentence: "அவள் முகம் புன்னகைத்தாள்.",
      correct: "முகம்",
      wrongs: [
        W("கண்", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Eye."),
        W("தலை", "same_POS_wrong_sense", "உறுப்பு வேறு; முகம் அல்ல.", "Head."),
        W("கை", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Hand."),
      ],
    },
    {
      id: "mugam-side",
      pos: "Noun",
      glossEn: "side / facet (fig.)",
      meaningTa: "முகம் (பக்கம்)",
      sentenceTemplate: "இந்தத் திட்டத்தின் பொருளாதார _____ முக்கியம்.",
      wordForm: "முகம்",
      morphForms: ["பக்கம்", "கோணம்"],
      sentence: "இந்தத் திட்டத்தின் பொருளாதார முகம் முக்கியம்.",
      correct: "முகம்",
      wrongs: [
        W("பகுதி", "near_synonym", "பொருள் நெருக்கம்; இங்கே உருவக முகம்.", "Part vs facet."),
        W("நிலை", "near_synonym", "நிலைமை; முகம் உருவகம் வேறு.", "State vs face."),
        W("விலை", "wrong_POS", "பொருள் துறை வேறு.", "Price."),
      ],
    },
  ]),
  இடம்: makeWord("இடம்", [
    {
      id: "idam-place",
      pos: "Noun",
      glossEn: "place / location",
      meaningTa: "இடம் (இடம்)",
      sentenceTemplate: "கூட்டம் நடக்கும் _____ எங்கே?",
      wordForm: "இடம்",
      morphForms: ["இடங்கள்", "இடத்தில்"],
      sentence: "கூட்டம் நடக்கும் இடம் எங்கே?",
      correct: "இடம்",
      wrongs: [
        W("நேரம்", "same_POS_wrong_sense", "காலம்; இடம் அல்ல.", "Time."),
        W("வழி", "same_POS_wrong_sense", "பாதை; இடம் அல்ல.", "Way."),
        W("நாள்", "collocation_break", "கூட்ட நாள் — வேறு அச்சு.", "Day collocation."),
      ],
    },
    {
      id: "idam-vacancy",
      pos: "Noun",
      glossEn: "room / vacancy (space)",
      meaningTa: "இடம் (இடைவெளி)",
      sentenceTemplate: "பையில் _____ இல்லை; இன்னும் ஒன்று வேண்டும்.",
      wordForm: "இடம்",
      morphForms: ["இடைவெளி", "இடம் பிடி"],
      sentence: "பையில் இடம் இல்லை; இன்னும் ஒன்று வேண்டும்.",
      correct: "இடம்",
      wrongs: [
        W("பணம்", "wrong_POS", "பொருள் துறை வேறு.", "Money."),
        W("நேரம்", "same_POS_wrong_sense", "நேர இடைவெளி அல்ல; இடம் அல்ல.", "Time gap."),
        W("சுமை", "collocation_break", "பை சுமை — வேறு கோணம்.", "Load vs space."),
      ],
    },
  ]),
  கண்: makeWord("கண்", [
    {
      id: "kan-eye",
      pos: "Noun",
      glossEn: "eye",
      meaningTa: "கண் (கண்)",
      sentenceTemplate: "அவன் _____ கசங்கிவிட்டது என்றான்.",
      wordForm: "கண்",
      morphForms: ["கண்கள்", "கண்ணில்"],
      sentence: "அவன் கண் கசங்கிவிட்டது என்றான்.",
      correct: "கண்",
      wrongs: [
        W("காது", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Ear."),
        W("மூக்கு", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Nose."),
        W("வாய்", "same_POS_wrong_sense", "உறுப்பு வேறு.", "Mouth."),
      ],
    },
    {
      id: "kan-mesh",
      pos: "Noun",
      glossEn: "hole (mesh) / eye of sieve",
      meaningTa: "கண் (சல்லடை)",
      sentenceTemplate: "சல்லடையின் _____ சிறியதாக உள்ளது.",
      wordForm: "கண்",
      morphForms: ["துவாரம்", "சல்லடைக் கண்"],
      sentence: "சல்லடையின் கண் சிறியதாக உள்ளது.",
      correct: "கண்",
      wrongs: [
        W("கம்பி", "same_POS_wrong_sense", "கட்டமைப்பு வேறு.", "Wire."),
        W("விளிம்பு", "same_POS_wrong_sense", "விளிம்பு; துவாரம் அல்ல.", "Rim."),
        W("கைப்பிடி", "collocation_break", "சல்லடைக் கைப்பிடி — வேறு பகுதி.", "Handle."),
      ],
    },
  ]),
};

Object.assign(SEED, EXTRA);

export function getSeed(word: string): EngineOutput | null {
  const k = word.trim();
  const hit = SEED[k];
  if (!hit) return null;
  return { ...hit, source: "seed" };
}

export function listSeedWords(): string[] {
  return Object.keys(SEED);
}

/** Calendar day index (stable per UTC date) */
function dayOrdinalUtc(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
}

/** Deterministic PRNG from integer seed (0–1 floats) */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic “word of the day” from seed list */
export function getDailySeedWord(date = new Date()): string {
  const words = listSeedWords();
  if (!words.length) return "";
  const day = dayOrdinalUtc(date);
  return words[day % words.length]!;
}

const DAILY_QUEST_LEN = 5;

/** Five distinct lemmas for today’s daily quest (deterministic per UTC day) */
export function getDailyQuestWords(date = new Date()): string[] {
  const words = listSeedWords();
  if (!words.length) return [];
  const rng = mulberry32(dayOrdinalUtc(date) * 977 + date.getUTCFullYear() * 13);
  const a = [...words];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(DAILY_QUEST_LEN, a.length));
}

export { DAILY_QUEST_LEN as DAILY_QUEST_WORD_COUNT };

/** Shared budget for ஒளி hints (remove wrong + highlight) per sense round in Custom / Daily / Arcade */
export const HINT_USES_PER_ROUND = 2;

/** Shuffled queue for arcade (5-word endurance run) */
export function getShuffledSeedQueue(exclude?: string): string[] {
  const w = listSeedWords().filter((x) => x !== exclude);
  const a = [...w];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Boss: 7 words biased toward higher polysemy (more senses per lemma) */
export function getBossSeedQueue(): string[] {
  const scored = Object.entries(SEED).map(([word, o]) => ({
    word,
    n: o.senses.length,
  }));
  scored.sort((a, b) => b.n - a.n);
  const pool = scored.slice(0, Math.min(12, scored.length));
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 7).map((x) => x.word);
}
