"use client";

import React from 'react';
import { useParams } from 'next/navigation';

// Используем обычную именованную функцию для экспорта по умолчанию
export default function ServicePage() {
  const params = useParams();

  // Добавим проверку, что params вообще пришли
  if (!params) return <div>Загрузка параметров...</div>;

  return (
    <div style={{ 
      padding: '100px', 
      textAlign: 'center', 
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '900' }}>
        ID УСЛУГИ: {params.id}
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Если ты видишь этот текст, ошибка Default Export исправлена!
      </p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '20px',
          padding: '15px 30px',
          background: 'black',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ВЕРНУТЬСЯ НА ГЛАВНУЮ
      </button>
    </div>
  );
}