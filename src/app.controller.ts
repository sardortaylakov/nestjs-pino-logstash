import { Controller, Get } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get('api/hello')
  getHello(): string {
    this.logger.log('Processing request in AppController.');
    return this.appService.getHello();
  }
}
