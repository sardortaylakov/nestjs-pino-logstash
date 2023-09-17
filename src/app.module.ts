import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            autoLogging: false,
            base: undefined,
            genReqId: () => uuidv4(),
            messageKey: 'message',
            formatters: {
              level: (label: string) => ({ level: label.toUpperCase() })
            },
            customProps: (req: IncomingMessage) => {
              return {
                correlation_id: req.id,
                request_method: req.method,
                request_url: req.url,
                environment: config.get<string>('ENVIRONMENT', 'local')
              };
            },
            serializers: {
              req: () => undefined,
              res: () => undefined,
              err: (error) => error.stack
            }
          },
          renameContext: 'logger_name'
        };
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
