import { Module } from '@nestjs/common';
import { AuditModule } from '../../shared/audit/audit.module';
import { GastosController } from './gastos.controller';
import { GastosService } from './gastos.service';

@Module({
  imports: [AuditModule],
  controllers: [GastosController],
  providers: [GastosService],
  exports: [GastosService],
})
export class GastosModule {}
