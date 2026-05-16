export function getFlavorColor(note: string): { bg: string; text: string; border: string } {
  const n = note.trim();
  if (['복숭아', '자두', '살구', '체리', '넥타린'].some((k) => n.includes(k)))
    return { bg: '#FAF0EB', text: '#6B3020', border: '#C49080' };
  if (['오렌지', '레몬', '라임', '자몽', '귤', '시트러스', '상큼한', '청량한'].some((k) => n.includes(k)))
    return { bg: '#FAF5E4', text: '#5E4010', border: '#B89040' };
  if (['재스민', '장미', '라벤더', '꽃', '플로럴'].some((k) => n.includes(k)))
    return { bg: '#F4EFF8', text: '#4A306A', border: '#A088C0' };
  if (['초콜릿', '코코아', '다크'].some((k) => n.includes(k)))
    return { bg: '#F2EAE4', text: '#422010', border: '#8A5030' };
  if (['너트', '아몬드', '헤이즐넛', '로스팅', '고소'].some((k) => n.includes(k)))
    return { bg: '#F4EEE0', text: '#4A3010', border: '#907040' };
  if (['단맛', '카라멜', '캐러멜', '브라운 슈거', '꿀', '바닐라', '설탕', '달콤'].some((k) => n.includes(k)))
    return { bg: '#F6F0E0', text: '#524010', border: '#987830' };
  if (['홍차', '녹차', '허브', '민트'].some((k) => n.includes(k)))
    return { bg: '#EBF2EE', text: '#204830', border: '#608870' };
  if (['베리', '블루베리', '라즈베리', '딸기', '크랜베리'].some((k) => n.includes(k)))
    return { bg: '#F4EDF0', text: '#601828', border: '#A06070' };
  return { bg: '#F2F2F0', text: '#505050', border: '#B8B8B0' };
}
