import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

// 確保導入正確的回調類型
import {
  ClientSubscribeCallback,
  // IClientSubscribeOptions,
} from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null; // 初始化為 null

  constructor(private configService: ConfigService) {}

  /**
   * Connect to the MQTT broker when the module is initialized
   */
  async onModuleInit(): Promise<void> {
    const brokerUrl = this.configService.get<string>('MQTT_BROKER_URL');
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');

    try {
      // 添加 await 並創建連接 Promise
      await new Promise<void>((resolve, reject) => {
        if (!brokerUrl) {
          reject(new Error('MQTT_BROKER_URL is not defined'));
          return;
        }

        this.client = mqtt.connect(brokerUrl, {
          username,
          password,
          clientId: `cms-backend-${Date.now()}`,
        });

        this.client.on('connect', () => {
          this.logger.log('Connected to MQTT broker');
          resolve();
        });

        this.client.on('error', (error: Error) => {
          this.logger.error(`MQTT connection error: ${error.message}`);
          reject(error);
        });

        this.client.on('close', () => {
          this.logger.log('MQTT connection closed');
        });

        // 設定合理的超時時間
        setTimeout(() => {
          reject(new Error('MQTT connection timeout'));
        }, 5000);
      });
    } catch (error: unknown) {
      // 使用型別守衛安全地訪問 error.message
      if (error instanceof Error) {
        this.logger.error(`Failed to connect to MQTT broker: ${error.message}`);
      } else {
        this.logger.error('Failed to connect to MQTT broker: Unknown error');
      }
    }
  }

  /**
   * Disconnect from the MQTT broker when the module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    if (this.client && this.client.connected) {
      // 添加 await 使其成為實際的非同步操作
      await new Promise<void>((resolve) => {
        if (!this.client) {
          resolve();
          return;
        }

        this.client.end(false, {}, () => {
          this.logger.log('MQTT connection ended');
          resolve();
        });
      });
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

    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

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

    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      // 使用正確的參數順序和類型
      const subscribeCallback: ClientSubscribeCallback = (err, granted) => {
        if (granted == null) {
          this.logger.log('No client subscribe granted');
        }
        if (err) {
          this.logger.error(
            `Failed to subscribe to topic ${topic}: ${err.message}`,
          );
          reject(err);
        } else {
          this.logger.log(`Subscribed to topic ${topic}`);

          // 使用函數處理消息，避免多次綁定同一主題
          const messageHandler = (receivedTopic: string, message: Buffer) => {
            if (
              receivedTopic === topic ||
              this.topicMatches(topic, receivedTopic)
            ) {
              callback(receivedTopic, message.toString());
            }
          };

          // 添加消息處理程序
          this.client?.on('message', messageHandler);

          resolve();
        }
      };

      this.client.subscribe(topic, subscribeCallback);
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

    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

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
   * Get client connection status
   */
  isConnected(): boolean {
    return !!this.client && this.client.connected;
  }

  /**
   * Check if a received topic matches a subscription pattern (handling wildcards)
   */
  private topicMatches(pattern: string, topic: string): boolean {
    // Convert MQTT wildcards to regex
    // 修正轉義字符和全局替換
    const regexPattern = pattern.replace(/\+/g, '[^/]+').replace(/#/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }
}
