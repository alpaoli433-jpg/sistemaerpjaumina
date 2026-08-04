import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { EventsModule } from './events/events.module';
import { DashboardModule } from './dashboard/dashboard.module';
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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
