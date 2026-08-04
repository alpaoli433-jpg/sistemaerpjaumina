import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { EventsModule } from './modules/events/events.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { ProductosModule } from './modules/productos/productos.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { ComprasModule } from './modules/compras/compras.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { CajaModule } from './modules/caja/caja.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { PersonalModule } from './modules/personal/personal.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { StaffModule } from './modules/staff/staff.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    IngredientsModule,
    RecipesModule,
    EventsModule,
    DashboardModule,
    ClientesModule,
    ProveedoresModule,
    ProductosModule,
    InventarioModule,
    ComprasModule,
    VentasModule,
    CajaModule,
    GastosModule,
    PersonalModule,
    AuditoriaModule,
    ConfiguracionModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
