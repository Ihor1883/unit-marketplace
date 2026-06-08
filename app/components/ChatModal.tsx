"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function ChatModal({ isOpen, onClose, orderId, userEmail }: { isOpen: boolean, onClose: () => void, orderId: string, userEmail: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase.channel('messages').on('postgres_changes', { 
      event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` 
    }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, orderId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert([{ order_id: orderId, sender_email: userEmail, content: newMessage }]);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="font-black text-[18px]">Чат заказа</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.sender_email === userEmail ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${m.sender_email === userEmail ? 'bg-[#11a95e] text-white' : 'bg-gray-100'}`}>
                <p className="text-[14px]">{m.content}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{m.sender_email.split('@')[0]}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-4">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#11a95e]" placeholder="Сообщение..." />
          <button onClick={sendMessage} className="bg-[#11a95e] text-white px-5 rounded-xl font-bold">Отправить</button>
        </div>
      </div>
    </div>
  );
}