import { useState, useEffect, useRef, useCallback } from "react";
import * as mqtt from "mqtt";

export type MqttConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

// Use mqtt.js QoS type
export type QoS = 0 | 1 | 2;

export type MqttMessage = {
  topic: string;
  payload: any;
  qos: QoS;
  retain: boolean;
};

export interface MqttOptions {
  // Connection options
  url?: string;
  clientId?: string;
  username?: string;
  password?: string;
  clean?: boolean;
  keepalive?: number;
  connectTimeout?: number;
  reconnectPeriod?: number;
  // Event handlers
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: MqttMessage) => void;
}

export function useMqtt(options: MqttOptions = {}) {
  const [status, setStatus] = useState<MqttConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const subscribedTopicsRef = useRef<{ [topic: string]: QoS }>({});

  // Get MQTT broker URL from environment or options
  const getMqttUrl = useCallback(() => {
    if (options.url) return options.url;
    
    // Try to get from environment variable (set in the .env file)
    const envUrl = import.meta.env.VITE_MQTT_BROKER_URL || process.env.VITE_MQTT_BROKER_URL;
    if (envUrl) return envUrl;
    
    // Fallback to WebSocket connection based on current host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/mqtt`;
  }, [options.url]);

  // Connect to MQTT broker
  const connect = useCallback(() => {
    // Clean up existing connection if any
    if (client) {
      client.end(true);
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      setStatus("connecting");
      const mqttUrl = getMqttUrl();
      console.log(`Connecting to MQTT broker at ${mqttUrl}`);

      const mqttClient = mqtt.connect(mqttUrl, {
        clientId: options.clientId || `clinic-web-${Math.random().toString(16).substring(2, 10)}`,
        username: options.username,
        password: options.password,
        clean: options.clean !== undefined ? options.clean : true,
        keepalive: options.keepalive || 60,
        connectTimeout: options.connectTimeout || 30000,
        reconnectPeriod: options.reconnectPeriod || 3000,
      });

      mqttClient.on("connect", () => {
        console.log("MQTT connection established");
        setStatus("connected");
        setError(null);
        setIsReady(true);
        
        // Resubscribe to previously subscribed topics
        Object.entries(subscribedTopicsRef.current).forEach(([topic, qos]) => {
          mqttClient.subscribe(topic, { qos });
        });
        
        if (options.onConnect) options.onConnect();
      });

      mqttClient.on("reconnect", () => {
        console.log("MQTT reconnecting...");
        setStatus("reconnecting");
      });

      mqttClient.on("message", (topic, payload, packet) => {
        try {
          const message = {
            topic,
            payload: JSON.parse(payload.toString()),
            qos: packet.qos,
            retain: packet.retain,
          };
          if (options.onMessage) options.onMessage(message);
        } catch (err) {
          // If JSON parsing fails, return the raw payload as string
          const message = {
            topic,
            payload: payload.toString(),
            qos: packet.qos,
            retain: packet.retain,
          };
          if (options.onMessage) options.onMessage(message);
        }
      });

      mqttClient.on("error", (err) => {
        console.error("MQTT error:", err);
        setStatus("error");
        setError(err);
        if (options.onError) options.onError(err);
      });

      mqttClient.on("close", () => {
        console.log("MQTT connection closed");
        setStatus("disconnected");
        setIsReady(false);
        if (options.onDisconnect) options.onDisconnect();
      });

      mqttClient.on("offline", () => {
        console.log("MQTT client is offline");
        setStatus("disconnected");
        setIsReady(false);
      });

      setClient(mqttClient);
    } catch (err) {
      console.error("Error setting up MQTT connection:", err);
      setStatus("error");
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log("Attempting to reconnect to MQTT...");
        connect();
      }, 5000);
    }
  }, [client, getMqttUrl, options]);

  // Disconnect from MQTT broker
  const disconnect = useCallback(() => {
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (client) {
      console.log("Closing MQTT connection");
      setIsReady(false);
      client.end(true, undefined, () => {
        setStatus("disconnected");
      });
    }
  }, [client]);

  // Subscribe to topic
  const subscribe = useCallback((topic: string, qos: QoS = 0) => {
    if (!client || !isReady) {
      console.warn("MQTT client not ready. Cannot subscribe to topic:", topic);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      client.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error(`Error subscribing to topic ${topic}:`, err);
          resolve(false);
        } else {
          console.log(`Subscribed to MQTT topic: ${topic} with QoS ${qos}`);
          subscribedTopicsRef.current[topic] = qos;
          resolve(true);
        }
      });
    });
  }, [client, isReady]);

  // Unsubscribe from topic
  const unsubscribe = useCallback((topic: string) => {
    if (!client || !isReady) {
      console.warn("MQTT client not ready. Cannot unsubscribe from topic:", topic);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Error unsubscribing from topic ${topic}:`, err);
          resolve(false);
        } else {
          console.log(`Unsubscribed from MQTT topic: ${topic}`);
          delete subscribedTopicsRef.current[topic];
          resolve(true);
        }
      });
    });
  }, [client, isReady]);

  // Publish message to topic
  const publish = useCallback((topic: string, payload: any, options?: mqtt.IClientPublishOptions) => {
    if (!client || !isReady) {
      console.warn("MQTT client not ready. Cannot publish message");
      return false;
    }

    // Convert object payload to JSON string
    const messagePayload = typeof payload === 'object' 
      ? JSON.stringify(payload) 
      : payload;

    return new Promise<boolean>((resolve) => {
      client.publish(
        topic, 
        messagePayload, 
        options || { qos: 0, retain: false }, 
        (err) => {
          if (err) {
            console.error(`Error publishing to topic ${topic}:`, err);
            resolve(false);
          } else {
            console.log(`Published message to MQTT topic: ${topic}`);
            resolve(true);
          }
        }
      );
    });
  }, [client, isReady]);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    isReady,
    error,
    client,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
  };
}

// Helper hook for subscribing to a specific topic
export function useMqttSubscription(topic: string, options: {
  qos?: QoS;
  onMessage?: (message: MqttMessage) => void;
  enabled?: boolean;
} = {}) {
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<MqttMessage | null>(null);
  const { isReady, subscribe, unsubscribe } = useMqtt();
  
  const { qos = 0, onMessage, enabled = true } = options;
  
  const handleMessage = useCallback((message: MqttMessage) => {
    if (message.topic === topic) {
      setLastMessage(message);
      setMessages(prev => [...prev, message]);
      if (onMessage) onMessage(message);
    }
  }, [onMessage, topic]);
  
  useEffect(() => {
    if (!isReady || !enabled) return;
    
    // Setting up subscription
    const setupSubscription = async () => {
      // Subscribe to the topic
      await subscribe(topic, qos);
    };
    
    setupSubscription();
    
    // Clean up subscription on unmount or when disabled
    return () => {
      unsubscribe(topic);
    };
  }, [isReady, topic, qos, subscribe, unsubscribe, enabled]);
  
  return { messages, lastMessage };
}

// Helper hook for creating clinic-specific MQTT topics
export function useClinicMqtt(clinicId: string | null | undefined) {
  const mqtt = useMqtt();
  
  // Generate topic prefixed with clinic ID
  const getTopic = useCallback((suffix: string) => {
    if (!clinicId) return null;
    return `cms/clinic/${clinicId}/${suffix}`;
  }, [clinicId]);
  
  // Subscribe to clinic-specific topic
  const subscribeToClinic = useCallback((suffix: string, qos: QoS = 0) => {
    const topic = getTopic(suffix);
    if (!topic) return Promise.resolve(false);
    return mqtt.subscribe(topic, qos);
  }, [getTopic, mqtt]);
  
  // Unsubscribe from clinic-specific topic
  const unsubscribeFromClinic = useCallback((suffix: string) => {
    const topic = getTopic(suffix);
    if (!topic) return Promise.resolve(false);
    return mqtt.unsubscribe(topic);
  }, [getTopic, mqtt]);
  
  // Publish to clinic-specific topic
  const publishToClinic = useCallback((suffix: string, payload: any, options?: mqtt.IClientPublishOptions) => {
    const topic = getTopic(suffix);
    if (!topic) return Promise.resolve(false);
    return mqtt.publish(topic, payload, options);
  }, [getTopic, mqtt]);
  
  return {
    ...mqtt,
    getTopic,
    subscribeToClinic,
    unsubscribeFromClinic,
    publishToClinic,
  };
}