// To set up the app, follow these steps:
// 1. Clone the bare-expo repository: git clone https://github.com/holepunchto/bare-expo
// 2. cd bare-expo
// 3. npm install
// 4. Install additional dependencies: npm install hyperswarm hypercore-crypto b4a uuid react-native-render-html @react-native-picker/picker
// 5. Replace the content of index.tsx with the code below.
// 6. Run the app: npm run ios or npm run android

import '../polyfills';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Worklet } from 'react-native-bare-kit';
import bundle from './app.bundle.mjs';
import b4a from 'b4a';
import { marked } from 'marked';
import RenderHtml from 'react-native-render-html';

marked.setOptions({
  async: false,
});
import { Picker } from '@react-native-picker/picker';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Model {
  id: string;
  name: string;
}

const Thought = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <View style={styles.thoughtContainer}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.thoughtButton}>
        <Text style={styles.thoughtButtonText}>{isExpanded ? 'Hide Thought' : 'Show Thought'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.thoughtContent}>
          <RenderHtml contentWidth={width - 64} source={{ html: marked.parse(content) as string }} />
        </View>
      )}
    </View>
  );
};

export default function App() {
  const [serverKey, setServerKey] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPickerExpanded, setIsPickerExpanded] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const ipcRef = React.useRef<any>(null);

  useEffect(() => {
    const worklet = new Worklet();

    try {
      worklet.start('./app.bundle', bundle);
    } catch (err) {
      console.error('Failed to start worklet:', err);
    }
    ipcRef.current = worklet.IPC;

    const handleMessage = (msg: any) => {
      switch (msg.type) {
        case 'handshake_ack':
          setConnected(true);
          sendToPeer({ type: 'model_request' });
          break;
        case 'models_update':
          setModels(msg.models);
          if (msg.models.length > 0) {
            setSelectedModel(msg.models[0].id);
          }
          break;
        case 'response':
          if (msg.error) {
            alert('Error: ' + msg.error);
            setLoading(false);
          } else {
            if (msg.data) {
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content += msg.data;
                }
                return newMessages;
              });
            }
            if (msg.isComplete) {
              setLoading(false);
            }
          }
          break;
        case 'disconnected':
          setConnected(false);
          break;
        case 'error':
          alert('Connection error: ' + msg.error);
          setConnected(false);
          break;
        default:
          console.log('Unhandled message type:', msg.type);
      }
    };

    const onData = (data: any) => {
      const rawString = b4a.toString(data);
      console.log('Raw data string from worklet:', rawString);

      try {
        const msg = JSON.parse(rawString);
        console.log('Received from worklet:', msg);
        handleMessage(msg);
      } catch (e) {
        if (rawString.includes('}{')) {
          const parts = rawString.split('}{');
          parts.forEach((part: string, index: number) => {
            let jsonString = part;
            if (index > 0) {
              jsonString = '{' + jsonString;
            }
            if (index < parts.length - 1) {
              jsonString = jsonString + '}';
            }
            try {
              const msg = JSON.parse(jsonString);
              console.log('Received from worklet (partially parsed):', msg);
              handleMessage(msg);
            } catch (parseError) {
              console.error('Failed to parse part of JSON string:', jsonString, parseError);
            }
          });
        } else {
          console.error('JSON Parse error:', e, 'Raw string:', rawString);
        }
      }
    };

    ipcRef.current.on('data', onData);

    return () => {
      worklet.terminate();
      ipcRef.current.removeListener('data', onData);
    };
  }, []);

  const sendToIPC = (msg: any) => {
    if (ipcRef.current) {
      ipcRef.current.write(b4a.from(JSON.stringify(msg)));
    }
  };

  const connectToServer = () => {
    if (!serverKey) return;
    sendToIPC({ type: 'connect', topic: serverKey });
  };

  const sendToPeer = (data: any) => {
    sendToIPC({ type: 'send', data });
  };

  const sendMessage = () => {
    if (!prompt.trim() || loading || !selectedModel) return;

    const requestId = uuidv4();
    const userMessage: Message = { role: 'user', content: prompt };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setPrompt('');
    setLoading(true);

    sendToPeer({
      type: 'query',
      requestId,
      model: selectedModel,
      prompt,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <View style={[styles.message, styles.userMessage]}>
          <RenderHtml contentWidth={width - 50} source={{ html: marked.parse(item.content) as string }} />
        </View>
      );
    }

    const thoughtRegex = /<think>([\s\S]*?)<\/think>/;
    const thoughtMatch = item.content.match(thoughtRegex);
    const thoughtContent = thoughtMatch && thoughtMatch[1].trim() ? thoughtMatch[1].trim() : null;
    const mainContent = item.content.replace(thoughtRegex, '').trim();

    return (
      <View style={[styles.message, styles.aiMessage]}>
        {thoughtContent && <Thought content={thoughtContent} />}
        {mainContent ? (
          <RenderHtml contentWidth={width - 50} source={{ html: marked.parse(mainContent) as string }} />
        ) : (
          !thoughtContent && <RenderHtml contentWidth={width - 50} source={{ html: '<p>Loading...</p>' }} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!connected ? (
        <View style={styles.connectSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter server public key"
            value={serverKey}
            onChangeText={setServerKey}
          />
          <Button title="Connect" onPress={connectToServer} />
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => setIsPickerExpanded(!isPickerExpanded)} style={styles.pickerHeader}>
            <Text style={styles.pickerHeaderText}>
              Selected Model: {models.find(m => m.id === selectedModel)?.name || selectedModel || 'None'}
            </Text>
            <Text style={styles.pickerToggleIcon}>{isPickerExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {isPickerExpanded && (
            <Picker
              selectedValue={selectedModel}
              onValueChange={(itemValue) => {
                setSelectedModel(itemValue);
                setIsPickerExpanded(false); // Collapse after selection
              }}
              style={styles.picker}
            >
              {models.map((model) => (
                <Picker.Item key={model.id} label={model.name || model.id} value={model.id} />
              ))}
            </Picker>
          )}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            style={styles.chatList}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {loading && <ActivityIndicator />}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.promptInput}
              placeholder="Type your message..."
              value={prompt}
              onChangeText={setPrompt}
            />
            <Button title="Send" onPress={sendMessage} disabled={loading} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  connectSection: { flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  chatList: { flex: 1 },
  message: { padding: 10, marginVertical: 5, borderRadius: 5 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6' },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  promptInput: { flex: 1, borderWidth: 1, padding: 10, marginRight: 10 },
  thoughtContainer: {
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  thoughtButton: {
    padding: 12,
    backgroundColor: '#efefef',
    alignItems: 'center',
  },
  thoughtButtonText: {
    fontWeight: 'bold',
    color: '#555',
  },
  thoughtContent: {
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  pickerHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerToggleIcon: {
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});
