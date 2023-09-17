import { Controller, Get } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { AppService } from './app.service';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController {
  constructor(
    @InjectPinoLogger(AppController.name)
    private readonly pinoLogger: PinoLogger,
    private readonly appService: AppService
  ) {}

  @Get('api/hello')
  getHello(): string {
    this.pinoLogger.assign({ user_id: uuidv4() });
    this.pinoLogger.info('Processing request in AppController.');
    return this.appService.getHello();
  }
}
