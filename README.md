# 🧠 Trivia Blast

A polished, colourful multiple-choice trivia game built with **React Native + Expo**.
Runs in **Expo Go** on both iOS and Android with no native modules, no custom dev
build and no ejecting.

---

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

Other targets:

```bash
npm run android   # open in an Android emulator
npm run ios       # open in the iOS simulator (requires Xcode)
npm run web       # run in a browser
```

---

## What's in the game

**Home screen** — logo, animated hero, best score per difficulty, a difficulty
picker, a category picker and a Start button. Your last picks are remembered.

**Quiz screen** — question counter, progress bar, live score, countdown timer,
question card and four colour-coded answer buttons.

- Picking an answer locks all four buttons, turns the correct one green, turns a
  wrong pick red (with a shake), fades the rest and reveals the explanation.
- Running out of time marks the question incorrect, reveals the answer and lets
  you continue.
- The timer restarts for every question and pauses while feedback is showing.

**Results screen** — final score, accuracy bar and percentage, correct/incorrect
counts, best streak, a motivational message tuned to your accuracy, a "new
personal best" badge, and Play Again / Home buttons.

### Scoring

```
points = (100 × difficultyMultiplier + 8 × secondsLeft) × comboMultiplier
```

| Difficulty | Time per question | Multiplier |
| ---------- | ----------------- | ---------- |
| Easy       | 20s               | ×1         |
| Medium     | 15s               | ×1.5       |
| Hard       | 10s               | ×2         |

Each consecutive correct answer adds +0.1 to the combo multiplier, capped at ×2.
The best score is stored per difficulty with **AsyncStorage**.

---

## Project structure

```
App.js                  Root component (SafeAreaProvider + navigation)
index.js                Expo entry point
src/
  components/           Reusable UI
    AnimatedNumber.js     Counts up to a new number instead of snapping
    AnswerButton.js       One answer option, with all four feedback states
    ExplanationPanel.js   Post-answer headline, points and explanation
    GradientBackground.js Screen backdrop + SafeAreaView wrapper
    PrimaryButton.js      Main call-to-action button
    ProgressBar.js        Animated progress track
    QuestionCard.js       Question text with category/difficulty tags
    ResultCard.js         End-of-round summary
    ScoreDisplay.js       Live score pill, combo badge, floating "+points"
    SelectorChip.js       Difficulty and category picker chip
    StatTile.js           Small labelled figure
    Timer.js              Countdown badge + depleting bar
  constants/
    gameConfig.js         Round length, timers, scoring, result tiers
    theme.js              Colours, gradients, spacing, radii, shadows
  data/
    questions.json        The question bank
    categories.js         Category metadata, derived from the bank
  hooks/
    useBestScores.js      Reads stored records, refreshes on screen focus
    useCountdown.js       Per-question countdown
    useQuiz.js            All gameplay state for one round
  navigation/
    RootNavigator.js      Home → Quiz → Results stack
  screens/
    HomeScreen.js
    QuizScreen.js
    ResultsScreen.js
  storage/
    scoreStorage.js       AsyncStorage reads/writes
  utils/
    feedback.js           Optional haptic "sound effects"
    questionPool.js       Round building, filtering and validation
    responsive.js         Screen-size scaling helpers
    scoring.js            Points, accuracy and result tiers
    shuffle.js            Fisher–Yates shuffle
```

---

## Adding questions

Append to `src/data/questions.json`. Nothing else needs to change — categories,
counts and the pickers are all derived from this file, so adding a brand new
category makes it appear on the home screen automatically.

```json
{
  "id": 143,
  "question": "Which planet is known as the Red Planet?",
  "options": ["Earth", "Mars", "Venus", "Jupiter"],
  "correctAnswer": "Mars",
  "explanation": "Mars appears red because of iron oxide on its surface.",
  "category": "Science",
  "difficulty": "Easy"
}
```

Rules enforced at runtime by `src/utils/questionPool.js` — anything that breaks
them is filtered out rather than crashing the app:

- exactly **4** options, all distinct
- `correctAnswer` must be one of the options
- `difficulty` must be `Easy`, `Medium` or `Hard`

Questions **and** answer options are shuffled at the start of every round, so no
two rounds look the same. If a category/difficulty combination has fewer than 10
questions, the round is topped up — first from the same category at other
difficulties, then from the same difficulty in other categories.

Give a category a custom emoji and colour in `src/data/categories.js`; without
one it falls back to a default so it still works.

The bank currently ships **142 questions across 14 categories**.

---

## Dependencies

| Package                                 | Why                                |
| --------------------------------------- | ---------------------------------- |
| `expo`                                   | SDK 57                             |
| `react-native` / `react`                 | 0.86 / 19.2                        |
| `@react-navigation/native` + `native-stack` | Screen navigation               |
| `react-native-screens`                   | Native screen primitives           |
| `react-native-safe-area-context`         | Notch-safe layout                  |
| `expo-linear-gradient`                   | Gradients                          |
| `expo-haptics`                           | Optional tactile feedback          |
| `expo-status-bar`                        | Status bar styling                 |
| `@react-native-async-storage/async-storage` | Best-score persistence          |
| `react-dom` / `react-native-web`         | Optional web target                |

All animations use React Native's built-in `Animated` API — no Reanimated, no
native modules, so everything runs in Expo Go as-is.

### About sound

Sound effects are implemented as **haptics** (`expo-haptics`) rather than audio
files: they need no assets, work in Expo Go out of the box and degrade to a
silent no-op on web. To add real audio instead, drop files into `assets/` and
swap the calls in `src/utils/feedback.js`.

---

## Assets

`assets/` is intentionally empty — the app uses Expo's default icon and splash
screen, and every other graphic is drawn with gradients and emoji, so there are
no binary assets to manage. To brand it, add `icon.png` (1024×1024) and
`splash.png` to `assets/` and reference them in `app.json`.
