import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard, GlassButton } from '@/components/GlassComponents';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, CheckCircle } from 'lucide-react';

export function QRGeneratorPage() {
  const [qrType, setQrType] = useState('ticket');
  const [formData, setFormData] = useState({
    validity: '24',
    amount: '100',
    userId: '',
    customData: ''
  });
  const [generatedQR, setGeneratedQR] = useState('');
  const [copied, setCopied] = useState(false);

  function generateQR() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    
    let qrData = '';
    if (qrType === 'ticket') {
      qrData = `METRO-TICKET-${timestamp}-${randomStr}-${formData.validity}h`;
    } else if (qrType === 'day_pass') {
      qrData = `METRO-DAYPASS-${timestamp}-${randomStr}`;
    } else if (qrType === 'metro_card') {
      qrData = `METRO-CARD-${timestamp}-${randomStr}-${formData.amount}`;
    } else if (qrType === 'promotional') {
      qrData = `METRO-PROMO-${timestamp}-${formData.customData}`;
    }
    
    setGeneratedQR(qrData);
  }

  function downloadQR() {
    const svg = document.querySelector('#qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `metro-qr-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedQR);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              QR Code Generator
            </h1>
            <p className="text-lg text-neutral-700 mb-12 text-center">
              Generate QR codes for tickets, passes, and promotional campaigns
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <GlassCard variant="medium" className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  QR Configuration
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      QR Type
                    </label>
                    <select
                      value={qrType}
                      onChange={(e) => setQrType(e.target.value)}
                      className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                    >
                      <option value="ticket">Single Ticket</option>
                      <option value="day_pass">Day Pass</option>
                      <option value="metro_card">Metro Card</option>
                      <option value="promotional">Promotional</option>
                    </select>
                  </div>

                  {qrType === 'ticket' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        Validity (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.validity}
                        onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                        className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                        min="1"
                      />
                    </div>
                  )}

                  {qrType === 'metro_card' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                        min="0"
                      />
                    </div>
                  )}

                  {qrType === 'promotional' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-2">
                        Custom Data
                      </label>
                      <input
                        type="text"
                        value={formData.customData}
                        onChange={(e) => setFormData({ ...formData, customData: e.target.value })}
                        placeholder="Enter promotional code or message"
                        className="w-full h-14 px-4 bg-white/25 backdrop-blur-[10px] border border-white/30 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-metro-blue-500/40"
                      />
                    </div>
                  )}

                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={generateQR}
                    className="w-full"
                  >
                    Generate QR Code
                  </GlassButton>
                </div>
              </GlassCard>

              {/* QR Preview */}
              <GlassCard variant="medium" className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  QR Code Preview
                </h2>

                {generatedQR ? (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-lg">
                      <QRCodeSVG
                        id="qr-code-svg"
                        value={generatedQR}
                        size={256}
                        level="H"
                        className="mx-auto"
                      />
                    </div>

                    <div className="p-4 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-neutral-900 break-all flex-1">
                          {generatedQR}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="ml-3 p-2 hover:bg-white/20 rounded-md transition-colors"
                        >
                          {copied ? (
                            <CheckCircle className="w-5 h-5 text-success-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-neutral-700" />
                          )}
                        </button>
                      </div>
                    </div>

                    <GlassButton
                      variant="secondary"
                      size="lg"
                      onClick={downloadQR}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download QR Code
                    </GlassButton>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-64 h-64 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center">
                      <p className="text-neutral-500">QR code will appear here</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
