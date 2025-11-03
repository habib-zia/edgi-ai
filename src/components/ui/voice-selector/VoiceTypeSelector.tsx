'use client'

import { VoiceType } from './types'

interface VoiceTypeSelectorProps {
  currentType: VoiceType
  onTypeChange: (type: VoiceType) => void
  title?: string
  description?: string
  lowLabel?: string
  mediumLabel?: string
  highLabel?: string
}

export default function VoiceTypeSelector({ 
  currentType, 
  onTypeChange,
  title = 'Voice Energy',
  description = 'Select the level of music and search the best voice for your video',
  lowLabel = 'Low Voice',
  mediumLabel = 'Medium Voice',
  highLabel = 'High Voice'
}: VoiceTypeSelectorProps) {
  return (
    <div className="lg:w-[280px] w-full bg-white px-6 flex flex-col">
      <div className="mb-5">
        <h3 className="text-[20px] font-semibold text-[#5F5F5F] mb-3">{title}</h3>
        <p className="text-base leading-[20px] text-[#5F5F5F]">
        {description}
        </p>
      </div>
      
      <div className="space-y-4 flex-1 lg:flex-col flex-row flex-wrap">
        <button
          onClick={() => onTypeChange('low')}
          className={`w-full flex items-center gap-4 px-2 py-2 rounded-[4px] transition-all duration-200 ${
            currentType === 'low'
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'bg-transparent hover:bg-white/50'
          }`}
        >
          <div className={`lg:w-[60px] lg:h-[65px] w-[45px] h-[45px] rounded-[4px] flex items-center justify-center ${
            currentType === 'low' ? 'bg-[#5046E51A]' : 'bg-[#5046E51A]'
          }`}>
            <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5795 3.33027L10.4091 7.4998H5.625C5.00344 7.4998 4.5 8.00324 4.5 8.6248V15.3748C4.5 15.9959 5.00344 16.4998 5.625 16.4998H10.4091L14.5795 20.6693C15.2841 21.3739 16.5 20.8789 16.5 19.8739V4.12574C16.5 3.1198 15.2831 2.62668 14.5795 3.33027ZM20.3545 8.39652C19.8117 8.09981 19.1269 8.29527 18.8259 8.83949C18.5264 9.38371 18.7247 10.0676 19.2689 10.3681C19.8741 10.7004 20.25 11.3262 20.25 11.9998C20.25 12.6739 19.8741 13.2992 19.2694 13.6315C18.7252 13.932 18.5269 14.6159 18.8264 15.1601C19.1278 15.7067 19.8131 15.9007 20.355 15.6031C21.6783 14.8742 22.5005 13.4937 22.5005 11.9993C22.5005 10.505 21.6783 9.12496 20.3545 8.39652Z" fill="#5046E5"/>
            </svg>
          </div>
          <span className={`text-[16px] ${currentType === 'low' ? 'font-semibold text-[#11101066]' : 'font-normal text-[#11101066]'}`}>
            {lowLabel}
          </span>
        </button>

        <button
          onClick={() => onTypeChange('medium')}
          className={`w-full flex items-center gap-4 px-2 py-2 rounded-[4px] transition-all duration-200 ${
            currentType === 'medium'
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'bg-transparent hover:bg-white/50'
          }`}
        >
          <div className={`lg:w-[60px] lg:h-[65px] w-[45px] h-[45px] rounded-[4px] flex items-center justify-center ${
            currentType === 'medium' ? 'bg-[#EBE9FE]' : 'bg-[#5046E51A]'
          }`}>
            <div className="flex gap-0.5">
            <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0795 3.33052L5.90906 7.50005H1.125C0.503438 7.50005 0 8.00349 0 8.62505V15.375C0 15.9961 0.503438 16.5 1.125 16.5H5.90906L10.0795 20.6696C10.7841 21.3741 12 20.8791 12 19.8741V4.12599C12 3.12005 10.7831 2.62692 10.0795 3.33052ZM22.5 12C22.5 9.02208 20.9972 6.28411 18.4795 4.6763C17.955 4.34161 17.2594 4.49724 16.927 5.02599C16.5947 5.55474 16.7498 6.25458 17.2744 6.58974C19.1377 7.77989 20.25 9.80208 20.25 12C20.25 14.198 19.1377 16.2202 17.2744 17.4104C16.7498 17.745 16.5947 18.4449 16.927 18.9741C17.2322 19.4597 17.917 19.6838 18.4795 19.3238C20.9972 17.716 22.5 14.9785 22.5 12ZM15.8545 8.39677C15.3117 8.10005 14.6269 8.29552 14.3259 8.83974C14.0264 9.38396 14.2247 10.0679 14.7689 10.3683C15.3741 10.7007 15.75 11.3265 15.75 12C15.75 12.6741 15.3741 13.2994 14.7694 13.6318C14.2252 13.9322 14.0269 14.6161 14.3264 15.1604C14.6278 15.7069 15.3131 15.901 15.855 15.6033C17.1783 14.8744 18.0005 13.494 18.0005 11.9996C18.0005 10.5052 17.1783 9.12521 15.8545 8.39677Z" fill="#5046E5"/>
              </svg>
            </div>
          </div>
          <span className={`text-[16px] ${currentType === 'medium' ? 'font-semibold text-[#11101066]' : 'font-normal text-[#11101066]'}`}>
            {mediumLabel}
          </span>
        </button>

        <button
          onClick={() => onTypeChange('high')}
          className={`w-full flex items-center gap-4 px-2 py-2 rounded-[4px] transition-all duration-200 ${
            currentType === 'high'
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'bg-transparent hover:bg-white/50'
          }`}
        >
          <div className={`lg:w-[60px] lg:h-[65px] w-[45px] h-[45px] rounded-[4px] flex items-center justify-center ${
            currentType === 'high' ? 'bg-[#EBE9FE]' : 'bg-[#5046E51A]'
          }`}>
            <div className="flex gap-0.5">
            <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_9025_1750)">
              <path d="M10.0795 3.33044L5.90906 7.49997H1.125C0.503438 7.49997 0 8.00341 0 8.62497V15.375C0 15.9961 0.503438 16.5 1.125 16.5H5.90906L10.0795 20.6695C10.7841 21.374 12 20.879 12 19.874V4.12591C12 3.11997 10.7831 2.62685 10.0795 3.33044ZM21.0164 0.936067C20.4928 0.592473 19.7892 0.737317 19.4456 1.26185C19.1016 1.78544 19.2478 2.48904 19.7714 2.83263C22.8778 4.87122 24.7317 8.29825 24.7317 12.0004C24.7317 15.7026 22.8778 19.1297 19.7714 21.1683C19.2478 21.5114 19.1016 22.2154 19.4456 22.7386C19.7756 23.2406 20.4736 23.4211 21.0164 23.0643C24.7627 20.6053 27 16.4686 27 12C27 7.53138 24.7627 3.39513 21.0164 0.936067ZM22.5 12C22.5 9.02201 20.9972 6.28404 18.4795 4.67622C17.955 4.34154 17.2594 4.49716 16.927 5.02591C16.5947 5.55466 16.7498 6.2545 17.2744 6.58966C19.1377 7.77982 20.25 9.802 20.25 12C20.25 14.1979 19.1377 16.2201 17.2744 17.4103C16.7498 17.745 16.5947 18.4448 16.927 18.974C17.2322 19.4597 17.917 19.6837 18.4795 19.3237C20.9972 17.7159 22.5 14.9784 22.5 12ZM15.8545 8.39669C15.3117 8.09997 14.6269 8.29544 14.3259 8.83966C14.0264 9.38388 14.2247 10.0678 14.7689 10.3683C15.3741 10.7006 15.75 11.3264 15.75 12C15.75 12.674 15.3741 13.2993 14.7694 13.6317C14.2252 13.9322 14.0269 14.6161 14.3264 15.1603C14.6278 15.7068 15.3131 15.9009 15.855 15.6033C17.1783 14.8743 18.0005 13.4939 18.0005 11.9995C18.0005 10.5051 17.1783 9.12513 15.8545 8.39669Z" fill="#5046E5"/></g><defs><clipPath id="clip0_9025_1750"><rect width="27" height="24" fill="white"/></clipPath></defs></svg>
            </div>
          </div>
          <span className={`text-[16px] ${currentType === 'high' ? 'font-semibold text-[#11101066]' : 'font-normal text-[#11101066]'}`}>
            {highLabel}
          </span>
        </button>
      </div>
    </div>
  )
}

