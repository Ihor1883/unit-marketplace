import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // ТВОИ ДАННЫЕ
    const token = "8646712447:AAGRnR9YMfCja6Mpc-fPsYA35x8tDvg7weo";
    const chatId = "5917376327";

    let messageText = "";

    // ЛОГИКА ФОРМИРОВАНИЯ ТЕКСТА
    if (data.type === 'CHAT_MESSAGE') {
      // Если это сообщение из чата
      messageText = `💬 <b>Новое сообщение в чате!</b>\n\n` +
                    `📦 Заказ: <code>${data.orderId.slice(0, 8)}...</code>\n` +
                    `👤 От: <code>${data.sender}</code>\n\n` +
                    `📝 Текст: <i>${data.text}</i>`;
    } else {
      // Если это обычное уведомление о заказе (старая логика)
      messageText = data.text || "Получено новое уведомление";
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML", 
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (e) {
    console.error('Ошибка в API/SEND:', e);
    return NextResponse.json({ ok: false, error: 'Ошибка сервера' }, { status: 500 });
  }
}