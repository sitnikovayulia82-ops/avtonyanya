import { resetTo } from '../lib/nav';
import { showAlert } from '../lib/dialog';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Field, P, Screen } from '../components/ui';
import { DEMO_CODE } from '../lib/demo';
import { isDemo, normalizePhone, supabase } from '../lib/supabase';

export default function Login() {
  const { role } = useLocalSearchParams<{ role?: 'nanny' | 'parent' }>();
  const [phoneInput, setPhoneInput] = useState('+7 ');
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    const p = normalizePhone(phoneInput);
    if (!p) {
      showAlert('Проверьте номер', 'Введите российский номер мобильного, например +7 900 123-45-67');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: p });
    setBusy(false);
    if (error) {
      showAlert('Не удалось отправить СМС', error.message);
      return;
    }
    setPhone(p);
  };

  const verify = async () => {
    if (!phone) return;
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' });
    if (error || !data.session) {
      setBusy(false);
      showAlert('Неверный код', error?.message ?? 'Попробуйте ещё раз');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.session.user.id)
      .maybeSingle();
    setBusy(false);
    if (profile) resetTo('/home');
    else router.replace(role ? `/register/${role}` : '/welcome');
  };

  return (
    <Screen>
      {!phone ? (
        <>
          <P>Мы отправим СМС с кодом — так мы подтверждаем, что номер принадлежит вам.</P>
          <Field
            label="Номер телефона"
            value={phoneInput}
            onChangeText={setPhoneInput}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          <Button title="Получить код" onPress={sendCode} loading={busy} />
        </>
      ) : (
        <>
          <P>Код отправлен на {phone}</P>
          {isDemo ? <P muted>Демо-версия: СМС не отправляется, введите код {DEMO_CODE}.</P> : null}
          <Field
            label="Код из СМС"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={6}
          />
          <Button title="Подтвердить" onPress={verify} loading={busy} disabled={code.length < 4} />
          <Button title="Изменить номер" variant="secondary" onPress={() => setPhone(null)} />
        </>
      )}
    </Screen>
  );
}
