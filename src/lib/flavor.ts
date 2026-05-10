export function getFlavorColor(note: string): { bg: string; text: string; border: string } {
  const n = note.trim();
  if (['복숭아', '자두', '살구', '체리', '넥타린'].some((k) => n.includes(k)))
    return { bg: '#FFF0E8', text: '#B84020', border: '#F08060' };
  if (['오렌지', '레몬', '라임', '자몽', '귤', '시트러스', '상큼한', '청량한'].some((k) => n.includes(k)))
    return { bg: '#FFF8E0', text: '#986000', border: '#E8B020' };
  if (['재스민', '장미', '라벤더', '꽃', '플로럴'].some((k) => n.includes(k)))
    return { bg: '#F8F0FF', text: '#6838A8', border: '#C090E0' };
  if (['초콜릿', '코코아', '다크'].some((k) => n.includes(k)))
    return { bg: '#F8EDE8', text: '#5A2810', border: '#9A5030' };
  if (['너트', '아몬드', '헤이즐넛', '로스팅', '고소'].some((k) => n.includes(k)))
    return { bg: '#FFF4E8', text: '#6A4018', border: '#B07840' };
  if (['단맛', '카라멜', '캐러멜', '브라운 슈거', '꿀', '바닐라', '설탕', '달콤'].some((k) => n.includes(k)))
    return { bg: '#FFFAE8', text: '#785018', border: '#C89038' };
  if (['홍차', '녹차', '허브', '민트'].some((k) => n.includes(k)))
    return { bg: '#F0F8F2', text: '#285A38', border: '#60A870' };
  if (['베리', '블루베리', '라즈베리', '딸기', '크랜베리'].some((k) => n.includes(k)))
    return { bg: '#FFF0F4', text: '#8A1830', border: '#C04060' };
  return { bg: '#F5F5F5', text: '#606060', border: '#D0D0D0' };
}
