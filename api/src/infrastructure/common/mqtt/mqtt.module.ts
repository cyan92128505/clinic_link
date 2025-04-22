import { Module, Global } from '@nestjs/common';
import { MqttService } from './mqtt.server';

@Global()
@Module({
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
