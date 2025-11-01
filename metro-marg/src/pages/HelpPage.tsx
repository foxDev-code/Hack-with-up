import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton, GlassInput } from '@/components/GlassComponents';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function HelpPage() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'm the Metro मार्ग AI assistant. How can I help you today?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a metro ticket?",
      answer: "To book a ticket, go to 'Book Ticket' from the navigation menu, select your ticket type (Single Journey, Return Trip, or Day Pass), choose your stations, and complete the payment. You'll receive a QR code that you can use at metro gates."
    },
    {
      question: "How can I recharge my metro card?",
      answer: "Visit your Profile page and use the Metro Card Balance section to recharge. Enter the amount you want to add and click 'Recharge'. The balance will be updated immediately."
    },
    {
      question: "How do I use the QR code?",
      answer: "After booking a ticket, go to 'My Tickets' and click on your ticket to view the QR code. Show this QR code at the metro gate scanner for entry and exit."
    },
    {
      question: "What are the different ticket types?",
      answer: "We offer three ticket types: Single Journey (one-way trip, valid for 4 hours), Return Trip (round trip, valid for 24 hours), and Day Pass (unlimited travel for 24 hours at Rs. 200)."
    },
    {
      question: "How do I track live metro trains?",
      answer: "Visit the 'Live Tracking' page, select your metro line (Blue, Red, Aqua, or Yellow), and you'll see real-time positions, status, and arrival times of all trains on that line."
    },
    {
      question: "Can I get a refund for my ticket?",
      answer: "Refunds are available for unused tickets. Please contact customer support within 24 hours of purchase with your ticket ID."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept online payments including credit/debit cards, UPI, and digital wallets. Metro card recharge also supports these payment methods."
    },
    {
      question: "How accurate is the live tracking?",
      answer: "Our live tracking system updates every 10 seconds to provide real-time train positions and status. ETA calculations are based on current traffic and operational conditions."
    }
  ];

  const quickReplies = [
    "How to book tickets?",
    "Track live trains",
    "Recharge metro card",
    "View my tickets"
  ];

  function handleSendMessage() {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages([...messages, { text: userMessage, isUser: true }]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "I understand your question. ";
      
      if (userMessage.toLowerCase().includes('book') || userMessage.toLowerCase().includes('ticket')) {
        botResponse = "To book a ticket, visit the 'Book Ticket' page from the menu. Select your ticket type, choose your stations, and complete the payment. You'll get a QR code instantly!";
      } else if (userMessage.toLowerCase().includes('track') || userMessage.toLowerCase().includes('live')) {
        botResponse = "You can track trains in real-time on the 'Live Tracking' page. Just select your metro line and see all active trains with their current positions and arrival times.";
      } else if (userMessage.toLowerCase().includes('recharge') || userMessage.toLowerCase().includes('balance')) {
        botResponse = "To recharge your metro card, go to your Profile page and use the recharge section. Enter the amount and confirm the payment.";
      } else if (userMessage.toLowerCase().includes('qr') || userMessage.toLowerCase().includes('code')) {
        botResponse = "Your QR codes are available in 'My Tickets'. Click on any ticket to view its QR code, which you can scan at metro gates.";
      } else {
        botResponse = "I'm here to help! You can ask me about booking tickets, tracking trains, recharging your card, or viewing tickets. What would you like to know more about?";
      }

      setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
    }, 1000);
  }

  function handleQuickReply(reply: string) {
    setInputMessage(reply);
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 text-center">
              Help & Support
            </h1>
            <p className="text-lg text-neutral-700 mb-12 text-center">
              Get assistance with your metro journey
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* FAQ Section */}
              <div className="lg:col-span-2">
                <GlassCard variant="medium" className="p-6 mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-metro-blue-500" />
                    Frequently Asked Questions
                  </h2>

                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-white/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span className="font-semibold text-neutral-900">{faq.question}</span>
                          {expandedFAQ === index ? (
                            <ChevronUp className="w-5 h-5 text-neutral-700" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-700" />
                          )}
                        </button>
                        {expandedFAQ === index && (
                          <div className="p-4 pt-0 text-neutral-700 bg-white/5">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Chatbot Section */}
              <div className="lg:col-span-1">
                <GlassCard variant="light" className="p-6 h-[600px] flex flex-col">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-metro-blue-500" />
                    AI Assistant
                  </h2>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser
                              ? 'bg-metro-blue-500 text-white'
                              : 'bg-white/30 text-neutral-900'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Replies */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-neutral-900 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your question..."
                      className="flex-1 h-12 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-12 h-12 bg-metro-blue-500 text-white rounded-md hover:bg-metro-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
