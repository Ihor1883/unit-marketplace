"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

interface MyTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function MyTasksModal({ isOpen, onClose, userEmail }: MyTasksModalProps) {
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Стейты для окна отзыва
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [reviewWinnerEmail, setReviewWinnerEmail] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchMyTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_responses(*)')
      .eq('client_email', userEmail)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchMyTasks();
    }
  }, [isOpen, userEmail]);

  const handleSelectWinner = async (taskId: string, freelancerEmail: string, taskTitle: string) => {
    if (!confirm(`Вы уверены, что хотите назначить ${freelancerEmail} исполнителем?`)) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'in_progress', winner_email: freelancerEmail })
      .eq('id', taskId);

    if (error) {
      alert('Ошибка: ' + error.message);
      return;
    }

    await supabase.from('notifications').insert([{
      user_email: freelancerEmail,
      title: '🎉 Вас выбрали исполнителем!',
      message: `Заказчик выбрал ваш отклик для задания "${taskTitle}". Свяжитесь с ним для начала работы!`,
      type: 'task'
    }]);

    alert('Исполнитель назначен!');
    fetchMyTasks();
  };

  // Открытие мини-формы завершения задания
  const openReviewForm = (taskId: string, winnerEmail: string) => {
    setReviewTaskId(taskId);
    setReviewWinnerEmail(winnerEmail);
  };

  // Отправка отзыва и завершение задачи
  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTaskId) return;

    setIsSubmittingReview(true);

    // 1. Обновляем статус задачи на Completed и записываем отзыв
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ 
        status: 'Completed', 
        rating: rating, 
        review_text: reviewText 
      })
      .eq('id', reviewTaskId);

    if (taskError) {
      alert("Ошибка при завершении задачи: " + taskError.message);
      setIsSubmittingReview(false);
      return;
    }

    // 2. Высчитываем новый средний рейтинг фрилансера и обновляем его профиль
    const { data: freelancerTasks } = await supabase
      .from('tasks')
      .select('rating')
      .eq('winner_email', reviewWinnerEmail)
      .not('rating', 'is', null);

    if (freelancerTasks && freelancerTasks.length > 0) {
      const avgRating = freelancerTasks.reduce((acc, curr) => acc + curr.rating, 0) / freelancerTasks.length;
      
      // Ищем профиль по email, чтобы обновить рейтинг исполнителя
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', reviewWinnerEmail)
        .single();

      if (profileData?.id) {
        await supabase
          .from('profiles')
          .update({ rating: Number(avgRating.toFixed(2)) })
          .eq('id', profileData.id);
      }
    }

    // 3. Отправляем уведомление фрилансеру
    await supabase.from('notifications').insert([{
      user_email: reviewWinnerEmail,
      title: '✅ Задание успешно завершено!',
      message: `Заказчик (${userEmail}) завершил задание и оставил вам отзыв с оценкой ${rating}⭐!`,
      type: 'task'
    }]);

    alert("Задание завершено, отзыв успешно сохранен!");
    setReviewTaskId(null);
    setReviewText('');
    setRating(5);
    setIsSubmittingReview(false);
    fetchMyTasks();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3 shrink-0">
          <h2 className="font-black text-[20px] text-[#111]">Мои задания</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-orange-500 transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 hide-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-medium">Загрузка заданий...</div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Вы еще не создали ни одного задания.
            </div>
          ) : (
            myTasks.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-[16px] text-[#111]">{task.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-1">{task.description}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      task.status === 'Completed' || task.status === 'Done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-50 text-orange-500'
                    }`}>
                      {task.status === 'Completed' || task.status === 'Done' ? 'Завершено' :
                       task.status === 'in_progress' ? 'В работе' : 'Открыто'}
                    </span>
                  </div>
                </div>

                {/* Если задание В РАБОТЕ — показываем кнопку завершения */}
                {task.status === 'in_progress' && (
                  <div className="mb-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-[13px] text-gray-600">
                      Исполнитель: <span className="font-bold text-gray-800">{task.winner_email}</span>
                    </div>
                    <button 
                      onClick={() => openReviewForm(task.id, task.winner_email)}
                      className="bg-[#11a95e] hover:bg-[#0e9552] text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors shadow-sm shrink-0"
                    >
                      🥇 Завершить и оставить отзыв
                    </button>
                  </div>
                )}

                {/* Если задание ЗАВЕРШЕНО — выводим оставленный отзыв */}
                {(task.status === 'Completed' || task.status === 'Done') && task.rating && (
                  <div className="mb-4 bg-green-50/40 border border-green-100 rounded-xl p-4 text-[13px]">
                    <div className="font-bold text-green-800 mb-1">Вы успешно завершили этот проект:</div>
                    <div className="text-gray-600">Оценка: <span className="text-orange-500 font-bold">{"★".repeat(task.rating)} ({task.rating}/5)</span></div>
                    {task.review_text && <div className="text-gray-500 italic mt-1">"{task.review_text}"</div>}
                  </div>
                )}

                {/* Окно формы отзыва (появляется инлайн при клике на Завершить) */}
                {reviewTaskId === task.id && (
                  <form onSubmit={handleCompleteTask} className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <h4 className="font-bold text-[13px] text-gray-700">Завершение проекта и оценка исполнителя</h4>
                    
                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Оценка работы</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button 
                            key={num} type="button" onClick={() => setRating(num)}
                            className={`text-xl transition-transform active:scale-90 ${num <= rating ? 'text-orange-500' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ваш отзыв</label>
                      <textarea 
                        value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Напишите, как фрилансер справился с задачей..."
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-[#11a95e] min-h-[70px] resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setReviewTaskId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-600 text-[12px] font-bold rounded-lg hover:bg-gray-300">Отмена</button>
                      <button type="submit" disabled={isSubmittingReview} className="px-4 py-1.5 bg-orange-500 text-white text-[12px] font-bold rounded-lg hover:bg-orange-600 shadow-sm">{isSubmittingReview ? "Сохранение..." : "Подтвердить закрытие"}</button>
                    </div>
                  </form>
                )}

                {/* Отклики */}
                {task.status === 'open' && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                      Отклики ({task.task_responses?.length || 0})
                    </h4>
                    
                    {task.task_responses?.length === 0 ? (
                      <p className="text-[13px] text-gray-400">Пока нет ни одного отклика.</p>
                    ) : (
                      <div className="space-y-3">
                        {task.task_responses?.map((resp: any) => (
                          <div key={resp.id} className="p-3 rounded-xl border bg-white border-gray-200">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="font-bold text-[13px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                {resp.freelancer_email}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(resp.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[13px] text-gray-600 mb-3 whitespace-pre-wrap">{resp.message}</p>
                            
                            <button 
                              onClick={() => handleSelectWinner(task.id, resp.freelancer_email, task.title)}
                              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-[12px] font-bold py-2 rounded-lg transition-colors shadow-sm"
                            >
                              Выбрать исполнителем
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}