import {
  INestApplication,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
// Define custom types for Prisma events
type PrismaQueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

type PrismaLogEvent = {
  timestamp: Date;
  message: string;
  target: string;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Use type assertions for events
    this.$on('info' as never, (event: PrismaLogEvent) => {
      this.logger.info(`Info: ${event.message}`);
    });

    this.$on('error' as never, (event: PrismaLogEvent) => {
      this.logger.error(`Error: ${event.message}`);
    });

    this.$on('warn' as never, (event: PrismaLogEvent) => {
      this.logger.warn(`Warning: ${event.message}`);
    });

    this.$on('query' as never, (event: PrismaQueryEvent) => {
      this.logger.info(`Query: ${event.query} | Duration: ${event.duration}ms`);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }

  async checkConnection(): Promise<string> {
    try {
      await this.$queryRaw`SELECT 1`;
      return 'Database connection is OK';
    } catch (e: any) {
      return `Database connection failed: ${e.message}`;
    }
  }

  async transactional<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(fn);
  }
}
