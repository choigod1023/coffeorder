import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const { subscription, customerName, orderId } = await req.json();
  if (!subscription) return NextResponse.json({ ok: false, reason: 'no subscription' });

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: '☕ 음료 준비 완료!',
        body: `${customerName}님, 카운터에서 수령해주세요!`,
        url: `/track/${orderId}`,
      }),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('push error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
