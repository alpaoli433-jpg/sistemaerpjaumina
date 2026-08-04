import { Module } from '@nestjs/common';
import { AuditModule } from '../../shared/audit/audit.module';
import { PersonalController } from './personal.controller';
import { PersonalService } from './personal.service';

@Module({
  imports: [AuditModule],
  controllers: [PersonalController],
  providers: [PersonalService],
  exports: [PersonalService],
})
export class PersonalModule {}
