'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface Step6PhotoInstructionsProps {
  onNext: () => void
  onBack: () => void
}

export default function Step6PhotoInstructions({ onNext, onBack }: Step6PhotoInstructionsProps) {
  const goodPhotoExamples = [
    { image: '/images/avatars/good1.png', label: 'Photo 1' },
    { image: '/images/avatars/good2.png', label: 'Photo 2' },
    { image: '/images/avatars/good3.png', label: 'Photo 3' },
    { image: '/images/avatars/good4.png', label: 'Photo 4' },
    { image: '/images/avatars/good6.png', label: 'Photo 6' },
  ]

  const badPhotoExamples = [    
    { image: '/images/avatars/bad1.png', label: 'Group photos' },
    { image: '/images/avatars/bad2.png', label: 'Hats & Sunglasses' },
    { image: '/images/avatars/bad3.png', label: 'Pets' },
    { image: '/images/avatars/bad4.png', label: 'Heavy filters' },
    { image: '/images/avatars/bad5.png', label: 'Low-resolution' },
  ]

  return (
    <div className="space-y-6 pr-2">
      {/* Header */}
      <div className="text-left">
        <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px]">
        Use a video or photo to create your avatar&apos;s first look. <br className='md:block hidden' />
        You can add more looks of either type later.
        </p>
      </div>

      <div className="space-y-10">
        {/* Good Photos Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
          <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.5 10.5C0.5 7.71523 1.60625 5.04451 3.57538 3.07538C5.54451 1.10625 8.21523 0 11 0C13.7848 0 16.4555 1.10625 18.4246 3.07538C20.3938 5.04451 21.5 7.71523 21.5 10.5C21.5 13.2848 20.3938 15.9555 18.4246 17.9246C16.4555 19.8938 13.7848 21 11 21C8.21523 21 5.54451 19.8938 3.57538 17.9246C1.60625 15.9555 0.5 13.2848 0.5 10.5ZM10.4008 14.994L16.446 7.4368L15.354 6.5632L10.1992 13.0046L6.548 9.9624L5.652 11.0376L10.4008 14.994Z" fill="#16C82B"/>
          </svg>

            <h4 className="text-[24px] font-semibold text-[#101010] leading-[24px]">
              Want large or distinct gesture?
            </h4>
          </div>
          <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px] max-w-[638px]">
          Recent photos of yourself (just you), showing a mix of close-ups and full-body shots, with different angles, expressions (smiling, neutral, serious), and a variety of outfits. Make sure they are High-resolution and reflect your current appearance.
          </p>
          
          <div className="flex justify-between flex-wrap gap-y-5 pt-4">
            {goodPhotoExamples.map((example, index) => (
               <div key={index} className="text-center">
               <Image src={example.image} alt={example.label} width={1000} height={1000} className='w-[120px] h-[169px] object-cover rounded-[12px]' />
             </div>
            ))}
          </div>
        </div>

        {/* Bad Photos Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0.5C15.53 0.5 20 4.97 20 10.5C20 16.03 15.53 20.5 10 20.5C4.47 20.5 0 16.03 0 10.5C0 4.97 4.47 0.5 10 0.5ZM13.59 5.5L10 9.09L6.41 5.5L5 6.91L8.59 10.5L5 14.09L6.41 15.5L10 11.91L13.59 15.5L15 14.09L11.41 10.5L15 6.91L13.59 5.5Z" fill="#FB2323"/>
          </svg>

            <h4 className="text-[24px] font-semibold text-[#101010] leading-[24px]">
              Bad Photos
            </h4>
          </div>
          <p className="text-[18px] text-[#5F5F5F] font-normal leading-[24px] max-w-[638px]">No group photos, hats, sunglasses, pets, heavy filters, low-resolution images, or screenshots. Avoid photos that are too old, overly edited, or don&apos;t represent how you currently look.</p>
          
          <div className="flex justify-between flex-wrap gap-y-5 pt-4">
            {badPhotoExamples.map((example, index) => (
              <div key={index} className="text-center">
                <Image src={example.image} alt={example.label} width={1000} height={1000} className='w-[120px] h-[169px] object-cover rounded-[12px]' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 justify-between pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#667085] hover:text-[#5046E5] transition-colors duration-300 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-[11.3px] font-semibold text-[20px] rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] "
        >
          Next
        </button>
      </div>
    </div>
  )
}
