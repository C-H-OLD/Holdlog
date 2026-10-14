import { Module, type DynamicModule } from '@nestjs/common';
import { AdminSessionService } from './admin-session.js';
import { AdminIdentityController, AdminSessionGuard } from './admin.controller.js';
import { IdentityService } from './identity.service.js';
import { IdentityController, MobileSessionGuard } from './identity.controller.js';

@Module({})
export class IdentityModule {
  /** Register the explicitly configured mobile service and export its guard for downstream feature modules. */
  static register(service: IdentityService): DynamicModule {
    return { module: IdentityModule, controllers: [IdentityController], providers: [{ provide: IdentityService, useValue: service }, MobileSessionGuard], exports: [IdentityService, MobileSessionGuard] };
  }
  /** Register the separate administrator principal/session boundary and export its guard for006/019. */
  static registerAdministrator(service:AdminSessionService):DynamicModule {
    return {module:IdentityModule,controllers:[AdminIdentityController],providers:[{provide:AdminSessionService,useValue:service},AdminSessionGuard],exports:[AdminSessionService,AdminSessionGuard]};
  }
}
