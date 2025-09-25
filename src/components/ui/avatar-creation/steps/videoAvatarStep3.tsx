'use client'

interface VideoAvatarStep3Props {
  onNext: () => void
}

export default function VideoAvatarStep3({ onNext }: VideoAvatarStep3Props) {
  return (
    <div className="bg-white flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold text-[#282828]">
            Create Your Digital Twin
          </h2>
          <p className="text-[18px] text-[#667085]">
            Upload your video and create the digital twin.
          </p>
        </div>

        {/* Digital Twin Feature Card */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-white border-2 border-[#3B82F6] rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-0">
                <h3 className="text-[24px] font-bold text-[#282828]">
                  Digital Twin
                </h3>
                <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most realistic
                </span>
              </div>
            </div>
            
            <p className="text-[16px] text-[#667085] mb-6">
              Use a single video to create an avatar that moves and acts just like you.
            </p>

            {/* Visual Example */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/images/video_creation_modal_image3.png"
                  alt="Digital Twin Example"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
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
