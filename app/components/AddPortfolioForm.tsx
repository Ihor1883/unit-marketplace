'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// === СЛОВАРЬ ПЕРЕВОДОВ ===
const t: Record<string, any> = {
  RU: {
    auth_err: "Вы должны быть авторизованы, чтобы добавлять работы.",
    success_msg: "Работа успешно добавлена в портфолио!",
    error_msg: "Произошла ошибка при добавлении.",
    form_title: "Добавить работу в портфолио",
    title_label: "Название проекта *",
    title_ph: "Например: Интернет-магазин кроссовок",
    desc_label: "Описание работы",
    desc_ph: "Опишите, какие задачи вы решили в рамках этого проекта...",
    img_label: "Ссылка на скриншот/картинку",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "Ссылка на живой проект (опционально)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Сохранение...",
    submit_btn: "Добавить в портфолио"
  },
  EN: {
    auth_err: "You must be logged in to add works.",
    success_msg: "Work successfully added to portfolio!",
    error_msg: "An error occurred while adding.",
    form_title: "Add work to portfolio",
    title_label: "Project Title *",
    title_ph: "E.g., Sneaker online store",
    desc_label: "Work description",
    desc_ph: "Describe the tasks you solved in this project...",
    img_label: "Screenshot/image URL",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "Live project URL (optional)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Saving...",
    submit_btn: "Add to portfolio"
  },
  PL: {
    auth_err: "Musisz być zalogowany, aby dodawać prace.",
    success_msg: "Praca została pomyślnie dodana do portfolio!",
    error_msg: "Wystąpił błąd podczas dodawania.",
    form_title: "Dodaj pracę do portfolio",
    title_label: "Tytuł projektu *",
    title_ph: "Np. Sklep internetowy",
    desc_label: "Opis pracy",
    desc_ph: "Opisz zadania, które zrealizowałeś w tym projekcie...",
    img_label: "Link do zrzutu ekranu/obrazka",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "Link do gotowego projektu (opcjonalnie)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Zapisywanie...",
    submit_btn: "Dodaj do portfolio"
  },
  DE: {
    auth_err: "Sie müssen eingeloggt sein, um Arbeiten hinzuzufügen.",
    success_msg: "Arbeit erfolgreich zum Portfolio hinzugefügt!",
    error_msg: "Beim Hinzufügen ist ein Fehler aufgetreten.",
    form_title: "Arbeit zum Portfolio hinzufügen",
    title_label: "Projekttitel *",
    title_ph: "Z.B. Sneaker-Online-Shop",
    desc_label: "Projektbeschreibung",
    desc_ph: "Beschreiben Sie Ihre Aufgaben in diesem Projekt...",
    img_label: "Screenshot/Bild-URL",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "Live-Projekt-URL (optional)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Speichern...",
    submit_btn: "Zum Portfolio hinzufügen"
  },
  ES: {
    auth_err: "Debes iniciar sesión para añadir trabajos.",
    success_msg: "¡Trabajo añadido exitosamente al portafolio!",
    error_msg: "Ocurrió un error al añadir.",
    form_title: "Añadir trabajo al portafolio",
    title_label: "Título del proyecto *",
    title_ph: "Ej. Tienda de zapatillas online",
    desc_label: "Descripción del trabajo",
    desc_ph: "Describe las tareas que resolviste en este proyecto...",
    img_label: "Enlace a captura de pantalla/imagen",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "Enlace al proyecto en vivo (opcional)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Guardando...",
    submit_btn: "Añadir al portafolio"
  },
  IT: {
    auth_err: "Devi effettuare l'accesso per aggiungere lavori.",
    success_msg: "Lavoro aggiunto con successo al portfolio!",
    error_msg: "Si è verificato un errore durante l'aggiunta.",
    form_title: "Aggiungi lavoro al portfolio",
    title_label: "Titolo del progetto *",
    title_ph: "Es. Negozio online di scarpe",
    desc_label: "Descrizione del lavoro",
    desc_ph: "Descrivi i compiti risolti in questo progetto...",
    img_label: "URL screenshot/immagine",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "URL del progetto live (opzionale)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Salvataggio in corso...",
    submit_btn: "Aggiungi al portfolio"
  },
  FR: {
    auth_err: "Vous devez être connecté pour ajouter des travaux.",
    success_msg: "Travail ajouté au portfolio avec succès !",
    error_msg: "Une erreur est survenue lors de l'ajout.",
    form_title: "Ajouter un travail au portfolio",
    title_label: "Titre du projet *",
    title_ph: "Ex. Boutique de baskets en ligne",
    desc_label: "Description du travail",
    desc_ph: "Décrivez les tâches accomplies dans ce projet...",
    img_label: "URL de la capture d'écran/image",
    img_ph: "https://example.com/my-work.jpg",
    url_label: "URL du projet en ligne (optionnel)",
    url_ph: "https://my-portfolio-site.com",
    saving: "Enregistrement...",
    submit_btn: "Ajouter au portfolio"
  }
};

export default function AddPortfolioForm() {
  const [lang, setLang] = useState('EN');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Функция для удобного перевода
  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  // Отслеживаем язык из localStorage в реальном времени
  useEffect(() => {
    const checkLang = () => {
      const savedLang = localStorage.getItem('unit_lang') || 'EN';
      if (lang !== savedLang) setLang(savedLang);
    };
    checkLang(); // при загрузке
    const interval = setInterval(checkLang, 500); // каждые полсекунды
    return () => clearInterval(interval);
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Получаем текущего авторизованного пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(translate('auth_err'));
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
      setMessage({ type: 'success', text: translate('success_msg') });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setProjectUrl('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || translate('error_msg') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px' }}>{translate('form_title')}</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>{translate('title_label')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={translate('title_ph')}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>{translate('desc_label')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={translate('desc_ph')}
            rows={4}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>{translate('img_label')}</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={translate('img_ph')}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>{translate('url_label')}</label>
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder={translate('url_ph')}
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
          {loading ? translate('saving') : translate('submit_btn')}
        </button>
      </form>
    </div>
  );
}