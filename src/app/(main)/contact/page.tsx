import React from 'react';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact | Flex Wear',
  description: 'Reach out to the Flex Wear Bureau for support, inquiries, and archival data requests.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f0ece5] relative z-10 flex flex-col">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <main className="flex-grow pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto relative">
          
          {/* Header */}
          <div className="mb-24 border-b border-black pb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-16 h-1 bg-black"></span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-black">SYS_COMMS</span>
            </div>
            <h1 className="font-display text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter mb-8" style={{ WebkitTextStroke: "1px black", color: "transparent" }}>
              BUREAU<br />CONTACT
            </h1>
            <p className="font-mono text-[12px] text-black uppercase tracking-widest max-w-2xl font-bold leading-loose border-l border-black pl-6">
              INITIATE SECURE TRANSMISSION. FOR ALL INQUIRIES REGARDING ORDERS, ARCHIVAL RETURNS, OR GENERAL LOGS, PLEASE SUBMIT YOUR DATA BELOW.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              <div className="p-8 border border-black bg-white relative">
                <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border-b border-r border-black">GLOBAL_NODES</div>
                
                <div className="mt-6 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest">
                      <Mail size={14} /> SYS_EMAIL
                    </div>
                    <a href="mailto:transmission@flexwear.com" className="font-mono text-[11px] font-medium uppercase tracking-widest text-black/70 hover:text-black hover:border-b border-black transition-all">
                      transmission@flexwear.com
                    </a>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest">
                      <Phone size={14} /> SYS_VOICE
                    </div>
                    <a href="tel:+18005550199" className="font-mono text-[11px] font-medium uppercase tracking-widest text-black/70 hover:text-black hover:border-b border-black transition-all">
                      +1.800.555.0199
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-widest">
                      <MapPin size={14} /> SYS_LOC
                    </div>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-black/70 leading-loose">
                      FLEX WEAR ARCHIVES<br />
                      784 TECHNICAL BLVD<br />
                      LND / NYC / TKY
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="p-10 border border-black bg-[#f0ece5] relative">
                <div className="absolute top-0 left-0 bg-black text-[#f0ece5] font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border-b border-r border-black">TRANSMIT_FORM</div>
                
                <form className="mt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label htmlFor="firstName" className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">DATA_FIRST_NAME</label>
                      <input 
                        type="text" 
                        id="firstName"
                        placeholder="ENTER_DATA..."
                        className="w-full bg-white border border-black p-4 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="lastName" className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">DATA_LAST_NAME</label>
                      <input 
                        type="text" 
                        id="lastName"
                        placeholder="ENTER_DATA..."
                        className="w-full bg-white border border-black p-4 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="email" className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">SYS_EMAIL_ADDRESS</label>
                    <input 
                      type="email" 
                      id="email"
                      placeholder="USER@DOMAIN.COM"
                      className="w-full bg-white border border-black p-4 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="order" className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">ORDER_ID [OPTIONAL]</label>
                    <input 
                      type="text" 
                      id="order"
                      placeholder="#ORD_XXXXXXXX"
                      className="w-full bg-white border border-black p-4 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="message" className="font-mono text-[10px] font-black uppercase tracking-widest block border-b border-black/20 pb-2">TRANSMISSION_PAYLOAD</label>
                    <textarea 
                      id="message"
                      placeholder="ENTER DETAILED LOGS HERE..."
                      rows={6}
                      className="w-full bg-white border border-black p-4 font-mono font-medium text-[10px] uppercase tracking-widest focus:outline-none focus:bg-[#f0ece5] transition-colors placeholder:text-black/20 resize-none"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full md:w-auto px-12 h-16 border border-black bg-black text-[#f0ece5] flex items-center justify-center gap-4 font-mono font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-colors"
                  >
                    INITIATE_TRANSMIT <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
