import { Stack } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../components/ui';
import { AuthProvider } from '../lib/auth';
import { DialogHost } from '../lib/dialog';
import { isDemo } from '../lib/supabase';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* В браузере показываем приложение в «телефонной» ширине по центру. */}
      <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#F1E6E1' : colors.bg }}>
      <View style={Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: colors.bg, boxShadow: '0 0 24px rgba(90,61,51,0.12)' } as any : { flex: 1 }}>
      {isDemo ? (
        <View style={{ backgroundColor: colors.text, paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>
            Демо-версия · данные вымышленные · СМС-код 1234
          </Text>
        </View>
      ) : null}
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            headerBackTitle: 'Назад',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Вход по телефону' }} />
          <Stack.Screen name="register/nanny" options={{ title: 'Анкета автоняни' }} />
          <Stack.Screen name="register/parent" options={{ title: 'Анкета родителя' }} />
          <Stack.Screen name="home" options={{ title: 'Автоняня', headerBackVisible: false }} />
          <Stack.Screen name="child/edit" options={{ title: 'Профиль ребёнка' }} />
          <Stack.Screen name="profile" options={{ title: 'Мой профиль' }} />
          <Stack.Screen name="admin" options={{ title: 'Проверка автонянь' }} />
        </Stack>
      </AuthProvider>
      <DialogHost />
      </View>
      </View>
    </SafeAreaProvider>
  );
}
