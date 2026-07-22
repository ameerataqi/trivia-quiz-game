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

## Two ways to play

**⚔️ Team Battle** — two teams on one device, head to head.
**🧠 Solo Challenge** — one player, ten questions, chase your own best score.

---

## Team Battle

Each team names itself and locks in **3 categories**. Over the battle a team
answers **4 questions**: one from each of its own categories, plus **1 wildcard**
drawn from a category it did *not* pick. Turns alternate, so the eight questions
run Team A, Team B, Team A, and so on. Highest score wins; equal scores are
called a dead heat.

Neither team ever sees a question the other team was asked — both queues are
drawn from one shared pool with no overlap.

Between turns a **hand-over card** covers the screen ("Pass the device to…").
The clock only starts when that team taps *We're Ready*, so nobody loses seconds
while the phone is changing hands.

### Powers — three each, one use apiece

| Power | Effect |
| ----- | ------ |
| ⚡ **Double** | The question on screen scores **2×**. Spend it before you answer. |
| 📞 **Call a Friend** | A **60-second** call timer opens. The question clock pauses for the whole call, and the question stays visible so you can read it down the phone. |
| 🔄 **Swap** | Bins the current question and deals a fresh one, with a full clock. |

Spent powers stay on screen marked *Used*, so both teams can always see what
their opponent still has in hand.

A power spent on a question you then get wrong — or time out on — is gone. That
is the gamble.

---

## Solo Challenge

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

Every question gives the player **30 seconds**, on every difficulty. Difficulty
changes how hard the questions are and what they are worth, not how long you get:

| Difficulty | Time per question | Multiplier |
| ---------- | ----------------- | ---------- |
| Easy       | 30s               | ×1         |
| Medium     | 30s               | ×1.5       |
| Hard       | 30s               | ×2         |

The clock is `SECONDS_PER_QUESTION` in `src/constants/gameConfig.js`. To bring
back a time penalty on Hard, give that level its own `seconds` value.

Each consecutive correct answer adds +0.1 to the combo multiplier, capped at ×2.
In Team Battle the ⚡ Double power multiplies the final figure by 2 on top of
that. Solo best scores are stored per difficulty with **AsyncStorage**.

Battle length is set by `src/constants/teamConfig.js` — raise
`QUESTIONS_PER_CATEGORY` to 2 or 3 for a longer game (6 or 9 questions per team
plus the wildcard); nothing else needs changing.

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
    FriendCallBar.js      60-second "call a friend" panel
    GradientBackground.js Screen backdrop + SafeAreaView wrapper
    PowerButton.js        One single-use team power
    PrimaryButton.js      Main call-to-action button
    ProgressBar.js        Animated progress track
    QuestionCard.js       Question text with category/difficulty tags
    ResultCard.js         End-of-round summary
    ScoreDisplay.js       Live score pill, combo badge, floating "+points"
    SelectorChip.js       Difficulty and category picker chip
    StatTile.js           Small labelled figure
    TeamScoreboard.js     Both teams' live scores
    Timer.js              Countdown badge + depleting bar
    TurnCard.js           "Pass the device" hand-over card
  constants/
    gameConfig.js         Round length, timers, scoring, result tiers
    teamConfig.js         Battle rules, powers, team colours, verdicts
    theme.js              Colours, gradients, spacing, radii, shadows
  data/
    questions.json        The question bank
    categories.js         Category metadata, derived from the bank
  hooks/
    useBestScores.js      Reads stored records, refreshes on screen focus
    useCountdown.js       Per-question countdown
    useQuiz.js            All gameplay state for one solo round
    useTeamBattle.js      Turns, scores and powers for one battle
  navigation/
    RootNavigator.js      Home → Quiz/TeamSetup → Results stack
  screens/
    HomeScreen.js
    QuizScreen.js
    ResultsScreen.js
    TeamSetupScreen.js
    BattleScreen.js
    BattleResultsScreen.js
  storage/
    scoreStorage.js       AsyncStorage reads/writes
  utils/
    battleBuilder.js      Non-overlapping question queues for two teams
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
