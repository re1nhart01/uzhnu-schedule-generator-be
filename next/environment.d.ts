import "next";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CONNECT_WALLET_PROJECT_ID: string;
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_AUTH_URL: string;
      NEXT_PUBLIC_SWAP_API_URL: string;
      NEXT_PUBLIC_SOLANA_NETWORK: string;
      NEXT_PUBLIC_SWAP_ROUTING_API: string;
      NEXT_PUBLIC_SWAP_SDK: string;
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: string;
      PRIVATE_BETA_PASSWORD: string;
      IP_TRACER_KEY: string;
      ANALYZE: boolean;
      NEXT_PUBLIC_OPENSEA_API_KEY: string;
      NEXT_PUBLIC_MIXPANEL_TOKEN: string;
    }
  }
}

export {};