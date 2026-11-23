import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, Text, View, type AlertButton } from 'react-native';

// На телефоне — системный Alert. В веб-версии (демо) системные диалоги
// браузера часто заблокированы, поэтому показываем своё окно.

interface DialogState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

let listener: ((d: DialogState | null) => void) | null = null;

export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  listener?.({ title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }] });
}

export function DialogHost() {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  useEffect(() => {
    listener = setDialog;
    return () => {
      listener = null;
    };
  }, []);
  if (!dialog) return null;

  const press = (b: AlertButton) => {
    setDialog(null);
    b.onPress?.();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setDialog(null)}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#2B2B2B', marginBottom: 8 }}>
            {dialog.title}
          </Text>
          {dialog.message ? (
            <Text style={{ fontSize: 15, lineHeight: 21, color: '#2B2B2B', marginBottom: 12 }}>
              {dialog.message}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            {dialog.buttons.map((b, i) => (
              <Pressable key={i} onPress={() => press(b)} hitSlop={8}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: b.style === 'destructive' ? '#D93636' : b.style === 'cancel' ? '#7A7A7A' : '#E8475F',
                    paddingVertical: 6,
                  }}
                >
                  {b.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
