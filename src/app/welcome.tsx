import { resetTo } from '../lib/nav';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, colors, H1, P, Screen } from '../components/ui';
import { useAuth } from '../lib/auth';
import { demoSignIn } from '../lib/demo';
import { isDemo } from '../lib/supabase';

export default function Welcome() {
  const { session } = useAuth();

  // Если человек уже вошёл по телефону, но анкету не заполнил — сразу к анкете.
  const go = (role: 'nanny' | 'parent') =>
    session ? router.push(`/register/${role}`) : router.push({ pathname: '/login', params: { role } });

  const quick = (role: 'parent' | 'nanny' | 'admin') => {
    demoSignIn(role);
    resetTo('/');
  };

  return (
    <Screen>
      <View style={{ height: 40 }} />
      <Text style={{ fontSize: 56, textAlign: 'center' }}>🚗👧</Text>
      <H1>Автоняня</H1>
      <P muted>
        Безопасные поездки детей в школу, сад, на кружки и тренировки. Проверенные автоняни из
        вашего округа Москвы.
      </P>

      {isDemo && !session ? (
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            Быстрый просмотр демо
          </Text>
          <P muted>
            Войдите под готовым примером, чтобы увидеть, как выглядит приложение для каждой роли.
            Ниже можно пройти регистрацию с нуля.
          </P>
          <Button title="Смотреть как родитель" onPress={() => quick('parent')} />
          <Button title="Смотреть как автоняня" onPress={() => quick('nanny')} />
          <Button title="Смотреть как модератор" variant="secondary" onPress={() => quick('admin')} />
        </Card>
      ) : null}

      <Card>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          Я родитель
        </Text>
        <P muted>Создайте профиль ребёнка и найдите автоняню в своём округе.</P>
        <Button title="Найти автоняню" onPress={() => go('parent')} />
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          Я автоняня
        </Text>
        <P muted>
          Возите детей в удобных вам округах. Нужны паспорт и подтверждённый телефон — мы проверяем
          каждую автоняню.
        </P>
        <Button title="Стать автоняней" variant="secondary" onPress={() => go('nanny')} />
      </Card>

      {session ? (
        <Button title="Выйти из аккаунта" variant="secondary" onPress={() => router.replace('/profile')} />
      ) : null}
    </Screen>
  );
}
