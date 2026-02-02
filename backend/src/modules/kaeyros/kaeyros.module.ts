import { Module } from '@nestjs/common';
import { KaeyrosService } from './kaeyros.service';
import { KaeyrosController } from './kaeyros.controller';

@Module({
  controllers: [KaeyrosController],
  providers: [KaeyrosService],
  exports: [KaeyrosService],
})
export class KaeyrosModule {}
