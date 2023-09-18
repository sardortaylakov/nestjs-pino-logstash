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
            },
            transport: config.get<boolean>('LOCAL', true)
              ? {
                target: 'pino-pretty'
              }
              : {
                target: 'pino-socket',
                options: {
                  address: config.get<string>('LOGSTASH_HOST', 'localhost'),
                  port: config.get<number>('LOGSTASH_PORT', 5044),
                  mode: 'tcp',
                  reconnect: true,
                  recovery: true
                }
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
