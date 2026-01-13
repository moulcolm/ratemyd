'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: { url: string; label?: string }[];
  initialIndex?: number;
  onNavigate?: (index: number) => void;
  currentIndex?: number;
}

export function PhotoLightbox({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  onNavigate,
  currentIndex: controlledIndex,
}: PhotoLightboxProps) {
  const currentIndex = controlledIndex ?? initialIndex;
  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (onNavigate && currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (!currentPhoto || !currentPhoto.url) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        onKeyDown={handleKeyDown}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/95" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full h-full flex items-center justify-center p-4">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Navigation arrows */}
                {photos.length > 1 && onNavigate && (
                  <>
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex === photos.length - 1}
                      className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}

                {/* Image container */}
                <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center">
                  <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
                    <Image
                      src={currentPhoto.url}
                      alt={currentPhoto.label || 'Photo'}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority
                    />
                  </div>
                </div>

                {/* Label and pagination */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  {currentPhoto.label && (
                    <span className="px-4 py-2 rounded-lg bg-black/70 text-white text-sm font-medium">
                      {currentPhoto.label}
                    </span>
                  )}
                  {photos.length > 1 && (
                    <div className="flex gap-2">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => onNavigate?.(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
