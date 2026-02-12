export const PLATFORM_CONFIG = {
  BURN_AMOUNT: 10000,
  TOKEN_SYMBOL: "Dropy",
  FEE_SOL: 0.005,
  TOKENOMICS: {
    CREATION_FEE: 1, // 1 SOL as per new spec
    BURN_PERCENT: 50,
    REWARDS_PERCENT: 40,
    SYSTEM_PERCENT: 10,
    SYSTEM_WALLET: "DajB37qp74UzwND3N1rVWtLdxr55nhvuK2D4x476zmns",
  },
  SOCIAL_LINKS: {
    TELEGRAM: "https://t.me/Dropy_Sol",
    TWITTER: "https://x.com/Dropy_Sol",
    DISCORD: "https://discord.gg/Dropy_Sol",
  },
  TOKEN_DETAILS: {
    NAME: "Dropy Token",
    ADDRESS: "EPjFW33rdvq2zhpks87j3jt7jjh8p7wlwnvxy3cb68",
    PRICE: 0.42,
    BUY_LINKS: {
      PUMP_FUN: "https://pump.fun/",
      DEX_SCREENER: "https://dexscreener.com/solana/",
      JUPITER:
        "https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=",
      PUMP_FUN_LOGO: "https://i.ibb.co/gMb1wq1s/pump-fun-logo.webp",
    },
  },
  ASSETS: {
    // Main logo used in navigation and headers
    MAIN_LOGO: "https://i.ibb.co/TBd95CcD/1-Untitled-design.png",
    // Mascot image used in the "About" section
    ABOUT_MASCOT: "https://i.ibb.co/nM5YkVjq/1.png",
    // Mascot image used in the main hero/landing section
    LANDING_MASCOT: "https://i.ibb.co/nM5YkVjq/1.png",
    // Character image for question states or help sections
    CHARACTER_QUESTION:
      "https://i.ibb.co/m5H2kkdt/20260110-1326-Cute-Crypto-Mascot-remix-01kektec50ft99asyk3jyra2t8.png",
    // Character image for success or completion states
    CHARACTER_SUCCESS:
      "https://i.ibb.co/Zbky3Dm/20260109-2036-Image-Generation-remix-01kej0pqgpep3t2h7x1dc423y0.png",
    // Character image for greeting or introductory states
    CHARACTER_HELLO:
      "https://i.ibb.co/pBnZXZps/20260109-2049-Image-Generation-remix-01kej1dxwve5s9jwddtakxjtga.png",
    // Banner image for legal and terms of service pages
    LEGAL_BANNER:
      "https://i.ibb.co/Wv7S6FnP/20260110-1153-Image-Generation-remix-01kekn4z79ebt8j4bctxwdx91c.png",
    // Banner image for the privacy policy page
    PRIVACY_BANNER:
      "https://i.ibb.co/hFY8hK9v/20260110-1301-Image-Generation-remix-01keks0yejfjy9dp3qyxkkjbnt.png",
    // Character image for the deflationary section on landing page
    DEFLATIONARY_MONK:
      "https://i.ibb.co/ycPX4D4Z/20260110-1319-Meditating-Crypto-Monk-remix-01kekt16kyft7vsz2w75t40rxd.png",
  },
  SMART_CONTRACT: {
    ENABLED: false,
    PROGRAM_ID: "Dropy11111111111111111111111111111111111111", // Placeholder
    DEVNET_PROGRAM_ID: "Dropy11111111111111111111111111111111111111",
    MIN_DEPOSIT: 0.1,
  },
  STATS: {
    // Total tokens burned by the platform through campaign creations
    TOTAL_BURNED: 0,
  },
  ui: {
    walletSelectorBg:
      "https://i.ibb.co/xq2jkksm/20260109-2047-Image-Generation-remix-01kej1a44aer6vxak4n8tx8e6j.png",
    walletIcons: {
      solana: "https://cryptologos.cc/logos/solana-sol-logo.png",
      phantom:
        "https://play-lh.googleusercontent.com/obRvW02OTYLzJuvic1ZbVDVXLXzI0Vt_JGOjlxZ92XMdBF_i3kqU92u9SgHvJ5pySdM",
      solflare: "https://solflare.com/favicon.ico",
      bybit: "https://www.bybit.com/favicon.ico",
      pumpfun: "https://i.ibb.co/gMb1wq1s/pump-fun-logo.webp",
      jupiter: "https://jup.ag/favicon.ico",
      dexscreener: "https://dexscreener.com/favicon.ico",
    },
  },
  CONSTANTS: {
    MIN_REPUTATION_FOR_REWARD: 50,
    BURN_PERCENTAGE_PER_CAMPAIGN: 5,
  },
  PAYMENT_MODEL: {
    GAS_BUFFER_MARGIN: 1.15,
    DEFAULT_SWAP_BUDGET_SOL: 0.2,
    LEADERBOARD_TASKS_PERCENT: 40,
    LEADERBOARD_REFERRALS_PERCENT: 40,
    SYSTEM_PERCENT: 20,
    REFERRAL_MIN_TASKS: 1,
    REFERRAL_MIN_CLAIMS: 1,
    BASE_CREATION_FEE_SOL: 0.5,
    PREMIUM_PROMOTION_FEE_SOL: 0.1,
  },
};

export const PUBLIC_SOLANA_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://api.devnet.solana.com",
];

const parseCsv = (value?: string) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const getEnv = (key: string) => (typeof process !== "undefined" ? process.env[key] : undefined);

export const SERVER_CONFIG = {
  SOLANA_CLUSTER: getEnv("SOLANA_CLUSTER") || "mainnet-beta",
  SOLANA_RPC_ENDPOINTS:
    parseCsv(getEnv("SOLANA_RPC_ENDPOINTS")) ||
    PUBLIC_SOLANA_RPC_ENDPOINTS,
  REWARDS_PAYOUTS_ENABLED: getEnv("REWARDS_PAYOUTS_ENABLED") === "true",
  MORALIS_API_KEY: getEnv("MORALIS_API_KEY"),
  SMART_CONTRACT_ENABLED: getEnv("SMART_CONTRACT_ENABLED") === "true",
  SMART_CONTRACT_PROGRAM_ID: getEnv("SMART_CONTRACT_PROGRAM_ID") || "Dropy11111111111111111111111111111111111111",
  SMART_CONTRACT_CLAIMS_FALLBACK_TO_TRANSFER:
    getEnv("SMART_CONTRACT_CLAIMS_FALLBACK_TO_TRANSFER") === "true",
};

export const ADMIN_CONFIG = {
  superAdminWallets: ["DajB37qp74UzwND3N1rVWtLdxr55nhvuK2D4x476zmns"],
};

export const CONFIG = PLATFORM_CONFIG;
