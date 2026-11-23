// Округа Москвы. Список можно свободно править —
// в базе хранятся только коды (id), названия показываются из этого файла.
export const CITY = 'Москва';

export const DISTRICTS = [
  { id: 'tsao', name: 'ЦАО' },
  { id: 'sao', name: 'САО' },
  { id: 'svao', name: 'СВАО' },
  { id: 'vao', name: 'ВАО' },
  { id: 'yuvao', name: 'ЮВАО' },
  { id: 'yuao', name: 'ЮАО' },
  { id: 'yuzao', name: 'ЮЗАО' },
  { id: 'zao', name: 'ЗАО' },
  { id: 'szao', name: 'СЗАО' },
  { id: 'zelao', name: 'Зеленоград' },
  { id: 'nao', name: 'Новая Москва (НАО)' },
  { id: 'tao', name: 'Троицк (ТАО)' },
] as const;

export type DistrictId = (typeof DISTRICTS)[number]['id'];

export function districtName(id: string): string {
  return DISTRICTS.find((d) => d.id === id)?.name ?? id;
}

export function districtNames(ids: string[] | null | undefined): string {
  return (ids ?? []).map(districtName).join(', ');
}
