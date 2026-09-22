export const N = 25;

export const DIFFS = [
  { label: 'WARY', bombs: 3, lie: 0.30 },
  { label: 'BOLD', bombs: 5, lie: 0.45 },
  { label: 'RECKLESS', bombs: 8, lie: 0.60 },
];

export const HINT_CHANCE = 0.7;

export const SUITS = ['\u2660\uFE0E', '\u2665\uFE0E', '\u2666\uFE0E', '\u2663\uFE0E'];
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const DIALOGUES = {
  open: [
    "Fresh felt, fresh nerve. Place your bet.",
    "Twenty-five tiles. Some of them bite.",
    "The house always blinks last, friend.",
    "Pick your poison, sweetheart."
  ],
  safe: [
    "Warm. Keep going.",
    "The felt approves of you.",
    "Careful — confidence is how I feed my kids.",
    "Luck's a fickle landlord.",
    "You're making this look easy. Don't."
  ],
  hint: [
    "Between us — {c} is clean. On my mother.",
    "{c}. Take it. It's a friend.",
    "I'd stamp {c} safe with my own seal.",
    "If I were you? {c}. No question."
  ],
  caught: [
    "...You saw the eyes. Fine. ONE bomb, on the house.",
    "Caught. Red-handed. Take your bonus and smile.",
    "Nobody reads the tell. NOBODY."
  ],
  wrongCall: [
    "Ha! Paranoia is expensive. Half your pot.",
    "So close. That tile was clean as chapel air.",
    "I never lie. ...Mostly."
  ],
  busted: [
    "The house thanks you for your donation.",
    "Boom. Always a pleasure.",
    "Mind the felt — it stains."
  ],
  cashed: [
    "Take it and go before I change my mind.",
    "A win. Savor it. They age poorly.",
    "Fine. You beat the grid. Today."
  ],
  cleared: [
    "A clean sweep?! I need a drink.",
    "ALL of them?! Take your money. Now."
  ],
  trustedLie: [
    "Whoops.",
    "Told you it was safe. Oh — no I didn't."
  ],
  trustedTruth: [
    "See? Honesty. It happens.",
    "Told you. Enjoy the multiplier."
  ],
  loan: [
    "The pit boss signs off. $500 marker. He keeps count. So do I."
  ],
};

export const cellName = (i) => 'ABCDE'[i % 5] + (Math.floor(i / 5) + 1);

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const fmt2 = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fill = (template, cell) => template.replace('{c}', cell);

export function multAfter(picks, bombs) {
  let m = 0.97;
  for (let i = 0; i < picks; i++) {
    m *= (N - i) / (N - bombs - i);
  }
  return m;
}
