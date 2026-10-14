import { Module, type DynamicModule } from '@nestjs/common';
import { IdentityService } from './identity.service.js';
import { IdentityController, MobileSessionGuard } from './identity.controller.js';

@Module({})
export class IdentityModule {
  /** Register the explicitly configured mobile service and export its guard for downstream feature modules. */
  static register(service: IdentityService): DynamicModule {
    return { module: IdentityModule, controllers: [IdentityController], providers: [{ provide: IdentityService, useValue: service }, MobileSessionGuard], exports: [IdentityService, MobileSessionGuard] };
  }
}
