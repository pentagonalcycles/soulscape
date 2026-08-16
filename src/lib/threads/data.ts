export interface StitchTechnique {
  id: string;
  name: string;
  abbreviation: string;
  craft: "knitting" | "crochet" | "both";
  difficulty: "beginner" | "intermediate" | "advanced";
  explanation: string;
  steps: string[];
  tips?: string[];
}

export interface YarnWeight {
  id: string;
  name: string;
  category: string;
  wrapsPerInch: string;
  gaugeRange: string;
  commonUses: string[];
  recommendedNeedle: string;
  recommendedHook: string;
}

export interface YarnFiber {
  id: string;
  name: string;
  properties: string[];
  bestFor: string[];
  care: string;
}

export interface Abbreviation {
  term: string;
  fullName: string;
  craft: "knitting" | "crochet" | "both";
  explanation: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  craft: "knitting" | "crochet";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  materials: string[];
  steps: string[];
}

export const KNITTING_STITCHES: StitchTechnique[] = [
  {
    id: "knit",
    name: "Knit Stitch",
    abbreviation: "k",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "The most fundamental knitting stitch. Creates smooth 'V' shapes on the front of your work.",
    steps: [
      "Hold the needle with stitches in your left hand",
      "Insert the right needle into the first stitch from left to right",
      "Wrap the yarn around the right needle counterclockwise",
      "Pull the wrapped yarn through the stitch",
      "Slide the old stitch off the left needle",
    ],
    tips: ["Keep tension even but not too tight", "The stitch should slide easily on the needle"],
  },
  {
    id: "purl",
    name: "Purl Stitch",
    abbreviation: "p",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "The reverse of a knit stitch. Creates a bumpy texture on the front of your work.",
    steps: [
      "Hold the needle with stitches in your left hand",
      "Insert the right needle into the first stitch from right to left",
      "Wrap the yarn around the right needle counterclockwise",
      "Pull the wrapped yarn through the stitch",
      "Slide the old stitch off the left needle",
    ],
    tips: ["Keep the yarn in front of your work", "Purl stitches look like bumps on the front"],
  },
  {
    id: "stockinette",
    name: "Stockinette Stitch",
    abbreviation: "st st",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "The most common knitting pattern. Smooth 'V' front, bumpy back. Created by alternating knit and purl rows.",
    steps: [
      "Row 1: Knit all stitches",
      "Row 2: Purl all stitches",
      "Repeat rows 1-2",
    ],
    tips: ["Stockinette curls at the edges — this is normal", "Add a border of garter stitch to prevent curling"],
  },
  {
    id: "garter",
    name: "Garter Stitch",
    abbreviation: "garter",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "The simplest pattern — knit every row. Creates a ridged, stretchy fabric that lies flat.",
    steps: [
      "Every row: Knit all stitches",
    ],
    tips: ["Great for beginners", "Lies flat without curling", "Looks the same on both sides"],
  },
  {
    id: "ribbing",
    name: "Ribbing",
    abbreviation: "rib",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "An elastic pattern created by alternating knit and purl stitches. Common for cuffs, hems, and neckbands.",
    steps: [
      "1x1 Rib: *K1, P1* repeat across row",
      "2x2 Rib: *K2, P2* repeat across row",
      "Every row: Work stitches as they appear (knit the knits, purl the purls)",
    ],
    tips: ["Use a needle one size smaller for tighter ribbing", "2x2 rib is stretchier than 1x1"],
  },
  {
    id: "seed",
    name: "Seed Stitch",
    abbreviation: "seed st",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "A textured pattern with a pebbly surface. Created by alternating knit and purl every stitch.",
    steps: [
      "Row 1: *K1, P1* repeat across",
      "Row 2: *P1, K1* repeat across",
      "Repeat rows 1-2",
    ],
    tips: ["Knit the purls and purl the knits", "Creates a reversible fabric"],
  },
  {
    id: "k2tog",
    name: "Knit 2 Together",
    abbreviation: "k2tog",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "A right-leaning decrease. Knit two stitches together as if they were one.",
    steps: [
      "Insert the right needle into the next 2 stitches from left to right",
      "Wrap yarn and knit them together as one stitch",
    ],
    tips: ["This creates a right-leaning decrease", "The most common way to decrease in knitting"],
  },
  {
    id: "ssk",
    name: "Slip Slip Knit",
    abbreviation: "ssk",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "A left-leaning decrease. Slip two stitches individually, then knit them together.",
    steps: [
      "Slip the first stitch knitwise from left to right needle",
      "Slip the second stitch knitwise",
      "Insert the left needle into the front of both slipped stitches",
      "Knit them together",
    ],
    tips: ["This creates a left-leaning decrease", "Pairs with k2tog for symmetrical shaping"],
  },
  {
    id: "yo",
    name: "Yarn Over",
    abbreviation: "yo",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "Wrapping the yarn around the needle to create an extra stitch and a decorative hole.",
    steps: [
      "Bring the yarn to the front of your work (if it isn't already)",
      "Wrap the yarn over the top of the right needle to the back",
      "Continue with the next stitch as normal",
    ],
    tips: ["Creates a deliberate hole — used in lace patterns", "Count your stitches after yarn overs to make sure you have the right number"],
  },
  {
    id: "cast-on",
    name: "Long Tail Cast On",
    abbreviation: "CO",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "The most common method of casting on stitches to begin your project.",
    steps: [
      "Make a slip knot and place on needle",
      "Hold needle in right hand",
      "Drape tail over left thumb and working yarn over left index finger",
      "Insert needle up through the loop on your thumb",
      "Grab the yarn on your index finger",
      "Pull through the thumb loop",
      "Drop loop off thumb and tighten",
    ],
    tips: ["Leave a tail about 3x the width of your project", "Don't cast on too tightly"],
  },
  {
    id: "bind-off",
    name: "Bind Off",
    abbreviation: "BO",
    craft: "knitting",
    difficulty: "beginner",
    explanation: "Securing stitches at the end of your project so they don't unravel.",
    steps: [
      "Knit the first 2 stitches",
      "Insert the left needle into the first stitch on the right needle",
      "Lift it over the second stitch and off the needle",
      "Knit the next stitch",
      "Repeat until 1 stitch remains",
      "Cut yarn and pull through last stitch",
    ],
    tips: ["Don't bind off too tightly", "Use a needle one size larger if your bind off is tight"],
  },
  {
    id: "cable",
    name: "Cable Basics",
    abbreviation: "C6F",
    craft: "knitting",
    difficulty: "intermediate",
    explanation: "Crossing stitches over each other to create a twisted rope effect.",
    steps: [
      "Slip 3 stitches onto a cable needle and hold in front",
      "Knit the next 3 stitches from the left needle",
      "Knit the 3 stitches from the cable needle",
    ],
    tips: ["Use a cable needle or double-pointed needle", "Keep tension even across cable crossings"],
  },
];

export const CROCHET_STITCHES: StitchTechnique[] = [
  {
    id: "chain",
    name: "Chain Stitch",
    abbreviation: "ch",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "The foundation of all crochet. Creates a series of loops that form the starting chain.",
    steps: [
      "Make a slip knot",
      "Yarn over",
      "Pull through the loop on the hook",
      "Repeat for the number of chains needed",
    ],
    tips: ["Don't pull too tight — the hook should slide through easily", "Count your chains carefully"],
  },
  {
    id: "slip-stitch",
    name: "Slip Stitch",
    abbreviation: "sl st",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "The shortest crochet stitch. Used for joining, moving across stitches, or creating a flat fabric.",
    steps: [
      "Insert hook into the stitch",
      "Yarn over",
      "Pull through both the stitch and the loop on the hook",
    ],
    tips: ["Great for joining rounds", "Creates a very dense fabric"],
  },
  {
    id: "sc",
    name: "Single Crochet",
    abbreviation: "sc",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "A short, dense stitch. One of the first stitches beginners learn. Creates a firm fabric.",
    steps: [
      "Insert hook into the stitch",
      "Yarn over and pull up a loop (2 loops on hook)",
      "Yarn over and pull through both loops",
    ],
    tips: ["UK equivalent: double crochet (dc)", "Great for amigurumi and bags"],
  },
  {
    id: "hdc",
    name: "Half Double Crochet",
    abbreviation: "hdc",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "A stitch taller than single crochet but shorter than double crochet. Good balance of height and density.",
    steps: [
      "Yarn over",
      "Insert hook into the stitch",
      "Yarn over and pull up a loop (3 loops on hook)",
      "Yarn over and pull through all 3 loops",
    ],
    tips: ["UK equivalent: half treble crochet (htr)", "Creates a slightly stretchy fabric"],
  },
  {
    id: "dc",
    name: "Double Crochet",
    abbreviation: "dc",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "A versatile, medium-height stitch. One of the most commonly used crochet stitches.",
    steps: [
      "Yarn over",
      "Insert hook into the stitch",
      "Yarn over and pull up a loop (3 loops on hook)",
      "Yarn over and pull through 2 loops",
      "Yarn over and pull through remaining 2 loops",
    ],
    tips: ["UK equivalent: treble crochet (tr)", "Works up quickly — great for blankets"],
  },
  {
    id: "tr",
    name: "Treble Crochet",
    abbreviation: "tr",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "A tall stitch that creates an open, lacy fabric. Taller than double crochet.",
    steps: [
      "Yarn over twice",
      "Insert hook into the stitch",
      "Yarn over and pull up a loop (4 loops on hook)",
      "Yarn over and pull through 2 loops",
      "Yarn over and pull through 2 loops",
      "Yarn over and pull through remaining 2 loops",
    ],
    tips: ["UK equivalent: double treble (dtr)", "Creates a loose, drapey fabric"],
  },
  {
    id: "inc",
    name: "Increase",
    abbreviation: "inc",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "Making two or more stitches into the same stitch to add width.",
    steps: [
      "Work 2 stitches (usually sc or dc) into the same stitch",
      "This adds one extra stitch to your count",
    ],
    tips: ["Mark your increases with a stitch marker", "Even increases create a flat circle"],
  },
  {
    id: "dec",
    name: "Decrease",
    abbreviation: "dec",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "Combining two stitches into one to reduce width.",
    steps: [
      "Insert hook into the first stitch and pull up a loop",
      "Insert hook into the next stitch and pull up a loop",
      "Yarn over and pull through all 3 loops on hook",
    ],
    tips: ["Invisible decrease looks neater — insert through front loops only", "Used for shaping and amigurumi"],
  },
  {
    id: "magic-ring",
    name: "Magic Ring",
    abbreviation: "MR",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "An adjustable loop for starting projects worked in the round. Closes tightly with no hole.",
    steps: [
      "Wrap yarn around your fingers to form a loop",
      "Insert hook under the loop and grab working yarn",
      "Pull up a loop and chain 1",
      "Work stitches into the ring",
      "Pull the tail to close the ring tightly",
    ],
    tips: ["Alternative: Chain 4 and slip stitch to form a ring", "Leave a long tail to weave in securely"],
  },
  {
    id: "granny-square",
    name: "Granny Square",
    abbreviation: "granny sq",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "A classic crochet motif made of clusters of double crochet stitches worked from the center out.",
    steps: [
      "Make a magic ring",
      "Round 1: Ch 3, 2 dc, *ch 1, 3 dc* repeat 3 times, ch 1, sl st to top of ch-3",
      "Round 2: Ch 3, 2 dc in ch-1 space, *ch 1, 3 dc in next ch-1 space, ch 1, 3 dc in same space* repeat around",
      "Continue adding rounds as needed",
    ],
    tips: ["Turn your work each round for flat squares", "Weave in ends as you go"],
  },
  {
    id: "crochet-round",
    name: "Crochet in the Round",
    abbreviation: "in the round",
    craft: "crochet",
    difficulty: "beginner",
    explanation: "Working in a continuous spiral or joined rounds to create tubes, circles, and 3D shapes.",
    steps: [
      "Start with a magic ring or chain ring",
      "Work stitches into the ring",
      "Join with a slip stitch or continue in a spiral",
      "Use a stitch marker to mark the beginning of each round",
    ],
    tips: ["Spiral: no joining, continuous work", "Joined rounds: slip stitch to join, chain up for next round"],
  },
];

export const ALL_STITCHES = [...KNITTING_STITCHES, ...CROCHET_STITCHES];

export const ABBREVIATIONS: Abbreviation[] = [
  // Knitting
  { term: "k", fullName: "Knit", craft: "knitting", explanation: "Insert needle, wrap yarn, pull through" },
  { term: "p", fullName: "Purl", craft: "knitting", explanation: "Insert needle from right, wrap yarn, pull through" },
  { term: "k2tog", fullName: "Knit 2 Together", craft: "knitting", explanation: "Right-leaning decrease — knit two stitches as one" },
  { term: "ssk", fullName: "Slip Slip Knit", craft: "knitting", explanation: "Left-leaning decrease — slip two, knit together" },
  { term: "yo", fullName: "Yarn Over", craft: "knitting", explanation: "Wrap yarn over needle to create a new stitch and hole" },
  { term: "co", fullName: "Cast On", craft: "knitting", explanation: "Create initial stitches on the needle" },
  { term: "bo", fullName: "Bind Off", craft: "knitting", explanation: "Secure stitches so they don't unravel" },
  { term: "st st", fullName: "Stockinette Stitch", craft: "knitting", explanation: "Knit one row, purl one row" },
  { term: "rs", fullName: "Right Side", craft: "knitting", explanation: "The front/public side of your work" },
  { term: "ws", fullName: "Wrong Side", craft: "knitting", explanation: "The back/private side of your work" },
  { term: "pm", fullName: "Place Marker", craft: "knitting", explanation: "Put a stitch marker on the needle" },
  { term: "sm", fullName: "Slip Marker", craft: "knitting", explanation: "Move the marker from left to right needle" },
  { term: "sl", fullName: "Slip", craft: "knitting", explanation: "Move stitch from left to right needle without working it" },
  { term: "m1", fullName: "Make 1", craft: "knitting", explanation: "An invisible increase using the bar between stitches" },
  // Crochet
  { term: "ch", fullName: "Chain", craft: "crochet", explanation: "Yarn over, pull through loop" },
  { term: "sl st", fullName: "Slip Stitch", craft: "crochet", explanation: "Insert hook, yarn over, pull through everything" },
  { term: "sc", fullName: "Single Crochet", craft: "crochet", explanation: "Insert, yarn over, pull up loop, yarn over, pull through both" },
  { term: "hdc", fullName: "Half Double Crochet", craft: "crochet", explanation: "Yarn over, insert, pull up loop, yarn over, pull through all 3" },
  { term: "dc", fullName: "Double Crochet", craft: "crochet", explanation: "Yarn over, insert, pull through 2 twice" },
  { term: "tr", fullName: "Treble Crochet", craft: "crochet", explanation: "Yarn over twice, insert, pull through 2 three times" },
  { term: "dtr", fullName: "Double Treble", craft: "crochet", explanation: "Yarn over 3 times, insert, pull through 2 four times" },
  { term: "mr", fullName: "Magic Ring", craft: "crochet", explanation: "Adjustable loop for starting in the round" },
  { term: "inc", fullName: "Increase", craft: "both", explanation: "Make 2 stitches in the same stitch" },
  { term: "dec", fullName: "Decrease", craft: "both", explanation: "Combine 2 stitches into 1" },
  { term: "blo", fullName: "Back Loop Only", craft: "crochet", explanation: "Work into only the back loop of the stitch" },
  { term: "flo", fullName: "Front Loop Only", craft: "crochet", explanation: "Work into only the front loop of the stitch" },
  { term: "sp", fullName: "Space", craft: "both", explanation: "The gap between stitches" },
  { term: "sk", fullName: "Skip", craft: "both", explanation: "Skip the next stitch without working it" },
  { term: "rep", fullName: "Repeat", craft: "both", explanation: "Repeat the instructions" },
  { term: "rnd", fullName: "Round", craft: "both", explanation: "A complete circle of stitches when working in the round" },
  { term: "tog", fullName: "Together", craft: "both", explanation: "Work stitches together as one" },
];

export const YARN_WEIGHTS: YarnWeight[] = [
  {
    id: "lace",
    name: "Lace",
    category: "0",
    wrapsPerInch: "30+",
    gaugeRange: "33-40 sts",
    commonUses: ["Doilies", "Lace shawls", "Delicate accessories"],
    recommendedNeedle: "1.5-2.25mm (US 000-1)",
    recommendedHook: "1.5-2.25mm (Steel 6-8)",
  },
  {
    id: "fingering",
    name: "Fingering / Sock",
    category: "1",
    wrapsPerInch: "14-20",
    gaugeRange: "27-32 sts",
    commonUses: ["Socks", "Lace shawls", "Lightweight garments"],
    recommendedNeedle: "2.25-3.25mm (US 1-3)",
    recommendedHook: "2.25-3.5mm (US B-E)",
  },
  {
    id: "sport",
    name: "Sport",
    category: "2",
    wrapsPerInch: "12-15",
    gaugeRange: "23-26 sts",
    commonUses: ["Baby items", "Lightweight sweaters", "Afghans"],
    recommendedNeedle: "3.25-3.75mm (US 3-5)",
    recommendedHook: "3.5-4.5mm (US E-7)",
  },
  {
    id: "dk",
    name: "DK (Double Knitting)",
    category: "3",
    wrapsPerInch: "10-12",
    gaugeRange: "21-24 sts",
    commonUses: ["Sweaters", "Scarves", "Hats", "Baby items"],
    recommendedNeedle: "3.75-4.5mm (US 5-7)",
    recommendedHook: "4.5-5.5mm (US 7-I)",
  },
  {
    id: "worsted",
    name: "Worsted / Aran",
    category: "4",
    wrapsPerInch: "8-10",
    gaugeRange: "16-20 sts",
    commonUses: ["Sweaters", "Blankets", "Hats", "Scarves", "Most projects"],
    recommendedNeedle: "4.5-5.5mm (US 7-9)",
    recommendedHook: "5.5-6.5mm (US I-K)",
  },
  {
    id: "chunky",
    name: "Chunky / Bulky",
    category: "5",
    wrapsPerInch: "6-8",
    gaugeRange: "12-15 sts",
    commonUses: ["Blankets", "Scarves", "Quick projects", "Winter wear"],
    recommendedNeedle: "5.5-8mm (US 9-11)",
    recommendedHook: "6.5-9mm (US K-M)",
  },
  {
    id: "super-chunky",
    name: "Super Chunky / Super Bulky",
    category: "6",
    wrapsPerInch: "4-6",
    gaugeRange: "7-11 sts",
    commonUses: ["Chunky blankets", "Quick accessories", "Home decor"],
    recommendedNeedle: "8-12.75mm (US 11-17)",
    recommendedHook: "9-15mm (US M-P)",
  },
];

export const YARN_FIBERS: YarnFiber[] = [
  {
    id: "wool",
    name: "Wool",
    properties: ["Warm", "Elastic", "Breathable", "Moisture-wicking"],
    bestFor: ["Sweaters", "Hats", "Scarves", "Socks", "Cold weather items"],
    care: "Hand wash in cool water or use wool cycle. Lay flat to dry.",
  },
  {
    id: "cotton",
    name: "Cotton",
    properties: ["Cool", "Absorbent", "No stretch", "Machine washable"],
    bestFor: ["Dishcloths", "Summer tops", "Baby items", "Bags"],
    care: "Machine washable. Can be tumble dried on low.",
  },
  {
    id: "acrylic",
    name: "Acrylic",
    properties: ["Affordable", "Machine washable", "Hypoallergenic", "Wide color range"],
    bestFor: ["Blankets", "Baby items", "Everyday projects", "Beginners"],
    care: "Machine washable and dryable. Easy care.",
  },
  {
    id: "alpaca",
    name: "Alpaca",
    properties: ["Very warm", "Soft", "Lightweight", "Hypoallergenic"],
    bestFor: ["Scarves", "Shawls", "Luxury garments", "Cold weather"],
    care: "Hand wash gently. Lay flat to dry.",
  },
  {
    id: "mohair",
    name: "Mohair",
    properties: ["Fluffy", "Warm", "Lustrous", "Lightweight"],
    bestFor: ["Shawls", "Accessories", "Holding with other yarn"],
    care: "Hand wash gently. Do not agitate.",
  },
  {
    id: "blend",
    name: "Blends",
    properties: ["Combines best qualities", "Varied properties", "Often affordable"],
    bestFor: ["Most projects", "When you want specific properties"],
    care: "Check the label — care depends on fiber content.",
  },
];

export const QUICK_PROJECTS: ProjectTemplate[] = [
  {
    id: "knit-scarf",
    name: "Beginner Scarf",
    craft: "knitting",
    difficulty: "beginner",
    description: "A simple garter stitch scarf — perfect for your first project.",
    materials: ["Worsted weight yarn (200g)", "8mm needles", "Scissors", "Tapestry needle"],
    steps: [
      "Cast on 20 stitches",
      "Knit every row until the scarf reaches your desired length",
      "Bind off all stitches",
      "Weave in ends",
    ],
  },
  {
    id: "knit-beanie",
    name: "Ribbed Beanie",
    craft: "knitting",
    difficulty: "beginner",
    description: "A stretchy ribbed beanie that fits most adults.",
    materials: ["DK or Worsted yarn (100g)", "4mm and 5mm needles", "Tapestry needle"],
    steps: [
      "With 4mm needles, cast on 80 stitches",
      "Work 2x2 rib (K2, P2) for 5cm",
      "Change to 5mm needles and continue ribbing for 15cm",
      "Decrease: *K2tog, P2* repeat across",
      "Continue decreasing until 10 stitches remain",
      "Cut yarn, thread through remaining stitches, pull tight",
      "Sew the seam",
    ],
  },
  {
    id: "crochet-granny",
    name: "Granny Square",
    craft: "crochet",
    difficulty: "beginner",
    description: "The classic crochet motif — make one or join many for blankets, bags, and more.",
    materials: ["DK yarn in multiple colors", "5mm hook", "Tapestry needle"],
    steps: [
      "Make a magic ring",
      "Round 1: Ch 3 (counts as dc), 2 dc in ring, ch 1, *3 dc in ring, ch 1* repeat 3 times, sl st to join",
      "Round 2: Ch 3, 2 dc in ch-1 space, ch 1, *3 dc in next ch-1 space, ch 1, 3 dc in same space, ch 1* repeat around, sl st to join",
      "Round 3: Continue the pattern, working corners into corner spaces",
      "Repeat until desired size",
      "Fasten off and weave in ends",
    ],
  },
  {
    id: "crochet-beanie",
    name: "Simple Crochet Beanie",
    craft: "crochet",
    difficulty: "beginner",
    description: "A quick double crochet beanie worked from the top down.",
    materials: ["Worsted yarn (100g)", "5.5mm hook", "Tapestry needle"],
    steps: [
      "Make a magic ring",
      "Round 1: 12 dc in ring, sl st to join",
      "Round 2: Ch 3, 2 dc in each st around (24 sts)",
      "Round 3: Ch 3, *dc in next st, 2 dc in next st* repeat (36 sts)",
      "Round 4: Ch 3, *dc in next 2 sts, 2 dc in next st* repeat (48 sts)",
      "Continue increasing until you reach the desired circumference",
      "Work even (no increases) until the hat reaches desired length",
      "Fasten off and weave in ends",
    ],
  },
  {
    id: "crochet-scarf",
    name: "Simple Scarf",
    craft: "crochet",
    difficulty: "beginner",
    description: "A straightforward double crochet scarf.",
    materials: ["Worsted yarn (200g)", "6mm hook", "Tapestry needle"],
    steps: [
      "Chain 25 (or desired width)",
      "Row 1: Dc in 4th ch from hook, dc across",
      "Row 2: Ch 3, dc across",
      "Repeat Row 2 until scarf reaches desired length",
      "Fasten off and weave in ends",
    ],
  },
  {
    id: "crochet-coaster",
    name: "Granny Square Coaster",
    craft: "crochet",
    difficulty: "beginner",
    description: "A quick, colorful coaster — great for using up scrap yarn.",
    materials: ["Cotton yarn scraps", "4mm hook", "Tapestry needle"],
    steps: [
      "Make a magic ring",
      "Round 1: Ch 3, 2 dc, ch 2, *3 dc, ch 2* repeat 3 times, sl st to join",
      "Round 2: Ch 3, 2 dc in ch-2 space, ch 2, 3 dc in same space, *3 dc in next ch-2 space, ch 2, 3 dc in same space* repeat around, sl st to join",
      "Fasten off and weave in ends",
    ],
  },
  {
    id: "knit-headband",
    name: "Simple Headband",
    craft: "knitting",
    difficulty: "beginner",
    description: "A quick ribbed headband — warm ears, fast project.",
    materials: ["Aran weight yarn (50g)", "5mm needles", "Tapestry needle"],
    steps: [
      "Cast on 14 stitches",
      "Work 2x2 rib (K2, P2) for 45cm or desired length",
      "Bind off",
      "Sew the short ends together to form a band",
    ],
  },
  {
    id: "crochet-bag",
    name: "Simple Tote Bag",
    craft: "crochet",
    difficulty: "intermediate",
    description: "A sturdy tote bag worked in the round.",
    materials: ["Cotton or t-shirt yarn (200g)", "6mm hook", "Tapestry needle"],
    steps: [
      "Ch 31",
      "Round 1: Sc in 2nd ch from hook, sc across, 3 sc in last ch, work along other side, 3 sc in last ch, sl st to join",
      "Rounds 2-6: Sc around evenly",
      "Rounds 7-25: Sc in back loop only (creates texture)",
      "Handles: Ch 40, skip 10 sts, sc in next 20, ch 40, skip 10, sc in next 20",
      "Work 2 more rounds around handles",
      "Fasten off and weave in ends",
    ],
  },
];

export const CROCHET_TERMS_UK_US: { uk: string; us: string }[] = [
  { uk: "chain (ch)", us: "chain (ch)" },
  { uk: "slip stitch (sl st)", us: "slip stitch (sl st)" },
  { uk: "double crochet (dc)", us: "single crochet (sc)" },
  { uk: "half treble crochet (htr)", us: "half double crochet (hdc)" },
  { uk: "treble crochet (tr)", us: "double crochet (dc)" },
  { uk: "double treble (dtr)", us: "treble crochet (tr)" },
  { uk: "triple treble (trtr)", us: "double treble (dtr)" },
  { uk: "miss", us: "skip" },
  { uk: "tension", us: "gauge" },
  { uk: "wool", us: "yarn" },
  { uk: "colour", us: "color" },
];

export const YARN_ESTIMATES: Record<string, Record<string, number>> = {
  scarf: { lace: 400, fingering: 350, sport: 300, dk: 250, worsted: 200, chunky: 150, "super-chunky": 120 },
  beanie: { lace: 150, fingering: 130, sport: 120, dk: 100, worsted: 80, chunky: 60, "super-chunky": 50 },
  sweater: { lace: 1500, fingering: 1200, sport: 1000, dk: 800, worsted: 650, chunky: 500, "super-chunky": 400 },
  blanket: { lace: 3000, fingering: 2500, sport: 2000, dk: 1500, worsted: 1200, chunky: 900, "super-chunky": 700 },
  socks: { lace: 300, fingering: 250, sport: 200, dk: 180, worsted: 150, chunky: 120, "super-chunky": 100 },
  hat: { lace: 150, fingering: 130, sport: 120, dk: 100, worsted: 80, chunky: 60, "super-chunky": 50 },
  bag: { lace: 400, fingering: 350, sport: 300, dk: 250, worsted: 200, chunky: 150, "super-chunky": 120 },
  cardigan: { lace: 1400, fingering: 1100, sport: 900, dk: 700, worsted: 550, chunky: 420, "super-chunky": 350 },
};
