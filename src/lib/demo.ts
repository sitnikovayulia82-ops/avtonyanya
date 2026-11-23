// Демо-режим: приложение работает без сервера, данные живут в памяти браузера.
// Включается переменной EXPO_PUBLIC_DEMO=1 (используется для показа клиенту).
// Повторяет логику supabase/schema.sql: проверка автонянь, поиск по районам и т.д.
import { ageFrom } from './types';

export const DEMO_CODE = '1234';

type Row = Record<string, any>;
type Listener = (event: string, session: any) => void;

const now = () => new Date().toISOString();
let seq = 100;
const uuid = () => `demo-${++seq}-${Math.random().toString(36).slice(2, 8)}`;

function placeholder(title: string, sub: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
<rect width="480" height="320" rx="18" fill="${bg}"/>
<rect x="28" y="70" width="130" height="170" rx="10" fill="#ffffff" opacity="0.85"/>
<circle cx="93" cy="130" r="32" fill="#c9b8ae"/><rect x="58" y="172" width="70" height="50" rx="20" fill="#c9b8ae"/>
<rect x="185" y="88" width="240" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
<rect x="185" y="122" width="200" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
<rect x="185" y="156" width="220" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
<rect x="185" y="190" width="160" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
<text x="240" y="44" font-family="Arial" font-size="22" font-weight="700" fill="#5a3d33" text-anchor="middle">${title}</text>
<text x="240" y="290" font-family="Arial" font-size="16" fill="#5a3d33" text-anchor="middle">${sub}</text>
</svg>`;
  // base64, а не utf8: react-native-web перекодирует utf8-ссылки и ломает их.
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// ---------------- Примеры данных (вымышленные) ----------------
const users: { id: string; phone: string }[] = [];
const profiles: Row[] = [];
const nannyProfiles: Row[] = [];
const children: Row[] = [];
const files = new Map<string, string>();

function addUser(id: string, phone: string, profile: Row | null) {
  users.push({ id, phone });
  if (profile) profiles.push({ id, phone: '+' + phone, city: 'Набережные Челны', pd_consent_at: now(), created_at: now(), ...profile });
}

function addNanny(id: string, phone: string, name: string, districts: string[], n: Row) {
  addUser(id, phone, { role: 'nanny', full_name: name, districts });
  files.set(`${id}/passport.jpg`, placeholder('ПАСПОРТ — образец', name, '#F3D9CF'));
  files.set(`${id}/selfie.jpg`, placeholder('СЕЛФИ С ПАСПОРТОМ — образец', name, '#E5E1F3'));
  nannyProfiles.push({
    user_id: id,
    has_child_seat: true,
    passport_photo_path: `${id}/passport.jpg`,
    selfie_path: `${id}/selfie.jpg`,
    rejection_reason: null,
    created_at: now(),
    ...n,
  });
}

function seed() {
  addUser('demo-admin', '79000000000', { role: 'admin', full_name: 'Модератор', districts: [] });

  addUser('demo-parent', '79170000001', { role: 'parent', full_name: 'Анна', districts: ['new_city', 'ges'] });
  children.push(
    { id: 'c1', parent_id: 'demo-parent', name: 'Соня', birth_date: '2018-03-12', school: 'Школа №45', grade: '2 «Б»', from_district: 'new_city', to_district: 'ges', schedule: 'Пн–Пт: из школы в 13:00 домой\nВт, Чт: на танцы к 15:30', notes: 'Аллергия на орехи', created_at: now() },
    { id: 'c2', parent_id: 'demo-parent', name: 'Тимур', birth_date: '2015-09-02', school: 'Ледовый дворец «Боровецкий»', grade: 'хоккей, группа 2015', from_district: 'new_city', to_district: 'ges', schedule: 'Пн, Ср, Пт: на тренировку к 17:00, обратно в 19:00', notes: null, created_at: now() },
  );

  addUser('demo-parent2', '79170000002', { role: 'parent', full_name: 'Гульнара', districts: ['zyab'] });
  children.push({ id: 'c3', parent_id: 'demo-parent2', name: 'Амир', birth_date: '2017-05-20', school: 'Гимназия №57', grade: '3 «А»', from_district: 'zyab', to_district: 'new_city', schedule: 'Пн–Пт: в школу к 7:45', notes: null, created_at: now() });
  addUser('demo-parent3', '79170000003', { role: 'parent', full_name: 'Елена', districts: ['ges'] });
  children.push({ id: 'c4', parent_id: 'demo-parent3', name: 'Вика', birth_date: '2019-11-08', school: 'Детский сад №98', grade: 'старшая группа', from_district: 'ges', to_district: null, schedule: 'Пн–Пт: забрать из сада в 17:30, отвезти на английский', notes: null, created_at: now() });

  addNanny('demo-nanny', '79270000001', 'Хасанова Альфия Ринатовна', ['new_city', 'ges', 'zyab'], {
    birth_date: '1988-04-15', about: 'Мама двоих детей, педагогическое образование. Вожу аккуратно, всегда на связи и присылаю отчёт: забрала — довезла.', experience_years: 6, price_from: 350, car_model: 'Kia Rio', car_color: 'белый', car_plate: 'А123ВС116', passport_series: '9208', passport_number: '123456', verification_status: 'approved', verified_at: now(),
  });
  addNanny('demo-nanny2', '79270000002', 'Козлова Марина Сергеевна', ['new_city', 'centralny'], {
    birth_date: '1991-07-01', about: 'Работала воспитателем в детском саду 8 лет. Есть бустер и детское кресло 9–18 кг.', experience_years: 8, price_from: 400, car_model: 'Hyundai Solaris', car_color: 'серый', car_plate: 'М456ОР716', passport_series: '9211', passport_number: '654321', verification_status: 'approved', verified_at: now(),
  });
  addNanny('demo-nanny3', '79270000003', 'Сафиуллина Ольга Ивановна', ['ges', 'old_city', 'sidorovka'], {
    birth_date: '1983-12-20', about: 'Вожу детей на кружки и тренировки, подожду до конца занятия.', experience_years: 4, price_from: 300, car_model: 'Lada Vesta', car_color: 'синий', car_plate: 'Е789КХ116', passport_series: '9205', passport_number: '112233', verification_status: 'approved', verified_at: now(),
  });
  addNanny('demo-pending', '79270000004', 'Гарипова Лилия Маратовна', ['zyab', 'komsomolsky'], {
    birth_date: '1994-02-11', about: 'Хочу возить детей в утренние часы.', experience_years: 2, price_from: 300, car_model: 'Skoda Rapid', car_color: 'чёрный', car_plate: 'Т321УК716', passport_series: '9214', passport_number: '445566', verification_status: 'pending',
  });
  addNanny('demo-pending2', '79270000005', 'Николаева Светлана Петровна', ['new_city'], {
    birth_date: '1979-09-30', about: null, experience_years: 10, price_from: 450, car_model: 'Toyota Corolla', car_color: 'белый', car_plate: 'О555ОО116', passport_series: '9201', passport_number: '778899', verification_status: 'pending',
  });
}
seed();

// ---------------- Сессия ----------------
let session: any = null;
const listeners = new Set<Listener>();
const pendingCodes = new Set<string>();

function setSession(userId: string | null) {
  const u = users.find((x) => x.id === userId);
  session = u ? { access_token: 'demo', user: { id: u.id, phone: u.phone } } : null;
  listeners.forEach((l) => l(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}

const me = () => profiles.find((p) => p.id === session?.user.id);
const isAdmin = () => me()?.role === 'admin';
const ok = (data: any) => ({ data, error: null });
const fail = (message: string) => ({ data: null, error: { message } });

/** Мгновенный вход под демо-пользователем (кнопки на стартовом экране). */
export function demoSignIn(role: 'parent' | 'nanny' | 'admin') {
  setSession(role === 'parent' ? 'demo-parent' : role === 'nanny' ? 'demo-nanny' : 'demo-admin');
}

// ---------------- Таблицы ----------------
const tables: Record<string, Row[]> = { profiles, nanny_profiles: nannyProfiles, children };
const keyOf: Record<string, string> = { profiles: 'id', nanny_profiles: 'user_id', children: 'id' };

function canSee(table: string, r: Row): boolean {
  if (!session) return false;
  const uid = session.user.id;
  if (table === 'profiles') return r.id === uid || isAdmin();
  if (table === 'nanny_profiles') return r.user_id === uid || isAdmin();
  if (table === 'children') return r.parent_id === uid;
  return false;
}

class Query implements PromiseLike<{ data: any; error: any }> {
  private op: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private payload: Row | null = null;
  private filters: [string, any][] = [];
  private mode: 'many' | 'single' | 'maybe' = 'many';
  private embed = false;
  private orderKey: string | null = null;

  constructor(private table: string) {}

  select(cols = '*') {
    this.embed = cols.includes('profiles!inner');
    return this;
  }
  insert(row: Row) { this.op = 'insert'; this.payload = row; return this; }
  upsert(row: Row) { this.op = 'upsert'; this.payload = row; return this; }
  update(row: Row) { this.op = 'update'; this.payload = row; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(col: string, val: any) { this.filters.push([col, val]); return this; }
  order(col: string) { this.orderKey = col; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybe'; return this; }

  then<A = any, B = never>(res?: ((v: any) => A | PromiseLike<A>) | null, rej?: ((e: any) => B | PromiseLike<B>) | null) {
    return new Promise((r) => setTimeout(r, 120)).then(() => this.exec()).then(res, rej);
  }

  private match(r: Row) {
    return this.filters.every(([c, v]) => r[c] === v);
  }

  private exec(): { data: any; error: any } {
    const rows = tables[this.table];
    const key = keyOf[this.table];
    if (!session) return fail('Не выполнен вход');

    if (this.op === 'select') {
      let out = rows.filter((r) => canSee(this.table, r) && this.match(r)).map((r) => ({ ...r }));
      if (this.embed) out = out.map((r) => ({ ...r, profiles: profiles.find((p) => p.id === r.user_id) }));
      if (this.orderKey) out.sort((a, b) => String(a[this.orderKey!]).localeCompare(String(b[this.orderKey!])));
      if (this.mode === 'many') return ok(out);
      if (this.mode === 'single' && out.length !== 1) return fail('Запись не найдена');
      return ok(out[0] ?? null);
    }

    if (this.op === 'delete') {
      for (let i = rows.length - 1; i >= 0; i--) if (canSee(this.table, rows[i]) && this.match(rows[i])) rows.splice(i, 1);
      return ok(null);
    }

    if (this.op === 'update') {
      rows.filter((r) => canSee(this.table, r) && this.match(r)).forEach((r) => Object.assign(r, this.payload));
      return ok(null);
    }

    // insert / upsert — повторяем защитные триггеры из schema.sql
    const row: Row = { ...this.payload };
    const uid = session.user.id;
    if (this.table === 'profiles') {
      if (row.id !== uid) return fail('Нет доступа');
      if (row.role === 'admin') return fail('Нельзя назначить себя модератором');
      const existing = profiles.find((p) => p.id === uid);
      if (existing && existing.role !== row.role) return fail('Роль менять нельзя');
      row.phone = '+' + session.user.phone;
    }
    if (this.table === 'nanny_profiles') {
      if (row.user_id !== uid) return fail('Нет доступа');
      if (me()?.role !== 'nanny') return fail('Анкета автоняни доступна только для роли автоняни');
      const dup = nannyProfiles.find((n) => n.passport_series === row.passport_series && n.passport_number === row.passport_number && n.user_id !== uid);
      if (dup) return fail('Анкета с таким паспортом уже зарегистрирована');
      row.verification_status = 'pending';
      row.rejection_reason = null;
    }
    if (this.table === 'children') {
      if (row.parent_id !== uid) return fail('Нет доступа');
      row.id = row.id ?? uuid();
    }
    const existing = rows.find((r) => r[key] === row[key]);
    if (existing && this.op === 'upsert') Object.assign(existing, row);
    else if (existing) return fail('Запись уже существует');
    else rows.push({ created_at: now(), ...row });
    return ok(null);
  }
}

// ---------------- Функции (rpc) ----------------
function rpc(name: string, args: Row = {}) {
  return new Promise((r) => setTimeout(r, 150)).then(() => {
    const m = me();
    if (!m) return fail('Не выполнен вход');

    if (name === 'nannies_in_my_districts') {
      if (!['parent', 'admin'].includes(m.role)) return ok([]);
      return ok(
        nannyProfiles
          .filter((n) => n.verification_status === 'approved')
          .map((n) => ({ n, p: profiles.find((p) => p.id === n.user_id)! }))
          .filter(({ p }) => p.districts.some((d: string) => m.districts.includes(d)))
          .sort((a, b) => b.n.experience_years - a.n.experience_years)
          .map(({ n, p }) => ({
            user_id: p.id, full_name: p.full_name, phone: p.phone, districts: p.districts, about: n.about,
            experience_years: n.experience_years, car_model: n.car_model, car_color: n.car_color,
            has_child_seat: n.has_child_seat, price_from: n.price_from, age: ageFrom(n.birth_date),
          })),
      );
    }

    if (name === 'requests_in_my_districts') {
      const approved = nannyProfiles.some((n) => n.user_id === m.id && n.verification_status === 'approved');
      if (!approved && m.role !== 'admin') return ok([]);
      return ok(
        children
          .filter((c) => m.districts.includes(c.from_district) || m.districts.includes(c.to_district))
          .map((c) => {
            const p = profiles.find((x) => x.id === c.parent_id)!;
            return {
              child_id: c.id, child_name: c.name, child_age: ageFrom(c.birth_date), school: c.school, grade: c.grade,
              from_district: c.from_district, to_district: c.to_district, schedule: c.schedule,
              parent_name: p.full_name, parent_phone: p.phone, parent_districts: p.districts,
            };
          }),
      );
    }

    if (name === 'moderate_nanny') {
      if (!isAdmin()) return fail('Только для модератора');
      const n = nannyProfiles.find((x) => x.user_id === args.nanny_id);
      if (n) {
        n.verification_status = args.approve ? 'approved' : 'rejected';
        n.rejection_reason = args.approve ? null : args.reason;
        n.verified_at = now();
      }
      return ok(null);
    }

    if (name === 'delete_my_account') {
      const uid = m.id;
      [profiles, nannyProfiles].forEach((t) => {
        const i = t.findIndex((r) => (r.id ?? r.user_id) === uid);
        if (i >= 0) t.splice(i, 1);
      });
      for (let i = children.length - 1; i >= 0; i--) if (children[i].parent_id === uid) children.splice(i, 1);
      const ui = users.findIndex((u) => u.id === uid);
      if (ui >= 0) users.splice(ui, 1);
      return ok(null);
    }

    return fail(`Неизвестная функция ${name}`);
  });
}

// ---------------- Хранилище файлов ----------------
function bucket(_name: string) {
  return {
    async upload(path: string, body: ArrayBuffer) {
      files.set(path, URL.createObjectURL(new Blob([body], { type: 'image/jpeg' })));
      return ok({ path });
    },
    async createSignedUrl(path: string) {
      return ok(files.has(path) ? { signedUrl: files.get(path)! } : null);
    },
    async list(prefix: string) {
      return ok([...files.keys()].filter((k) => k.startsWith(prefix + '/')).map((k) => ({ name: k.slice(prefix.length + 1) })));
    },
    async remove(paths: string[]) {
      paths.forEach((p) => files.delete(p));
      return ok(null);
    },
  };
}

// ---------------- Клиент с тем же интерфейсом, что у supabase-js ----------------
export function createDemoClient() {
  return {
    auth: {
      async getSession() {
        return ok({ session });
      },
      onAuthStateChange(cb: Listener) {
        listeners.add(cb);
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
      },
      async signInWithOtp({ phone }: { phone: string }) {
        await new Promise((r) => setTimeout(r, 400));
        pendingCodes.add(phone.replace(/\D/g, ''));
        return ok({});
      },
      async verifyOtp({ phone, token }: { phone: string; token: string }) {
        await new Promise((r) => setTimeout(r, 300));
        const digits = phone.replace(/\D/g, '');
        if (!pendingCodes.has(digits) || token !== DEMO_CODE) return { data: { session: null }, error: { message: `В демо-версии код всегда ${DEMO_CODE}` } };
        let u = users.find((x) => x.phone === digits);
        if (!u) {
          u = { id: uuid(), phone: digits };
          users.push(u);
        }
        setSession(u.id);
        return ok({ session });
      },
      async signOut() {
        setSession(null);
        return { error: null };
      },
    },
    from: (table: string) => new Query(table),
    rpc,
    storage: { from: bucket },
  };
}
