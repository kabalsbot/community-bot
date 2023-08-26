namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    TOKEN: string;
    API_URL: string;
    API_TOKEN: string;
    GUILD_ID: string;
    NOTIFICATION_CHANNEL_ID: string;
    PRIME_ROLE_ID: string;
    VOTE_ROLE_ID: string;
  }
}
