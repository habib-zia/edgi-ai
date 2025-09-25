'use client'

interface VideoAvatarStep2Props {
  onNext: () => void
}

export default function VideoAvatarStep2({ onNext }: VideoAvatarStep2Props) {
  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-[#282828]">
            Go to Avatars
          </h2>
          <p className="text-[18px] text-[#667085]">
            Login to Heygen and then go to Avatars Section
          </p>
        </div>

        {/* HeyGen Application Screenshot */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src="/images/video_creation_modal_image2.png"
              alt="HeyGen Application Interface"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
        <button
          onClick={onNext}
          className="w-full bg-[#5046E5] text-white px-5 py-3 mt-5 rounded-full font-semibold text-[18px] hover:bg-[#4338CA] transition-colors duration-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}
