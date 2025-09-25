'use client'

interface VideoAvatarStep1Props {
  onNext: () => void
}

export default function VideoAvatarStep1({ onNext }: VideoAvatarStep1Props) {
  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-[#282828]">
            Create a Video Avatar
          </h2>
          <p className="text-[18px] text-[#667085]">
            Get the detailed twin of yourself
          </p>
        </div>

        {/* HeyGen Logo and Brand */}
        <div className="flex items-center gap-4 mb-12">
          {/* Logo */}
          <div className="relative w-16 h-16">
            <img
              src="/images/video_creation_modal_image.png"
              alt="HeyGen Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h3 className="text-[28px] font-bold text-[#282828]">
            HeyGen
          </h3>
        </div>

        {/* Create Button */}
        <button
          onClick={onNext}
          className={`px-8 py-[11.3px] font-semibold text-[20px] mt-5 rounded-full transition-colors duration-300 cursor-pointer w-full bg-[#5046E5] text-white hover:text-[#5046E5] hover:bg-transparent border-2 border-[#5046E5] `}
        >
          Create
        </button>
      </div>
    </div>
  )
}
