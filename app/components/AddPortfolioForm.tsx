'use client';

import { useState } from 'react';
import { supabase } from '../supabase'; // Проверьте правильность пути к вашему файлу supabase.ts

export default function AddPortfolioForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Получаем текущего авторизованного пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Вы должны быть авторизованы, чтобы добавлять работы.');
      }

      // 2. Отправляем данные в нашу новую таблицу portfolio_items
      const { error } = await supabase
        .from('portfolio_items')
        .insert([
          {
            user_id: user.id, // ИЗМЕНЕНО: теперь привязываем через user_id
            title,
            description,
            image_url: imageUrl || null,
            project_url: projectUrl || null,
          },
        ]);

      if (error) throw error;

      // Если всё успешно — очищаем форму и показываем сообщение
      setMessage({ type: 'success', text: 'Работа успешно добавлена в портфолио!' });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setProjectUrl('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Произошла ошибка при добавлении.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px' }}>Добавить работу в портфолио</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Название проекта *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Например: Интернет-магазин кроссовок"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Описание работы</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите, какие задачи вы решили в рамках этого проекта..."
            rows={4}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ссылка на скриншот/картинку</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/my-work.jpg"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ссылка на живой проект (опционально)</label>
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://my-portfolio-site.com"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {message && (
          <div style={{ padding: '10px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#e6f4ea' : '#fce8e6', color: message.type === 'success' ? '#137333' : '#c5221f' }}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Сохранение...' : 'Добавить в портфолио'}
        </button>
      </form>
    </div>
  );
}