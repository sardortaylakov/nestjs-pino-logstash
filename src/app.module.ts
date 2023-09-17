import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    LoggerModule.forRoot({
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
            environment: 'local'
          };
        },
        serializers: {
          req: () => undefined,
          res: () => undefined,
          err: (error) => error.stack
        }
      },
      renameContext: 'logger_name'
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
