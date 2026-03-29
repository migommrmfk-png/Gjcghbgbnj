import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, BookOpen, ArrowRight } from 'lucide-react';
import { stories } from '../data/stories';

export default function Stories({ onBack }: { onBack: () => void }) {
  const [selectedStory, setSelectedStory] = useState<typeof stories[0] | null>(null);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] relative overflow-hidden pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 mt-2 bg-[var(--color-bg)]/80 backdrop-blur-xl sticky top-0 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={selectedStory ? () => setSelectedStory(null) : onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5 bg-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
          <ArrowRight className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)]" size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-[var(--color-primary-light)] text-xl font-serif drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            {selectedStory ? selectedStory.name : 'قصص الأنبياء'}
          </span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!selectedStory ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-4"
            >
              {stories.map((story, index) => (
                <motion.button
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedStory(story)}
                  className="card-3d p-4 flex items-center justify-between bg-[var(--color-surface)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-right group border border-black/5 dark:border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary-light)] flex items-center justify-center border border-[var(--color-primary)]/30 shadow-inner">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)] font-serif text-lg group-hover:text-[var(--color-primary-light)] transition-colors drop-shadow-md">
                        {story.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] font-bold mt-1">
                        {story.events.length} أحداث رئيسية
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] transition-colors rotate-180" />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {selectedStory.events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-6 pr-8 py-2"
                >
                  {/* Timeline line */}
                  {index !== selectedStory.events.length - 1 && (
                    <div className="absolute right-[11px] top-8 bottom-[-24px] w-0.5 bg-[var(--color-primary)]/30"></div>
                  )}
                  
                  {/* Timeline dot */}
                  <div className="absolute right-0 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] border-4 border-[var(--color-bg)] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                  
                  <div className="bg-[var(--color-surface)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h4 className="font-bold text-[var(--color-primary-light)] text-xl mb-3 font-serif drop-shadow-md relative z-10">
                      {event.title}
                    </h4>
                    <p className="text-[var(--color-text)] leading-loose text-justify relative z-10">
                      {event.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
