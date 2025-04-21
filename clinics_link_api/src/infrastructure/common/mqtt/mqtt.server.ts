import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(private configService: ConfigService) {}

  /**
   * Connect to the MQTT broker when the module is initialized
   */
  async onModuleInit() {
    const brokerUrl = this.configService.get<string>('MQTT_BROKER_URL');
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');

    try {
      this.client = mqtt.connect(brokerUrl!, {
        username,
        password,
        clientId: `cms-backend-${Date.now()}`,
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to MQTT broker');
      });

      this.client.on('error', (error) => {
        this.logger.error(`MQTT connection error: ${error.message}`);
      });

      this.client.on('close', () => {
        this.logger.log('MQTT connection closed');
      });
    } catch (error) {
      this.logger.error(`Failed to connect to MQTT broker: ${error.message}`);
    }
  }

  /**
   * Disconnect from the MQTT broker when the module is destroyed
   */
  async onModuleDestroy() {
    if (this.client && this.client.connected) {
      this.client.end();
      this.logger.log('MQTT connection ended');
    }
  }

  /**
   * Publish a message to a topic
   */
  async publish(
    topic: string,
    message: string | object,
    options?: mqtt.IClientPublishOptions,
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.error('Cannot publish: MQTT client not connected');
      return;
    }

    const payload =
      typeof message === 'string' ? message : JSON.stringify(message);

    return new Promise((resolve, reject) => {
      this.client.publish(topic, payload, options || {}, (error) => {
        if (error) {
          this.logger.error(
            `Failed to publish to topic ${topic}: ${error.message}`,
          );
          reject(error);
        } else {
          this.logger.debug(`Message published to topic ${topic}`);
          resolve();
        }
      });
    });
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(
    topic: string,
    callback: (topic: string, message: string) => void,
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.error('Cannot subscribe: MQTT client not connected');
      return;
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (error) => {
        if (error) {
          this.logger.error(
            `Failed to subscribe to topic ${topic}: ${error.message}`,
          );
          reject(error);
        } else {
          this.logger.log(`Subscribed to topic ${topic}`);

          // Add message handler for this topic
          this.client.on('message', (receivedTopic, message) => {
            if (
              receivedTopic === topic ||
              this.topicMatches(topic, receivedTopic)
            ) {
              callback(receivedTopic, message.toString());
            }
          });

          resolve();
        }
      });
    });
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(topic: string): Promise<void> {
    if (!this.client || !this.client.connected) {
      this.logger.error('Cannot unsubscribe: MQTT client not connected');
      return;
    }

    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (error) => {
        if (error) {
          this.logger.error(
            `Failed to unsubscribe from topic ${topic}: ${error.message}`,
          );
          reject(error);
        } else {
          this.logger.log(`Unsubscribed from topic ${topic}`);
          resolve();
        }
      });
    });
  }

  /**
   * Check if a received topic matches a subscription pattern (handling wildcards)
   */
  private topicMatches(pattern: string, topic: string): boolean {
    // Convert MQTT wildcards to regex
    const regexPattern = pattern.replace('+', '[^/]+').replace('#', '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }
}
