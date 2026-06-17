"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Chat from '../components/Chat';
import Link from 'next/link';
import AddPortfolioForm from '../components/AddPortfolioForm';

// === СЛОВАРИ И ПОДСКАЗКИ ===
const SUGGESTED_TITLES: Record<string, string[]> = {
  RU: ["Разработка сайта под ключ", "Создание лендинга на Tilda", "Дизайн логотипа и фирменного стиля", "Настройка таргетированной рекламы", "SEO оптимизация и аудит сайта", "Копирайтинг и написание текстов", "Создание Telegram-бота под ключ", "Монтаж видео для Reels / TikTok", "Перевод текста (английский / польский)", "Оформление карточек для маркетплейсов", "Создание 3D-модели / Анимация", "Профессиональная фотосессия / Ретушь", "Онлайн-урок / Консультация"],
  EN: ["Full-cycle Website Development", "Landing Page Creation via Tilda", "Logo and Corporate Identity Design", "Targeted Ad Setup (Meta/Google)", "SEO Optimization and Website Audit", "Professional Copywriting", "Custom Telegram Bot Development", "Video Editing for Reels / TikTok", "Text Translation (Various Languages)", "E-commerce Product Card Design", "3D Modeling and Animation", "Professional Photography / Retouching", "Online Lesson / Consulting"],
  PL: ["Tworzenie stron internetowych pod klucz", "Projektowanie Landing Page (Tilda)", "Projektowanie logo i identyfikacji", "Konfiguracja reklam (Meta/Google)", "Optymalizacja SEO i audyt", "Copywriting i pisanie tekstów", "Tworzenie bota na Telegramie", "Montaż wideo dla Reels / TikTok", "Tłumaczenie tekstów (Różne języki)", "Projektowanie kart produktów", "Modelowanie 3D i animacja", "Profesjonalna sesja zdjęciowa / Retusz", "Lekcja online / Konsultacja"],
  DE: ["Komplette Website-Entwicklung", "Landingpage-Erstellung (Tilda)", "Logo- und Corporate-Identity-Design", "Zielgerichtete Werbekampagnen", "SEO-Optimierung und Website-Audit", "Professionelles Copywriting", "Entwicklung von Telegram-Bots", "Videobearbeitung für Reels / TikTok", "Textübersetzung", "E-Commerce-Produktdesign", "3D-Modellierung und Animation", "Professionelle Fotografie / Retusche", "Online-Unterricht / Beratung"],
  ES: ["Desarrollo de sitios web completo", "Creación de Landing Page", "Diseño de logotipos e identidad", "Configuración de anuncios (Meta/Google)", "Optimización SEO y auditoría", "Redacción profesional", "Creación de bots de Telegram", "Edición de video para Reels / TikTok", "Traducción de textos", "Diseño de productos E-commerce", "Modelado 3D y animación", "Fotografía profesional / Retoque", "Clase online / Consultoría"],
  IT: ["Sviluppo di siti web completo", "Creazione Landing Page (Tilda)", "Design di loghi e identità", "Configurazione annunci (Meta/Google)", "Ottimizzazione SEO e audit", "Copywriting professionale", "Creazione bot di Telegram", "Montaggio video per Reels / TikTok", "Traduzione di testi", "Design per E-commerce", "Modellazione 3D e animazione", "Fotografia professionale / Ritocco", "Lezione online / Consulenza"],
  FR: ["Développement de sites web complet", "Création de Landing Page", "Design de logos et identité", "Configuration d'annonces (Meta/Google)", "Optimisation SEO et audit", "Rédaction professionnelle", "Création de bots Telegram", "Montage vidéo pour Reels / TikTok", "Traduction de textes", "Design de produits E-commerce", "Modélisation 3D et animation", "Photographie professionnelle / Retouche", "Cours en ligne / Conseil"]
};

const SUGGESTED_DESCRIPTIONS: Record<string, string[]> = {
  RU: [
    "Создам современный и удобный дизайн. Учту все ваши пожелания и правки. Исходники предоставляю в Figma.",
    "Разработаю сайт под ключ: от дизайна до верстки. Адаптивно под мобильные устройства. Гарантирую быструю загрузку.",
    "Напишу продающий SEO-текст. 100% уникальность, без воды. Готов глубоко погрузиться в вашу нишу.",
    "Настрою контекстную/таргетированную рекламу. Соберу семантику, отминусую лишнее, повышу CTR и приведу лидов.",
    "Сделаю качественный монтаж вашего видео. В стоимость входит: нарезка, цветокоррекция, переходы и подбор музыки.",
    "Предоставляю профессиональную консультацию. Разберем вашу ситуацию по шагам и составим план действий.",
    "Разработаю сложную 3D модель и сделаю фотореалистичный рендер. Все текстуры и освещение включены."
  ],
  EN: [
    "I will create a modern and user-friendly design. Unlimited revisions. Source files provided in Figma.",
    "Full-cycle website development: from UI to code. Fully responsive and optimized for fast loading.",
    "I will write an engaging, SEO-optimized copy. 100% unique, well-researched, and tailored to your niche.",
    "Professional ad campaign setup and management. I will target the right audience to increase your ROI.",
    "High-quality video editing. Includes cutting, color grading, modern transitions, and sound mixing.",
    "I offer professional consulting. We will analyze your situation step-by-step and create an action plan.",
    "I will create a highly detailed 3D model with photorealistic rendering. Textures and lighting included."
  ],
  PL: [
    "Stworzę nowoczesny i intuicyjny design. Uwzględnię wszystkie Twoje poprawki. Pliki źródłowe w Figma.",
    "Tworzenie stron pod klucz: od projektu po kod. Responsywne na urządzeniach mobilnych i szybkie w ładowaniu.",
    "Napiszę tekst zoptymalizowany pod SEO. 100% unikalności. Dogłębnie zbadam Twoją branżę.",
    "Skonfiguruję reklamy (Meta/Google). Zdobędę odpowiednich odbiorców i zwiększę konwersję (ROI).",
    "Profesjonalny montaż wideo. W cenie: cięcia, korekcja barwna, nowoczesne przejścia i dopasowanie muzyki.",
    "Oferuję profesjonalne konsultacje. Przeanalizujemy Twoją sytuację krok po kroku i stworzymy plan działania.",
    "Stworzę szczegółowy model 3D wraz z fotorealistycznem renderem. Oświetlenie i tekstury w cenie."
  ],
  DE: [
    "Ich erstelle ein modernes und benutzerfreundliches Design. Quelldateien in Figma. Alle Anpassungen inklusive.",
    "Vollständige Website-Entwicklung: von UI bis Code. Vollständig responsiv und für schnelle Ladezeiten optimiert.",
    "Ich schreibe ansprechende, SEO-optimierte Texte. 100 % einzigartig und auf Ihre Nische zugeschnitten.",
    "Professionelle Einrichtung von Werbekampagnen. Zielgruppenansprache zur Steigerung Ihres ROI.",
    "Hochwertige Videobearbeitung. Inklusive Schnitt, Farbkorrektur, moderne Übergänge und Audiomixing.",
    "Ich biete professionelle Beratung. Wir analysieren Ihre Situation Schritt für Schritt und erstellen einen Aktionsplan.",
    "Ich erstelle ein detailliertes 3D-Modell mit fotorealistischem Rendering. Texturen und Beleuchtung inklusive."
  ],
  ES: [
    "Crearé un diseño moderno y fácil de usar. Incluye revisiones ilimitadas y archivos fuente en Figma.",
    "Desarrollo de sitios web completo. Totalmente responsivo y optimizado para una carga rápida.",
    "Escribiré un texto atractivo y optimizado para SEO. 100% único y adaptado a tu nicho.",
    "Configuración profesional de campañas publicitarias. Apuntaré a la audiencia correcta para aumentar el ROI.",
    "Edición de video de alta calidad. Incluye cortes, corección de color, transiciones y mezcla de audio.",
    "Ofrezco consultoría profesional. Analizaremos tu situación paso a paso y crearemos un plan de acción.",
    "Crearé un modelo 3D detallado con renderizado fotorrealista. Texturas e iluminación incluidas."
  ],
  IT: [
    "Creerò un design moderno e intuitivo. Include revisioni e file sorgente in Figma.",
    "Sviluppo di siti web a ciclo completo. Completamente reattivo e ottimizzato per un caricamento veloce.",
    "Scriverò testi accattivanti e ottimizzati per la SEO. 100% unici e su misura per la tua nicchia.",
    "Configurazione professionale di campagne pubblicitarie. Targeting del pubblico giusto per aumentare il ROI.",
    "Montaggio video di alta qualità. Include tagli, correzione colore, transizioni e mix audio.",
    "Offro consulenza professionale. Analizzeremo la tua situazione passo dopo passo e creeremo un piano.",
    "Creerò un modello 3D dettagliato con rendering fotorealistico. Texture e illuminazione incluse."
  ],
  FR: [
    "Je vais créer un design moderne et intuitif. Fichiers sources dans Figma inclus.",
    "Développement de site web complet : du design au code. Entièrement réactif et optimisé pour la vitesse.",
    "J'écrirai des textes attrayants et optimisés pour le SEO. 100% uniques et adaptés à votre niche.",
    "Configuration professionnelle de campagnes publicitaires. Ciblage précis pour augmenter votre ROI.",
    "Montage vidéo de haute qualité. Comprend : coupes, étalonnage des couleurs, transitions et mixage audio.",
    "Je propose des consultations professionnelles. Nous analyserons votre situation et créerons un plan d'action.",
    "Je vais créer un modèle 3D détaillé avec rendu photoréaliste. Textures et éclairage inclus."
  ]
};

const CATEGORY_HINTS: Record<string, { price: string, titlePh: string, descPh: string }> = {
  DESIGN: { price: "200 - 1500", titlePh: "Например: Создать современный логотип для кофейни", descPh: "Опишите стиль, цвета, приложите референсы (ссылки на примеры) и укажите сроки..." },
  DEV: { price: "500 - 5000+", titlePh: "Например: Разработать лендинг на React/Next.js", descPh: "Укажите функционал, нужен ли бэкенд, есть ли готовый дизайн в Figma, адаптивность..." },
  TEXT: { price: "50 - 500", titlePh: "Например: Написать 5 SEO-статей для блога", descPh: "Укажите тему, нужный объем (в тысячах знаков), ключевые слова и tone of voice..." },
  SEO: { price: "300 - 2000", titlePh: "Например: Настроить таргет в Meta Ads", descPh: "Опишите вашу нишу, целевую аудиторию, текущие показатели и выделенный рекламный бюджет..." },
  SOCIAL: { price: "200 - 1500", titlePh: "Например: Ведение Telegram-канала (месяц)", descPh: "Укажите тематику канала, количество постов в неделю, нужны ли авторские картинки..." },
  AUDIO: { price: "100 - 1000", titlePh: "Например: Смонтировать Reels для TikTok", descPh: "Укажите хронометраж, исходники, нужны ли динамичные субтитры, переходы и цветокоррекция..." },
  PHOTO: { price: "200 - 1000", titlePh: "Например: Предметная съемка для маркетплейса", descPh: "Укажите количество товаров, нужны ли инфографика, студия и ретушь фотографий..." },
  ANIMATION: { price: "300 - 3000", titlePh: "Например: Сделать 3D-анимацию логотипа", descPh: "Опишите сценарий анимации, длительность, нужный формат (MP4/GIF) и стилистику..." },
  EDUCATION: { price: "50 - 300", titlePh: "Например: Провести часовую консультацию по налогам", descPh: "Опишите вашу текущую ситуацию и конкретные вопросы, которые нужно разобрать на звонке..." },
  BUSINESS: { price: "100 - 1000", titlePh: "Например: Составить бизнес-план для кофейни", descPh: "Укажите масштаб бизнеса, какие именно финансовые расчеты требуются, в каком формате нужен итог..." },
};

const AVAILABLE_LANGS = [
  { code: 'RU', name: 'Русский' },
  { code: 'EN', name: 'English' },
  { code: 'PL', name: 'Polski' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'ES', name: 'Español' },
  { code: 'IT', name: 'Italiano' },
  { code: 'FR', name: 'Français' },
  { code: 'UA', name: 'Українська' }
];

export default function ProfilePage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'settings' | 'tasks' | 'portfolio'>('services');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [myServices, setMyServices] = useState<any[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);

  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [taskResponses, setTaskResponses] = useState<any[]>([]);
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', budget: 0, category: 'DESIGN', language: 'RU' });

  // === СТЕЙТ ДЛЯ ОТЗЫВОВ ===
  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: '', targetEmail: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [contacts, setContacts] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState<{code: string, level: number}[]>([]); // НОВЫЙ СТЕЙТ ДЛЯ ЯЗЫКОВ
  const [showOnline, setShowOnline] = useState(true);
  const [role, setRole] = useState<'client' | 'freelancer' | 'both'>('both');
  const [savingProfile, setSavingProfile] = useState(false);

  const [referralCode, setReferralCode] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [inputInviteCode, setInputInviteCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const [lang, setLang] = useState('EN');
  const [currency, setCurrency] = useState('PLN');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    title: '', price: 0, description: '', category: 'DESIGN', image_url: '', language: 'RU' 
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [filteredDescSuggestions, setFilteredDescSuggestions] = useState<string[]>([]);
  const descSuggestionsRef = useRef<HTMLDivElement>(null);

  const t: Record<string, any> = {
    RU: { auth_req: "Пожалуйста, войдите в аккаунт на главной странице.", loading: "Загрузка профиля...", cabinet: "/ Кабинет", to_main: "На главную", services_count: "Услуг:", orders_process: "В работе:", orders_done: "Завершено:", add_service: "Создать услугу", tab_services: "Мои услуги", tab_orders: "Входящие заказы", tab_settings: "Настройки профиля", tab_portfolio: "Портфолио", no_services: "У вас пока нет активных услуг.", create_first: "Создать первую услугу", edit: "Изменить", delete: "Удалить", delete_confirm: "Удалить услугу навсегда?", delete_task_confirm: "Удалить задание навсегда?", no_orders: "Пока нет входящих заказов.", th_service: "Услуга / Дата", th_client: "Заказчик", th_price: "Цена", th_status: "Статус", th_action: "Действие", btn_to_work: "В работу", btn_deliver: "Сдать заказ", btn_completed: "Завершено", modal_edit: "Редактировать услугу", modal_new: "Новая услуга", label_title: "Название услуги *", ph_title: "Сделаю крутой дизайн логотипа...", label_cat: "Рубрика *", label_price: "Цена *", ph_price: "500", label_desc: "Описание услуги *", ph_desc: "Подробно опишите, что входит в вашу услугу, сроки и условия...", label_url: "Обложка (URL картинки)", ph_url: "https://example.com/image.jpg", or: "— или —", label_upload: "Загрузить фото с устройства", file_selected: "✓ Выбран файл:", click_to_upload: "📁 Нажмите, чтобы выбрать файл", saving: "Сохранение...", save_changes: "Сохранить изменения", publish: "Опубликовать", fill_required: "Заполните все обязательные поля!", save_error: "Ошибка: ", btn_chat: "Чат", label_name: "Имя / Никнейм", label_bio: "О себе", label_skills: "Дополнительные услуги / Навыки (теги через запятую)", label_contacts: "Контакты (Telegram / WhatsApp)", save_profile: "Сохранить профиль", profile_saved: "Ваш профиль успешно обновлен!", show_online_label: "Показывать статус «Online» другим пользователям",
          cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь", cat_photo: "Фотография", cat_anim: "Анимация и 3D", cat_edu: "Обучение и консалтинг",
          ref_title: "Реферальная программа", ref_desc: "Приглашайте друзей и получайте бонусы!", ref_my_code: "Ваш код", ref_copy: "Скопировать", ref_copied: "Скопировано!", ref_activation: "Активация приглашения", ref_enter: "Введите код друга", ref_apply: "Применить", ref_applied: "Код активирован:", ref_err_self: "Нельзя ввести свой код", ref_err_notfound: "Код не найден", ref_success: "Успешно применен!", role_title: "Ваша роль на платформе", role_client: "💼 Только Заказчик", role_freelancer: "💻 Только Исполнитель", role_both: "🔄 Заказчик и Исполнитель",
          tab_tasks: "Мои задания", btn_new_task: "Создать задание", no_tasks: "У вас нет активных заданий" },
    EN: { auth_req: "Please log in on the main page.", loading: "Loading profile...", cabinet: "/ Dashboard", to_main: "To Home", services_count: "Services:", orders_process: "In process:", orders_done: "Completed:", add_service: "Create Service", tab_services: "My Services", tab_orders: "Incoming Orders", tab_settings: "Profile Settings", tab_portfolio: "Portfolio", no_services: "You have no active services yet.", create_first: "Create first service", edit: "Edit", delete: "Delete", delete_confirm: "Delete this service permanently?", delete_task_confirm: "Delete this task permanently?", no_orders: "No incoming orders yet.", th_service: "Service / Date", th_client: "Client", th_price: "Price", th_status: "Status", th_action: "Action", btn_to_work: "Start work", btn_deliver: "Deliver order", btn_completed: "Completed", modal_edit: "Edit Service", modal_new: "New Service", label_title: "Service Title *", ph_title: "I will design an awesome logo...", label_cat: "Category *", label_price: "Price *", ph_price: "500", label_desc: "Service Description *", ph_desc: "Describe in detail what is included...", label_url: "Cover (Image URL)", ph_url: "https://example.com/image.jpg", or: "— or —", label_upload: "Upload photo from device", file_selected: "✓ File selected:", click_to_upload: "📁 Click to select a file", saving: "Saving...", save_changes: "Save changes", publish: "Publish service", fill_required: "Fill in all required fields!", save_error: "Error: ", btn_chat: "Chat", label_name: "Name / Nickname", label_bio: "About me", label_skills: "Additional services / Skills (tags)", label_contacts: "Contacts (Telegram / WhatsApp)", save_profile: "Save Profile", profile_saved: "Profile successfully updated!", show_online_label: "Show 'Online' status to other users",
          cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life", cat_photo: "Photography", cat_anim: "Animation & 3D", cat_edu: "Lessons & Consulting",
          ref_title: "Referral Program", ref_desc: "Invite friends and get bonuses!", ref_my_code: "Your code", ref_copy: "Copy", ref_copied: "Copied!", ref_activation: "Invitation activation", ref_enter: "Enter friend's code", ref_apply: "Apply", ref_applied: "Code applied:", ref_err_self: "Cannot use own code", ref_err_notfound: "Code not found", ref_success: "Successfully applied!", role_title: "Your platform role", role_client: "💼 Client Only", role_freelancer: "💻 Freelancer Only", role_both: "🔄 Client & Freelancer",
          tab_tasks: "My Tasks", btn_new_task: "Create Task", no_tasks: "You have no active tasks" },
    PL: { auth_req: "Proszę zalogować się na stronie głównej.", loading: "Ładowanie profilu...", cabinet: "/ Panel", to_main: "Na główną", services_count: "Usługi:", orders_process: "W realizacji:", orders_done: "Zakończone:", add_service: "Utwórz Usługę", tab_services: "Moje Usługi", tab_orders: "Otrzymane Zamówienia", tab_settings: "Ustawienia profilu", tab_portfolio: "Portfolio", no_services: "Nie masz jeszcze aktywnych usług.", create_first: "Utwórz pierwszą usługę", edit: "Edytuj", delete: "Usuń", delete_confirm: "Trwale usunąć tę usługę?", delete_task_confirm: "Trwale usunąć to zadanie?", no_orders: "Brak otrzymanych zamówień.", th_service: "Usługa / Data", th_client: "Klient", th_price: "Cena", th_status: "Status", th_action: "Akcja", btn_to_work: "Do realizacji", btn_deliver: "Dostarcz", btn_completed: "Zakończono", modal_edit: "Edytuj Usługę", modal_new: "Nowa Usługa", label_title: "Tytuł usługi *", ph_title: "Zaprojektuję świetne logo...", label_cat: "Kategoria *", label_price: "Cena *", ph_price: "500", label_desc: "Opis usługi *", ph_desc: "Opisz szczegółowo, co zawiera usługa...", label_url: "Okładka (URL obrazka)", ph_url: "https://example.com/image.jpg", or: "— lub —", label_upload: "Prześlij zdjęcie z urządzenia", file_selected: "✓ Wybrano plik:", click_to_upload: "📁 Kliknij, aby wybrać plik", saving: "Zapisywanie...", save_changes: "Zapisz zmiany", publish: "Opublikuj", fill_required: "Wypełnij wszystkie wymagane pola!", save_error: "Błąd: ", btn_chat: "Czat", label_name: "Imię / Nick", label_bio: "O mnie", label_skills: "Dodatkowe usługi / Umiejętności (tagi)", label_contacts: "Kontakty", save_profile: "Zapisz profil", profile_saved: "Profil pomyślnie zaktualizowany!", show_online_label: "Pokaż mój status «Online»",
          cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media Społecznościowe", cat_audio: "Audio i Wideo", cat_bus: "Biznes i Życie", cat_photo: "Fotografia", cat_anim: "Animacja i 3D", cat_edu: "Szkolenia i Konsultacje",
          ref_title: "Program Poleceń", ref_desc: "Zaproś znajomych i zdobądź bonusy!", ref_my_code: "Twój kod", ref_copy: "Kopiuj", ref_copied: "Skopiowano!", ref_activation: "Aktywacja zaproszenia", ref_enter: "Wpisz kod znajomego", ref_apply: "Zastosuj", ref_applied: "Kod aktywowany:", ref_err_self: "Nie można użyć własnego kodu", ref_err_notfound: "Nie znaleziono kodu", ref_success: "Pomyślnie zastosowano!", role_title: "Twoja rola", role_client: "💼 Tylko Klient", role_freelancer: "💻 Tylko Wykonawca", role_both: "🔄 Klient i Wykonawca",
          tab_tasks: "Moje Zadania", btn_new_task: "Utwórz zadanie", no_tasks: "Brak aktywnych zadań" },
    DE: { auth_req: "Bitte auf der Hauptseite einloggen.", loading: "Lade Profil...", cabinet: "/ Dashboard", to_main: "Zur Startseite", services_count: "Dienste:", orders_process: "In Bearbeitung:", orders_done: "Abgeschlossen:", add_service: "Dienst erstellen", tab_services: "Meine Dienste", tab_orders: "Eingehende Aufträge", tab_settings: "Profileinstellungen", tab_portfolio: "Portfolio", no_services: "Sie haben noch keine aktiven Dienste.", create_first: "Ersten Dienst erstellen", edit: "Bearbeiten", delete: "Löschen", delete_confirm: "Diesen Dienst dauerhaft löschen?", delete_task_confirm: "Diese Aufgabe dauerhaft löschen?", no_orders: "Noch keine Aufträge.", th_service: "Dienst / Datum", th_client: "Kunde", th_price: "Preis", th_status: "Status", th_action: "Aktion", btn_to_work: "Starten", btn_deliver: "Liefern", btn_completed: "Abgeschlossen", modal_edit: "Dienst bearbeiten", modal_new: "Neuer Dienst", label_title: "Titel *", ph_title: "Ich erstelle ein Logo...", label_cat: "Kategorie *", label_price: "Preis *", ph_price: "500", label_desc: "Beschreibung *", ph_desc: "Beschreiben Sie, was enthalten ist...", label_url: "Cover (Bild-URL)", ph_url: "https://example.com/image.jpg", or: "— oder —", label_upload: "Bild hochladen", file_selected: "✓ Ausgewählt:", click_to_upload: "📁 Klicken zum Hochladen", saving: "Speichern...", save_changes: "Änderungen speichern", publish: "Veröffentlichen", fill_required: "Pflichtfelder ausfüllen!", save_error: "Fehler: ", btn_chat: "Chat", label_name: "Name / Nickname", label_bio: "Über mich", label_skills: "Zusätzliche Dienste / Fähigkeiten (Tags)", label_contacts: "Contacts (Telegram/WhatsApp)", save_profile: "Profil speichern", profile_saved: "Profil aktualisiert!", show_online_label: "Status 'Online' anzeigen",
          cat_design: "Design", cat_dev: "Entwicklung & IT", cat_text: "Texte & Übersetzungen", cat_seo: "SEO & Traffic", cat_social: "Soziale Medien", cat_audio: "Audio & Video", cat_bus: "Business & Leben", cat_photo: "Fotografie", cat_anim: "Animation & 3D", cat_edu: "Schulung & Beratung",
          ref_title: "Empfehlungsprogramm", ref_desc: "Lade Freunde ein und erhalte Boni!", ref_my_code: "Dein Code", ref_copy: "Kopieren", ref_copied: "Kopiert!", ref_activation: "Einladung aktivieren", ref_enter: "Code eingeben", ref_apply: "Anwenden", ref_applied: "Code angewendet:", ref_err_self: "Eigener Code nicht möglich", ref_err_notfound: "Code nicht gefunden", ref_success: "Erfolgreich!", role_title: "Deine Rolle", role_client: "💼 Nur Kunde", role_freelancer: "💻 Nur Freelancer", role_both: "🔄 Beide",
          tab_tasks: "Meine Aufgaben", btn_new_task: "Aufgabe erstellen", no_tasks: "Keine aktiven Aufgaben" },
    ES: { auth_req: "Por favor inicie sesión en la página principal.", loading: "Cargando...", cabinet: "/ Panel", to_main: "Al Inicio", services_count: "Servicios:", orders_process: "En proceso:", orders_done: "Completado:", add_service: "Crear Servicio", tab_services: "Mis Servicios", tab_orders: "Pedidos entrantes", tab_settings: "Configuración", tab_portfolio: "Portafolio", no_services: "Aún no tienes servicios activos.", create_first: "Crear servicio", edit: "Editar", delete: "Eliminar", delete_confirm: "¿Eliminar permanentemente?", delete_task_confirm: "¿Eliminar tarea permanentemente?", no_orders: "Sin pedidos aún.", th_service: "Servicio / Fecha", th_client: "Cliente", th_price: "Precio", th_status: "Estado", th_action: "Acción", btn_to_work: "Iniciar", btn_deliver: "Entregar", btn_completed: "Completado", modal_edit: "Editar Servicio", modal_new: "Nuevo Servicio", label_title: "Título *", ph_title: "Diseñaré un logo increíble...", label_cat: "Categoría *", label_price: "Precio *", ph_price: "500", label_desc: "Descripción *", ph_desc: "Describe en detalle...", label_url: "Portada (URL)", ph_url: "https://example.com/image.jpg", or: "— o —", label_upload: "Subir imagen", file_selected: "✓ Seleccionado:", click_to_upload: "📁 Clic para subir", saving: "Guardando...", save_changes: "Guardar", publish: "Publicar", fill_required: "¡Completa lo obligatorio!", save_error: "Error: ", btn_chat: "Chat", label_name: "Nombre / Apodo", label_bio: "Sobre mí", label_skills: "Servicios adicionales / Habilidades (etiquetas)", label_contacts: "Contactos (Telegram/WA)", save_profile: "Guardar Perfil", profile_saved: "¡Perfil actualizado!", show_online_label: "Mostrar estado 'Online' a otros",
          cat_design: "Diseño", cat_dev: "Desarrollo y TI", cat_text: "Textos y Traducción", cat_seo: "SEO y Tráfico", cat_social: "Redes Sociales", cat_audio: "Audio y Video", cat_bus: "Negocios y Vida", cat_photo: "Fotografía", cat_anim: "Animación y 3D", cat_edu: "Clases y Consultoría",
          ref_title: "Programa de referidos", ref_desc: "¡Invita a amigos y consigue bonos!", ref_my_code: "Tu código", ref_copy: "Copiar", ref_copied: "¡Copiado!", ref_activation: "Activar invitación", ref_enter: "Ingresa el código", ref_apply: "Aplicar", ref_applied: "Código aplicado:", ref_err_self: "No puedes usar tu código", ref_err_notfound: "Código no encontrado", ref_success: "¡Aplicado con éxito!", role_title: "Tu rol", role_client: "💼 Solo Cliente", role_freelancer: "💻 Solo Freelancer", role_both: "🔄 Ambos",
          tab_tasks: "Mis Tareas", btn_new_task: "Crear tarea", no_tasks: "No tienes tareas" },
    IT: { auth_req: "Accedi nella pagina principale.", loading: "Caricamento...", cabinet: "/ Pannello", to_main: "Alla Home", services_count: "Servizi:", orders_process: "In corso:", orders_done: "Completato:", add_service: "Crea Servizio", tab_services: "I miei Servizi", tab_orders: "Ordini in arrivo", tab_settings: "Impostazioni", tab_portfolio: "Portfolio", no_services: "Non hai ancora servizi.", create_first: "Crea servizio", edit: "Modifica", delete: "Elimina", delete_confirm: "Eliminare per sempre?", delete_task_confirm: "Eliminare compito per sempre?", no_orders: "Nessun ordine.", th_service: "Servizio / Datum", th_client: "Cliente", th_price: "Prezzo", th_status: "Stato", th_action: "Azione", btn_to_work: "Inizia", btn_deliver: "Consegna", btn_completed: "Completato", modal_edit: "Modifica Servizio", modal_new: "Nuovo Servizio", label_title: "Titolo *", ph_title: "Creerò un logo fantastico...", label_cat: "Categoria *", label_price: "Prezzo *", ph_price: "500", label_desc: "Descrizione *", ph_desc: "Descrivi in dettaglio...", label_url: "Copertina (URL)", ph_url: "https://example.com/image.jpg", or: "— o —", label_upload: "Carica foto", file_selected: "✓ Selezionato:", click_to_upload: "📁 Clicca per caricare", saving: "Salvataggio...", save_changes: "Salva", publish: "Pubblica", fill_required: "Campi obbligatori!", save_error: "Errore: ", btn_chat: "Chat", label_name: "Nome / Nickname", label_bio: "Su di me", label_skills: "Servizi aggiuntivi / Competenze (tag)", label_contacts: "Contatti (Telegram/WA)", save_profile: "Salva Profilo", profile_saved: "Profilo aggiornato!", show_online_label: "Mostra il mio stato 'Online'",
          cat_design: "Design", cat_dev: "Sviluppo e IT", cat_text: "Testi e Traduzioni", cat_seo: "SEO e Traffico", cat_social: "Social Media", cat_audio: "Audio i Video", cat_bus: "Affari e Vita", cat_photo: "Fotografia", cat_anim: "Animazione e 3D", cat_edu: "Formazione e Consulenza",
          ref_title: "Programma di riferimento", ref_desc: "Invita amici e ottieni bonus!", ref_my_code: "Il tuo codice", ref_copy: "Copia", ref_copied: "Copiato!", ref_activation: "Attiva invito", ref_enter: "Inserisci codice", ref_apply: "Applica", ref_applied: "Codice applicato:", ref_err_self: "Non puoi usare il tuo codice", ref_err_notfound: "Codice non trovato", ref_success: "Applicato con successo!", role_title: "Il tuo ruolo", role_client: "💼 Solo Cliente", role_freelancer: "💻 Solo Freelancer", role_both: "🔄 Entrambi",
          tab_tasks: "I Miei Compiti", btn_new_task: "Crea Compito", no_tasks: "Non ci sono compiti" },
    FR: { auth_req: "Veuillez vous connecter.", loading: "Chargement...", cabinet: "/ Tableau de bord", to_main: "Accueil", services_count: "Services:", orders_process: "En cours:", orders_done: "Terminé:", add_service: "Créer un service", tab_services: "Mes Services", tab_orders: "Commandes", tab_settings: "Paramètres", tab_portfolio: "Portfolio", no_services: "Aucun service.", create_first: "Créer un service", edit: "Modifier", delete: "Supprimer", delete_confirm: "Supprimer définitivement ?", delete_task_confirm: "Supprimer la tâche définitivement ?", no_orders: "Aucune commande.", th_service: "Service / Date", th_client: "Client", th_price: "Prix", th_status: "Statut", th_action: "Action", btn_to_work: "Démarrer", btn_deliver: "Livrer", btn_completed: "Terminé", modal_edit: "Modifier Service", modal_new: "Nouveau Service", label_title: "Titre *", ph_title: "Je vais créer un logo...", label_cat: "Catégorie *", label_price: "Prix *", ph_price: "500", label_desc: "Description *", ph_desc: "Décrivez en détail...", label_url: "Couverture (URL)", ph_url: "https://example.com/image.jpg", or: "— ou —", label_upload: "Télécharger une photo", file_selected: "✓ Sélectionné:", click_to_upload: "📁 Cliquez pour choisir", saving: "Enregistrement...", save_changes: "Sauvegarder", publish: "Publier", fill_required: "Champs obligatoires !", save_error: "Erreur: ", btn_chat: "Chat", label_name: "Nom / Pseudo", label_bio: "À propos", label_skills: "Services supplémentaires / Compétences (tags)", label_contacts: "Contacts (Telegram/WA)", save_profile: "Sauvegarder", profile_saved: "Profil mis à jour !", show_online_label: "Afficher mon statut 'En ligne'",
          cat_design: "Design", cat_dev: "Développement et IT", cat_text: "Textes et traduction", cat_seo: "SEO et trafic", cat_social: "Réseaux sociaux", cat_audio: "Audio et vidéo", cat_bus: "Affaires et vie", cat_photo: "Photographie", cat_anim: "Animation & 3D", cat_edu: "Cours & Conseil",
          ref_title: "Programme de parrainage", ref_desc: "Invitez des amis et obtenez des bonus!", ref_my_code: "Votre code", ref_copy: "Copier", ref_copied: "Copié!", ref_activation: "Activer l'invitation", ref_enter: "Entrer le code", ref_apply: "Appliquer", ref_applied: "Code appliqué:", ref_err_self: "Code personnel invalide", ref_err_notfound: "Code introuvable", ref_success: "Appliqué avec succès!", role_title: "Votre rôle", role_client: "💼 Client Uniquement", role_freelancer: "💻 Freelancer Uniquement", role_both: "🔄 Les deux",
          tab_tasks: "Mes Tâches", btn_new_task: "Créer tâche", no_tasks: "Vous n'avez pas de tâches actives" }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  const categories = [
    { id: 'DESIGN', titleKey: 'cat_design' }, 
    { id: 'DEV', titleKey: 'cat_dev' }, 
    { id: 'TEXT', titleKey: 'cat_text' }, 
    { id: 'SEO', titleKey: 'cat_seo' }, 
    { id: 'SOCIAL', titleKey: 'cat_social' }, 
    { id: 'AUDIO', titleKey: 'cat_audio' }, 
    { id: 'PHOTO', titleKey: 'cat_photo' },
    { id: 'ANIMATION', titleKey: 'cat_anim' },
    { id: 'EDUCATION', titleKey: 'cat_edu' },
    { id: 'BUSINESS', titleKey: 'cat_bus' }
  ];

  const currentHint = CATEGORY_HINTS[taskForm.category] || CATEGORY_HINTS['DESIGN'];
  const isTaskValid = !!taskForm.title.trim() && !!taskForm.description.trim() && taskForm.budget > 0;

  useEffect(() => {
    let isMounted = true; 
    const initSettings = async () => {
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang && isMounted) setLang(savedLang);
      const savedCurrency = localStorage.getItem('unit_currency');
      if (savedCurrency && isMounted) setCurrency(savedCurrency);
    };
    initSettings();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.user.email) {
        alert(translate('auth_req'));
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user); 
    }
    checkAuth();
  }, [router, lang]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (descSuggestionsRef.current && !descSuggestionsRef.current.contains(event.target as Node)) {
        setShowDescSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const defaultList = SUGGESTED_TITLES[lang] || SUGGESTED_TITLES['EN'];
    if (editForm.title.trim()) {
      const filtered = defaultList.filter(item => 
        item.toLowerCase().includes(editForm.title.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(defaultList);
    }
  }, [editForm.title, lang, showModal]);

  useEffect(() => {
    const defaultDescList = SUGGESTED_DESCRIPTIONS[lang] || SUGGESTED_DESCRIPTIONS['EN'];
    if (editForm.description.trim()) {
      const filtered = defaultDescList.filter(item => 
        item.toLowerCase().includes(editForm.description.toLowerCase())
      );
      setFilteredDescSuggestions(filtered);
    } else {
      setFilteredDescSuggestions(defaultDescList);
    }
  }, [editForm.description, lang, showModal]);

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  const fetchDashboardData = async (currentUser: any) => {
    setLoading(true);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
    if (profile) {
      setFullName(profile.full_name || ''); 
      setBio(profile.bio || ''); 
      setContacts(profile.contacts || '');
      setSkills(profile.skills || ''); 
      setSpokenLanguages(profile.spoken_languages || []);
      setShowOnline(profile.show_online ?? true);
      setRole(profile.role || 'both');
      
      setReferralCode(profile.referral_code || '');
      setInvitedBy(profile.invited_by || '');
    }
    
    // Услуги пользователя
    const { data: servicesData } = await supabase.from('services').select('*').eq('seller_email', currentUser.email).order('created_at', { ascending: false });
    if (servicesData) {
      setMyServices(servicesData);
      if (servicesData.length > 0) {
        const serviceIds = servicesData.map(s => s.id);
        const { data: ordersData } = await supabase.from('orders').select('*, services(title, price)').in('service_id', serviceIds).order('created_at', { ascending: false });
        if (ordersData) setIncomingOrders(ordersData);
      }
    }

    // Задания пользователя (Биржа)
    const { data: tasksData } = await supabase.from('tasks').select('*').eq('client_email', currentUser.email).order('created_at', { ascending: false });
    if (tasksData) {
      setMyTasks(tasksData);
      const taskIds = tasksData.map(t => t.id);
      if (taskIds.length > 0) {
        const { data: respData } = await supabase.from('task_responses').select('*').in('task_id', taskIds);
        if (respData) setTaskResponses(respData);
      }
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      full_name: fullName, 
      bio: bio, 
      contacts: contacts,
      skills: skills,
      spoken_languages: spokenLanguages,
      show_online: showOnline,
      updated_at: new Date() 
    });
    if (error) alert(translate('save_error') + error.message);
    else alert(translate('profile_saved'));
    setSavingProfile(false);
  };

  const handleUpdateRole = async (newRole: 'client' | 'freelancer' | 'both') => {
    setRole(newRole);
    if (user) {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
      if (error) {
         alert(translate('save_error') + error.message);
      } else {
         alert("Роль успешно обновлена!");
      }
    }
  };

  const handleApplyReferral = async () => {
    if (!inputInviteCode.trim()) return alert(translate('ref_enter'));
    if (inputInviteCode.trim() === referralCode) return alert(translate('ref_err_self'));
    
    setIsApplyingCode(true);
    
    const { data: checkUser, error: checkError } = await supabase.from('profiles').select('id').eq('referral_code', inputInviteCode.trim()).single();
    
    if (checkError || !checkUser) {
      alert(translate('ref_err_notfound'));
      setIsApplyingCode(false);
      return;
    }
  
    const { error } = await supabase.from('profiles').update({ invited_by: inputInviteCode.trim() }).eq('id', user.id);
    if (!error) {
      setInvitedBy(inputInviteCode.trim());
      alert(translate('ref_success'));
    } else {
      alert(translate('save_error') + error.message);
    }
    setIsApplyingCode(false);
  };

  const toggleOnlineStatus = async () => {
    const newValue = !showOnline;
    setShowOnline(newValue);
    await supabase.from('profiles').update({ show_online: newValue }).eq('id', user.id);
    window.location.reload(); 
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('services').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('services').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveService = async () => {
    if (!editForm.title || !editForm.price || !editForm.description) { alert(translate('fill_required')); return; }
    setIsUploading(true);
    try {
      let finalImageUrl = editForm.image_url;
      if (selectedFile) finalImageUrl = await uploadImage(selectedFile);
      const serviceData = { ...editForm, image_url: finalImageUrl, seller_email: user.email, seller_name: fullName || user.email.split('@')[0], user_id: user.id };
      if (editingId) {
        await supabase.from('services').update(serviceData).eq('id', editingId);
        setMyServices(myServices.map(s => s.id === editingId ? { ...s, ...serviceData } : s));
      } else {
        const { data } = await supabase.from('services').insert([serviceData]).select();
        if (data) setMyServices([data[0], ...myServices]);
      }
      setShowModal(false); setSelectedFile(null);
    } catch (err: any) { alert(translate('save_error') + err.message); } finally { setIsUploading(false); }
  };

  const deleteService = async (id: string) => {
    if (!confirm(translate('delete_confirm'))) return;
    await supabase.from('services').delete().eq('id', id);
    setMyServices(myServices.filter(s => s.id !== id));
  };

  const deleteTask = async (id: string) => {
    if (!confirm(translate('delete_task_confirm'))) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      alert("Ошибка при удалении: " + error.message);
    } else {
      setMyTasks(myTasks.filter(t => t.id !== id));
      alert("Задание успешно удалено!");
    }
  };

  const openNewServiceModal = () => {
    setEditingId(null); 
    setEditForm({ title: '', price: 0, description: '', category: 'DESIGN', image_url: '', language: 'RU' }); 
    setSelectedFile(null); 
    setShowSuggestions(false); 
    setShowDescSuggestions(false);
    setShowModal(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id); 
    // Подставляем язык из БД, если его нет - ставим RU
    setEditForm({ ...service, language: service.language || 'RU' }); 
    setSelectedFile(null); 
    setShowSuggestions(false); 
    setShowDescSuggestions(false);
    setShowModal(true);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setIncomingOrders(incomingOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleAcceptFreelancer = async (taskId: string, responseId: string, freelancerEmail: string) => {
    if (!confirm("Выбрать этого исполнителя? Это закроет прием откликов.")) return;

    const { error: taskError } = await supabase.from('tasks').update({ 
      status: 'closed', 
      winner_email: freelancerEmail,
      winner_response_id: responseId 
    }).eq('id', taskId);

    if (taskError) return alert("Ошибка при выборе: " + taskError.message);

    const { error: orderError } = await supabase.from('orders').insert([{
      service_id: null,
      client_email: user.email,
      freelancer_email: freelancerEmail,
      status: 'New',
      task_id: taskId
    }]);

    if (orderError) alert("Ошибка создания заказа: " + orderError.message);
    else {
      alert("Исполнитель выбран! Заказ создан и добавлен во вкладку «Входящие заказы».");
      fetchDashboardData(user);
    }
  };

  const handleCreateTask = async () => {
    if (!isTaskValid) return alert("Заполните все поля!");
    const { data, error } = await supabase.from('tasks').insert([{
      client_email: user.email,
      ...taskForm
    }]).select();

    if (error) alert("Ошибка: " + error.message);
    else {
      if (data) setMyTasks([data[0], ...myTasks]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', budget: 0, category: 'DESIGN', language: 'RU' });
      alert("Задание опубликовано!");
    }
  };

  const openReviewModal = (order: any) => {
    const targetEmail = user.email === order.client_email ? order.freelancer_email : order.client_email;
    setReviewModal({ isOpen: true, orderId: order.id, targetEmail: targetEmail || 'Исполнитель', rating: 5, comment: '' });
  };

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true);
    try {
      const { error: reviewError } = await supabase.from('reviews').insert({
        order_id: reviewModal.orderId,
        from_email: user.email,
        to_email: reviewModal.targetEmail,
        rating: reviewModal.rating,
        comment: reviewModal.comment
      });

      if (reviewError) throw reviewError;

      await updateOrderStatus(reviewModal.orderId, 'Completed');

      alert('Отзыв успешно отправлен! Заказ полностью завершен.');
      setReviewModal({ ...reviewModal, isOpen: false });
    } catch (err: any) {
      alert('Ошибка при сохранении отзыва: ' + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Done': return 'bg-[#11a95e]/10 text-[#11a95e] border border-[#11a95e]/30';
      case 'Completed': return 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white border border-[#0f9653] shadow-sm';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#11a95e] animate-pulse text-base bg-[#F8F9FA]">{translate('loading')}</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => router.push('/')}>
            <span>UNIT<span className="text-[#11a95e]">.</span></span> 
            <span className="text-[10px] uppercase tracking-widest font-black text-white bg-gradient-to-r from-orange-400 to-orange-500 px-2 py-0.5 rounded-md hidden sm:inline-block shadow-sm">Dashboard</span>
          </div>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-400 hover:text-orange-500 transition-colors">{translate('to_main')} →</button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 py-6">
        
        {/* === БЛОК ПАНЕЛИ ПОЛЬЗОВАТЕЛЯ === */}
        <div className="relative bg-gradient-to-br from-[#11a95e]/10 via-white to-orange-500/10 rounded-2xl py-4 px-6 mb-5 border border-[#11a95e]/15 overflow-hidden shadow-sm flex flex-col md:flex-row items-center gap-4">
           <div className="absolute -top-12 -right-10 w-48 h-48 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>
           <div className="absolute top-10 right-32 w-48 h-48 bg-[#11a95e] rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>
           
           <div className="relative z-10 w-[60px] h-[60px] shrink-0 rounded-2xl bg-gradient-to-br from-[#11a95e] to-emerald-400 flex items-center justify-center text-2xl text-white font-black shadow-md shadow-emerald-500/20">
             {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
           </div>
           
           <div className="relative z-10 flex-1 text-center md:text-left min-w-0">
             <h1 className="text-[22px] font-black text-[#111] mb-0.5 tracking-tight truncate">{fullName || user?.email?.split('@')[0]}</h1>
             <p className="text-gray-400 mb-1.5 text-[13px] font-medium truncate">{user?.email}</p>
             <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[12px] font-medium">
                <div className="bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/60 shadow-sm text-gray-500 font-bold">{translate('services_count')} <span className="text-[#111] ml-0.5 font-black">{myServices.length}</span></div>
                <div className="bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/60 shadow-sm text-gray-500 font-bold">{translate('orders_process')} <span className="text-blue-600 ml-0.5 font-black">{incomingOrders.filter(o => o.status === 'Process').length}</span></div>
                <div className="bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/60 shadow-sm text-gray-500 font-bold">{translate('orders_done')} <span className="text-[#11a95e] ml-0.5 font-black">{incomingOrders.filter(o => o.status === 'Done' || o.status === 'Completed').length}</span></div>
             </div>
           </div>

           <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button 
               onClick={() => setTaskModal(true)} 
               className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all active:scale-95 w-full sm:w-auto text-center"
             >
               {translate('btn_new_task')}
             </button>
             <button 
               onClick={openNewServiceModal} 
               className="bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white px-5 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all active:scale-95 w-full sm:w-auto text-center"
             >
               {translate('add_service')}
             </button>
           </div>
        </div>
        
        {/* КНОПКИ ВКЛАДОК НА ВСЮ ШИРИНУ */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-gray-100 w-full shadow-sm overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab('services')} className={`flex-1 px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all whitespace-nowrap text-center ${activeTab === 'services' ? 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50'}`}>{translate('tab_services')} ({myServices.length})</button>
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all whitespace-nowrap text-center ${activeTab === 'tasks' ? 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50'}`}>{translate('tab_tasks')} ({myTasks.length})</button>
          <button onClick={() => setActiveTab('orders')} className={`flex-1 px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all whitespace-nowrap text-center ${activeTab === 'orders' ? 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50'}`}>{translate('tab_orders')} ({incomingOrders.length})</button>
<button onClick={() => setActiveTab('portfolio')} className={`flex-1 px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all whitespace-nowrap text-center ${activeTab === 'portfolio' ? 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50'}`}>{translate('tab_portfolio')}</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 px-5 py-2.5 rounded-lg font-bold text-[13px] transition-all whitespace-nowrap text-center ${activeTab === 'settings' ? 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-50'}`}>{translate('tab_settings')}</button>
        </div>

        {/* === ПЕРЕКЛЮЧАТЕЛЬ ПЛИТКА/СПИСОК === */}
        {(activeTab === 'services' || activeTab === 'tasks') && (
          <div className="flex justify-end mb-4">
            <div className="bg-gray-100/80 p-1 rounded-xl flex items-center shadow-inner gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Плитка
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                Список
              </button>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: ПОРТФОЛИО */}
        {activeTab === 'portfolio' && (
          <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <AddPortfolioForm />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 w-full"> 
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h3 className="font-black text-[16px] text-[#111] mb-4">{translate('role_title')}</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleUpdateRole('client')} className={`flex-1 py-3 px-4 rounded-xl font-bold text-[13px] transition-all border ${role === 'client' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>{translate('role_client')}</button>
                <button onClick={() => handleUpdateRole('freelancer')} className={`flex-1 py-3 px-4 rounded-xl font-bold text-[13px] transition-all border ${role === 'freelancer' ? 'bg-[#11a95e]/10 text-[#11a95e] border-[#11a95e]/30' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>{translate('role_freelancer')}</button>
                <button onClick={() => handleUpdateRole('both')} className={`flex-1 py-3 px-4 rounded-xl font-bold text-[13px] transition-all border ${role === 'both' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>{translate('role_both')}</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
              <h2 className="text-[16px] font-black mb-1 text-[#111]">{translate('ref_title')}</h2>
              <p className="text-[13px] text-gray-400 font-medium mb-5">{translate('ref_desc')}</p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('ref_my_code')}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[16px] font-black text-orange-500 tracking-wider bg-orange-100/50 px-3 py-1 rounded-lg">
                      {referralCode || '...'}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        alert(translate('ref_copied'));
                      }}
                      className="text-[12px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors cursor-pointer"
                    >
                      {translate('ref_copy')}
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('ref_activation')}</p>
                  {invitedBy && !isApplyingCode ? (
                    <div className="flex items-center gap-2 text-[#11a95e] font-bold text-[13px] bg-[#11a95e]/10 px-4 py-2 rounded-lg">
                      ✓ {translate('ref_applied')} {invitedBy}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" placeholder={translate('ref_enter')} value={inputInviteCode} onChange={(e) => setInputInviteCode(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] outline-none focus:border-orange-400 font-mono font-bold w-full" />
                      <button onClick={handleApplyReferral} disabled={isApplyingCode} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-[12px] transition-colors disabled:opacity-50 shrink-0 cursor-pointer shadow-sm">
                        {translate('ref_apply')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-[16px] font-black mb-5 text-[#111] border-b border-gray-50 pb-2.5">{translate('tab_settings')}</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_name')}</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white outline-none transition-all shadow-inner" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_contacts')}</label>
                    <input type="text" value={contacts} onChange={(e) => setContacts(e.target.value)} placeholder="@username / +..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white outline-none transition-all shadow-inner" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    {translate('label_skills')}
                  </label>
                  <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Например: Tilda, Figma, React, Перевод текстов, Анимация..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white outline-none transition-all shadow-inner" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_bio')}</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white outline-none transition-all h-[110px] resize-none shadow-inner" />
                </div>

                {/* === БЛОК ВЛАДЕНИЯ ЯЗЫКАМИ === */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 mt-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    Языки общения и уровень
                  </label>
                  
                  <div className="space-y-2">
                    {spokenLanguages.map((lang, index) => {
                      const langInfo = AVAILABLE_LANGS.find(l => l.code === lang.code);
                      return (
                        <div key={lang.code} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="text-[13px] font-bold text-[#111] w-24">{langInfo?.name || lang.code}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => {
                                  const newLangs = [...spokenLanguages];
                                  newLangs[index].level = star;
                                  setSpokenLanguages(newLangs);
                                }}
                                className={`text-xl transition-transform hover:scale-110 ${star <= lang.level ? 'text-orange-400' : 'text-gray-300'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={() => setSpokenLanguages(spokenLanguages.filter(l => l.code !== lang.code))}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-4 cursor-pointer font-bold text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <select 
                      id="newLangSelect"
                      defaultValue=""
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-[13px] font-bold outline-none focus:border-orange-400 cursor-pointer"
                    >
                      <option value="" disabled>Выберите язык...</option>
                      {AVAILABLE_LANGS.filter(l => !spokenLanguages.find(sl => sl.code === l.code)).map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        const select = document.getElementById('newLangSelect') as HTMLSelectElement;
                        if (select.value) {
                          setSpokenLanguages([...spokenLanguages, { code: select.value, level: 3 }]);
                          select.value = ""; 
                        }
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-[12px] transition-colors cursor-pointer"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>
                {/* === КОНЕЦ БЛОКА ЯЗЫКОВ === */}

                <div className="pt-3 border-t border-gray-100 mt-2 mb-2">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input type="checkbox" checked={showOnline} onChange={toggleOnlineStatus} className="w-4 h-4 rounded border-gray-300 text-[#11a95e] focus:ring-[#11a95e]" />
                    <span className="text-[13px] font-bold text-gray-600 group-hover:text-[#11a95e] transition-colors">{translate('show_online_label')}</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={saveProfile} disabled={savingProfile} className="bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white px-6 py-3 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50 cursor-pointer">{savingProfile ? translate('saving') : translate('save_profile')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === ВКЛАДКА: МОИ ЗАДАНИЯ === */}
        {activeTab === 'tasks' && (
          <div>
            {myTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 font-medium">
                {translate('no_tasks')}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
                {myTasks.map(t => {
                  const responses = taskResponses.filter(r => r.task_id === t.id);
                  return (
                    <div key={t.id} className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col h-full ${viewMode === 'grid' ? 'p-4' : 'p-5 sm:flex-row gap-5'}`}>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="min-w-0">
                            <h3 className={`font-black text-[#111] leading-snug ${viewMode === 'grid' ? 'text-[14px] line-clamp-2' : 'text-[16px]'}`}>
                              {t.title}
                            </h3>
                            <p className="text-[13px] text-gray-500 mt-1.5 flex flex-wrap gap-2 items-center">
                              <span className="font-black text-orange-500">{displayPrice(t.budget)}</span>
                              <span className="uppercase text-[9px] font-black tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t.status}</span>
                            </p>
                          </div>
                          
                          <button onClick={() => deleteTask(t.id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold text-[11px] hover:bg-red-500 hover:text-white transition-colors cursor-pointer shrink-0">
                            {translate('delete')}
                          </button>
                        </div>
                        
                        {t.description && viewMode === 'list' && (
                          <p className="text-[13px] text-gray-600 line-clamp-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                            {t.description}
                          </p>
                        )}
                        
                        {t.description && viewMode === 'grid' && (
                          <p className="text-[12px] text-gray-500 line-clamp-2 mb-3">
                            {t.description}
                          </p>
                        )}
                        
                        <div className={`bg-gray-50/80 rounded-xl p-3 border border-gray-100/50 mt-auto ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <h4 className="font-bold text-[11px] uppercase tracking-widest text-gray-400 mb-2">Отклики ({responses.length})</h4>
                          {responses.length === 0 ? (
                            <p className="text-[12px] text-gray-400">Пока нет откликов</p>
                          ) : (
                            <div className={`space-y-2 overflow-y-auto custom-scrollbar pr-1 ${viewMode === 'grid' ? 'max-h-[120px]' : ''}`}>
                              {responses.map(r => (
                                <div key={r.id} className="bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div className="min-w-0 flex-1">
                                    <Link href={`/freelancer/${r.freelancer_email}`} target="_blank" className="font-black text-[12px] text-[#11a95e] hover:underline mb-0.5 inline-block truncate max-w-full">
                                      {r.freelancer_email} ↗
                                    </Link>
                                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">{r.message}</p>
                                  </div>
                                  
                                  {t.status === 'open' && (
                                    <button onClick={() => handleAcceptFreelancer(t.id, r.id, r.freelancer_email)} className="bg-[#11a95e] text-white px-3 py-1.5 rounded-md font-bold text-[10px] hover:bg-[#0e9552] transition-colors shrink-0 cursor-pointer uppercase tracking-wider">
                                      Выбрать
                                    </button>
                                  )}

                                  {t.status === 'closed' && t.winner_response_id === r.id && (
                                    <span className="text-[10px] font-bold text-[#11a95e] bg-[#11a95e]/10 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">
                                      ✓ Выбран
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* === ВКЛАДКА: МОИ УСЛУГИ === */}
        {activeTab === 'services' && (
          <div>
            {myServices.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 font-medium">
                {translate('no_services')}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full" : "space-y-3 w-full"}>
                {myServices.map(s => (
                  <div key={s.id} className={`bg-white rounded-2xl border border-gray-100 transition-all duration-300 group ${viewMode === 'grid' ? 'p-4 flex flex-col hover:-translate-y-1 hover:shadow-xl' : 'p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md'}`}>
                    <div className={viewMode === 'list' ? "flex items-center gap-4 flex-1 w-full min-w-0" : "w-full"}>
                      <div className={`bg-gray-100 rounded-xl overflow-hidden relative border border-gray-50 shrink-0 ${viewMode === 'grid' ? 'w-full aspect-[4/3] mb-3.5' : 'w-16 h-12 sm:w-20 sm:h-16'}`}>
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📸</div>
                        )}
                        {viewMode === 'grid' && (
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border border-gray-100/50">
                            {translate(categories.find(c => c.id === s.category)?.titleKey || s.category)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {viewMode === 'list' && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                            {translate(categories.find(c => c.id === s.category)?.titleKey || s.category)}
                          </span>
                        )}
                        <h3 className={`font-bold text-[#111] group-hover:text-[#11a95e] transition-colors leading-snug ${viewMode === 'grid' ? 'text-[14px] mb-1.5 line-clamp-2 h-10' : 'text-[15px] truncate'}`}>
                          {s.title}
                        </h3>
                        <div className={`font-black text-orange-500 ${viewMode === 'grid' ? 'mb-4 text-[15px]' : 'text-[14px] sm:text-[16px] mt-0.5'}`}>
                          {displayPrice(s.price)}
                        </div>
                      </div>
                    </div>

                    <div className={`flex gap-2 ${viewMode === 'grid' ? 'mt-auto border-t border-gray-50 pt-3 w-full' : 'shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100'}`}>
                      <button onClick={() => openEditModal(s)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-[11px] hover:bg-gray-200 transition-colors border border-gray-100 cursor-pointer whitespace-nowrap">{translate('edit')}</button>
                      <button onClick={() => deleteService(s.id)} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg font-bold text-[11px] hover:bg-red-500 hover:text-white transition-colors cursor-pointer whitespace-nowrap">{translate('delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === ВКЛАДКА: ВХОДЯЩИЕ ЗАКАЗЫ === */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 w-full">
            {incomingOrders.length === 0 ? <div className="p-12 text-center text-gray-400 font-medium border border-dashed border-gray-200 m-4 rounded-xl">{translate('no_orders')}</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="p-4 pl-6">{translate('th_service')}</th>
                      <th className="p-4 text-center">{translate('th_status')}</th>
                      <th className="p-4 pr-6 text-right">{translate('th_action')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] font-medium">
                    {incomingOrders.map(o => (
                      <React.Fragment key={o.id}>
                        <tr className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-[#111] mb-0.5">{o.services?.title || "Индивидуальное задание"}</div>
                            <div className="text-[11px] text-gray-400 font-medium">Клиент: {o.client_email}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider inline-block ${getStatusStyle(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-2 items-center">
                              <button onClick={() => setOpenChatOrderId(openChatOrderId === o.id ? null : o.id)} className={`px-3.5 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${openChatOrderId === o.id ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>
                                {translate('btn_chat')} {openChatOrderId === o.id ? '▲' : '▼'}
                              </button>
                              
                              {o.status === 'New' && <button onClick={() => updateOrderStatus(o.id, 'Process')} className="px-3.5 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-[11px] hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 shadow-sm cursor-pointer">{translate('btn_to_work')}</button>}
                              {o.status === 'Process' && <button onClick={() => updateOrderStatus(o.id, 'Done')} className="px-3.5 py-2 bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:from-[#0e9552] hover:to-[#11a95e] transition-colors shadow-sm shadow-emerald-500/10 cursor-pointer">{translate('btn_deliver')}</button>}
                              
                              {o.status === 'Done' && (
                                <button onClick={() => openReviewModal(o)} className="px-3.5 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:from-orange-500 hover:to-orange-600 transition-colors shadow-sm cursor-pointer">
                                  Оценить и завершить
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {openChatOrderId === o.id && (
                          <tr>
                            <td colSpan={3} className="p-5 bg-gray-50/50 border-b border-gray-100">
                              <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mx-auto">
                                <Chat orderId={o.id} userEmail={user.email} lang={lang} status={o.status} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* === МОДАЛКА ОСТАВЛЕНИЯ ОТЗЫВА === */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-gray-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <button onClick={() => setReviewModal({ ...reviewModal, isOpen: false })} className="absolute top-6 right-6 text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h2 className="text-[22px] font-black text-[#111] tracking-tight mb-1">Оставьте отзыв</h2>
              <p className="text-[13px] text-gray-500 font-medium">Оцените работу пользователя <br/><span className="font-bold text-[#11a95e]">{reviewModal.targetEmail}</span></p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <svg className={`w-10 h-10 ${star <= reviewModal.rating ? 'text-orange-400 drop-shadow-sm' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Ваш комментарий</label>
                <textarea 
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                  placeholder="Опишите ваши впечатления от сотрудничества..."
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl h-28 outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-[14px]"
                />
              </div>

              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-4 rounded-2xl font-black uppercase tracking-wider text-[14px] transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmittingReview ? 'Сохранение...' : 'Отправить и Завершить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА УСЛУГИ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-50">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-xl text-gray-400 hover:text-orange-500 transition-colors leading-none cursor-pointer">×</button>
            <h2 className="text-[18px] font-black mb-5 text-[#111]">{editingId ? translate('modal_edit') : translate('modal_new')}</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 relative" ref={suggestionsRef}>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_title')}</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white text-[14px] font-medium transition-all shadow-inner" 
                  placeholder={translate('ph_title')} 
                  value={editForm.title} 
                  onFocus={() => setShowSuggestions(true)} 
                  onChange={e => { 
                    setEditForm({...editForm, title: e.target.value}); 
                    setShowSuggestions(true); 
                  }} 
                />
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="absolute z-[110] left-0 right-0 top-[100%] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[180px] overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => { setEditForm({...editForm, title: suggestion}); setShowSuggestions(false); }} className="px-4 py-2.5 hover:bg-emerald-50 text-gray-700 font-semibold text-[13px] cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-[#11a95e] opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                        <span className="truncate">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_cat')}</label>
                  <select className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-orange-400 focus:bg-white text-[14px] font-bold transition-all cursor-pointer shadow-inner" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{translate(c.titleKey)}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_price')} (PLN)</label>
                  <input className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white text-[14px] font-bold transition-all shadow-inner" type="number" placeholder={translate('ph_price')} value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Язык услуги</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-orange-400 focus:bg-white text-[14px] font-bold transition-all cursor-pointer shadow-inner" 
                  value={editForm.language || 'RU'} 
                  onChange={e => setEditForm({...editForm, language: e.target.value})}
                >
                  <option value="RU">Русский (RU)</option>
                  <option value="EN">English (EN)</option>
                  <option value="PL">Polski (PL)</option>
                  <option value="DE">Deutsch (DE)</option>
                  <option value="ES">Español (ES)</option>
                  <option value="IT">Italiano (IT)</option>
                  <option value="FR">Français (FR)</option>
                  <option value="UA">Українська (UA)</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5 relative" ref={descSuggestionsRef}>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_desc')}</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl h-24 outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white text-[13px] font-medium transition-all shadow-inner leading-relaxed" 
                  placeholder={translate('ph_desc')} 
                  value={editForm.description} 
                  onFocus={() => setShowDescSuggestions(true)}
                  onChange={e => {
                    setEditForm({...editForm, description: e.target.value});
                    setShowDescSuggestions(true);
                  }} 
                />

                {showDescSuggestions && filteredDescSuggestions.length > 0 && (
                  <ul className="absolute z-[110] left-0 right-0 top-[100%] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[180px] overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2">
                    {filteredDescSuggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => { setEditForm({...editForm, description: suggestion}); setShowDescSuggestions(false); }} 
                        className="px-4 py-3 hover:bg-emerald-50 text-gray-700 font-medium text-[12px] cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-start gap-2 leading-tight"
                      >
                        <svg className="w-4 h-4 text-[#11a95e] opacity-40 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7"/></svg>
                        <span className="truncate line-clamp-3">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{translate('label_url')}</label>
                <input className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white text-[14px] font-medium transition-all shadow-inner" placeholder={translate('ph_url')} value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
              </div>
              
              <div className="text-[11px] text-gray-400 font-bold text-center uppercase tracking-wider">{translate('or')}</div>

              <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-5 text-center group hover:border-[#11a95e] hover:bg-emerald-50/20 transition-all cursor-pointer">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                <div className="text-[12px] text-gray-500 font-medium">
                  {selectedFile ? <span className="text-[#11a95e] font-bold">{translate('file_selected')} {selectedFile.name}</span> : <span className="group-hover:text-[#11a95e] font-bold transition-colors">{translate('click_to_upload')}</span>}
                </div>
              </div>
            </div>
            <button onClick={saveService} disabled={isUploading} className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-3.5 rounded-xl font-black text-[13px] uppercase tracking-wider mt-6 shadow-md shadow-emerald-500/10 disabled:opacity-50 cursor-pointer">
              {isUploading ? translate('saving') : (editingId ? translate('save_changes') : translate('publish'))}
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛКА ЗАДАНИЯ */}
      {taskModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setTaskModal(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <div className="mb-6">
              <h2 className="text-[24px] font-black text-[#111] tracking-tight">Новое задание</h2>
              <p className="text-[14px] text-gray-500 font-medium">Опишите задачу, чтобы исполнители сразу поняли, что нужно сделать.</p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Что нужно сделать?</label>
                <input 
                  type="text" 
                  placeholder={currentHint.titlePh} 
                  value={taskForm.title} 
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 px-5 py-3.5 rounded-2xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-[15px] font-medium" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Подробности задачи</label>
                <textarea 
                  placeholder={currentHint.descPh} 
                  value={taskForm.description} 
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl h-32 outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-[14px] leading-relaxed" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 flex justify-between">
                    <span>Бюджет (PLN)</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={taskForm.budget || ''} 
                    onChange={e => setTaskForm({...taskForm, budget: Number(e.target.value)})} 
                    className="w-full bg-gray-50 border border-gray-200 px-5 py-3.5 rounded-2xl outline-none focus:border-orange-400 text-[15px] font-black" 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Категория</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-2xl outline-none focus:border-orange-400 text-[14px] font-bold cursor-pointer transition-all" 
                    value={taskForm.category} 
                    onChange={e => setTaskForm({...taskForm, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{translate(c.titleKey)}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Язык</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-2xl outline-none focus:border-orange-400 text-[14px] font-bold cursor-pointer transition-all" 
                    value={taskForm.language || 'RU'} 
                    onChange={e => setTaskForm({...taskForm, language: e.target.value})}
                  >
                    <option value="RU">Русский (RU)</option>
                    <option value="EN">English (EN)</option>
                    <option value="PL">Polski (PL)</option>
                    <option value="DE">Deutsch (DE)</option>
                    <option value="ES">Español (ES)</option>
                    <option value="IT">Italiano (IT)</option>
                    <option value="FR">Français (FR)</option>
                    <option value="UA">Українська (UA)</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateTask} 
              disabled={!isTaskValid}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black mt-8 uppercase tracking-wider text-[14px] transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
            >
              Опубликовать задание
            </button>
          </div>
        </div>
      )}

    </div>
  );
}