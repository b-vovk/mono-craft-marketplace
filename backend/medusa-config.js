import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  // SENDGRID_API_KEY,
  // SENDGRID_FROM_EMAIL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE
} from "@/lib/constants";

loadEnv(process.env.NODE_ENV, process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: true,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`,
            },
          },
        ],
      },
    },
    {
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        },
      },
    },
    // NOTE: You can enable the sendgrid notification provider by uncommenting the following block
    //       ...just make sure to remove the resend provider block below
    //
    // {
    //   key: Modules.NOTIFICATION,
    //   resolve: '@medusajs/notification',
    //   options: {
    //     providers: [
    //       {
    //         resolve: '@medusajs/notification-sendgrid',
    //         id: 'sendgrid',
    //         options: {
    //           channels: ['email'],
    //           api_key: SENDGRID_API_KEY,
    //           from: SENDGRID_FROM_EMAIL,
    //         }
    //       }
    //     ]
    //   }
    // },
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/email-notifications',
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: RESEND_API_KEY,
              from: RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
    {
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
  ],
  plugins: [
    // 'medusa-fulfillment-manual'
  ]
});
