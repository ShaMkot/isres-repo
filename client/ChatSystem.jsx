import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "../components/input";
import ScrollArea from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from './ui/button';
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ChatSystem() {
  const { user } = useAuth();
  const currentUserId = user?._id;
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);
  const { conversationId } = useParams();

  // فتح المحادثة تلقائياً من URL
  useEffect(() => {
    if (conversationId && conversationId !== selectedChat) {
      setSelectedChat(conversationId);
    }
  }, [conversationId, selectedChat]);

  // تهيئة الاتصال بـ Socket.IO
  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.on("newMessage", (message) => {
      console.log("📥 تم الاستلام عبر السوكيت:", message);
      if (message.conversationId === selectedChat) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [selectedChat]);

  // تحميل قائمة المحادثات الخاصة بالمستخدم الحالي فقط
  useEffect(() => {
    if (!currentUserId) return;

    axios.get(`http://localhost:5000/api/conversations?userId=${currentUserId}`)
      .then(res => setConversations(res.data))
      .catch(err => console.error("خطأ في تحميل المحادثات", err));
  }, [currentUserId]);

  // عند اختيار محادثة، يتم تحميل الرسائل
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    // تصفير عدد الرسائل غير المقروءة عند فتح المحادثة
    axios.post(`http://localhost:5000/api/conversations/${selectedChat}/reset-unread`)
      .then(() => {
        // تحديث المحادثات محليًا فور تصفير unread
        setConversations(prev =>
          prev.map(c => c._id === selectedChat ? { ...c, unread: 0 } : c)
        );
      })
      .catch(err => console.error("فشل تصفير عدد الرسائل غير المقروءة", err));

    // جلب الرسائل
    axios.get(`http://localhost:5000/api/messages/${selectedChat}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("خطأ في تحميل الرسائل", err));

    const convo = conversations.find(c => c._id === selectedChat);
    setSelectedConversation(convo);
  }, [selectedChat, conversations]);

  // إرسال رسالة جديدة
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    axios.post('http://localhost:5000/api/messages', {
      conversationId: selectedChat,
      sender: currentUserId,
      content: newMessage.trim()
    }).then(res => {
      const sentMessage = res.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // إرسال الرسالة عبر WebSocket
      socket.current.emit("sendMessage", sentMessage);
    }).catch(err => console.error("خطأ في إرسال الرسالة", err));
  };

  return (
    <div dir="rtl" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)] text-right">
      {/* قائمة المحادثات */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <MessageSquare className="h-5 w-5" />
            <span>المحادثات النشطة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 p-4">
              {conversations.map(convo => (
                <div
                  key={convo._id}
                  onClick={() => setSelectedChat(convo._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === convo._id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{convo.fullName || convo.fullName}</h4>
                        <Badge variant={convo.status === 'active' ? 'default' : 'secondary'}>
                          {convo.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    </div>
                    {convo.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{convo.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(convo.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* نافذة المحادثة */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <User className="h-5 w-5" />
                <span>{selectedConversation?.fullName || selectedConversation?.userName}</span>
                <Badge variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}>
                  {selectedConversation.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            ) : (
              'اختر محادثة للبدء'
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between h-[500px]">
          {selectedChat ? (
            <>
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4 p-4">
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === currentUserId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* حقل الإدخال وزر الإرسال */}
              {selectedConversation?.status === 'active' && (
                <div className="flex space-x-2 space-x-reverse mt-2">
                  <Input
                    placeholder="اكتب رسالتك..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>اختر محادثة للبدء بالدردشة</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
