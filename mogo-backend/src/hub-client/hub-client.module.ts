import { Module } from '@nestjs/common';
import { HubHttpService } from './hub-http.service';
import { HubClientService } from './hub-client.service';
import { HubInternalService } from './hub-internal.service';

@Module({
  providers: [HubHttpService, HubClientService, HubInternalService],
  exports: [HubClientService, HubInternalService],
})
export class HubClientModule {}
