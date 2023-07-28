/// <reference types="vite-plugin-fastify-routes/client" />

declare namespace NodeJS {
  export interface ProcessEnv {
    HOST: string;
    PORT: number;
  }
}
