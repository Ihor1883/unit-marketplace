import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Заголовки CORS нужны, чтобы браузер разрешал вашему сайту обращаться к этой функции
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 1. Обработка CORS preflight-запросов (когда браузер проверяет, можно ли делать запрос)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Достаем ключ Gemini из секретов (Secrets) Supabase
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("Ключ GEMINI_API_KEY не найден в Secrets!");
    }

    // 3. Получаем сообщение, которое написал пользователь в чате на сайте
    const { message } = await req.json();
    if (!message) {
      throw new Error("Сообщение от пользователя не получено.");
    }

    // 4. Настраиваем "характер" нашего ИИ
    const systemInstruction = `Ты — дружелюбный искусственный интеллект, онлайн-консультант и помощник на платформе UNIT Marketplace. 
    UNIT — это современная биржа цифровых услуг (дизайн, разработка, копирайтинг). 
    Твоя задача — отвечать на вопросы пользователей, помогать им разобраться с сайтом. 
    Отвечай кратко, ёмко, вежливо и профессионально. Не пиши слишком длинные тексты.`;

    // 5. Делаем запрос к серверам Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nПользователь спрашивает: ${message}` }]
            }
          ]
        }),
      }
    );

    // Если Google ответил ошибкой
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка от Google API: ${errorText}`);
    }

    const data = await response.json();
    
    // 6. Аккуратно достаем текст ответа из сложной структуры ответа Google
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извините, я не смог сформулировать ответ.";

    // 7. Отправляем ответ обратно на ваш сайт
    return new Response(
      JSON.stringify({ reply }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    // Выводим ошибку в логи Supabase для удобства отладки
    console.error("Ошибка в Edge Function:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});