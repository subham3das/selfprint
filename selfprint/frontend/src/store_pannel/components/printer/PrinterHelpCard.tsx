import React from 'react';
import {
  HelpCircle,
  Usb,
  Wifi,
  FileQuestion,
  Droplet
} from 'lucide-react';


export const PrinterHelpCard: React.FC = () => {
  const guides = [
    {
      title: 'Connecting USB Printers',
      desc: 'Plug the square USB Type-B cable into your printer and the rectangular end into your computer. Turn printer ON.',
      icon: Usb
    },
    {
      title: 'Connecting Wi-Fi Printers',
      desc: 'Ensure your printer and computer are connected to the same 2.4GHz Wi-Fi router network.',
      icon: Wifi
    },
    {
      title: 'Resolving Paper Jams',
      desc: 'Power off printer, open the toner door, and gently pull out stuck paper with two hands.',
      icon: FileQuestion
    },
    {
      title: 'Toner & Ink Maintenance',
      desc: 'Run a print head cleaning cycle if colors appear faded or horizontal white lines appear.',
      icon: Droplet
    }
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h4 className="font-extrabold text-slate-900 text-xs">
          Printer Quick Troubleshooting Guides
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.title}
              className="p-2.5 bg-white border border-slate-200/70 rounded-xl space-y-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                <Icon className="w-3.5 h-3.5 text-purple-600" />
                <span>{g.title}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                {g.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
