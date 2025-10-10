'use client'

interface ConsentScriptProps {
  minDuration: number
  maxDuration: number
}

export default function ConsentScript({ minDuration, maxDuration }: ConsentScriptProps) {
  return (
    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-6 max-w-full mx-auto">
      <h3 className="text-[18px] font-semibold text-[#101010] mb-4">Consent Statement</h3>
      <p className="text-[16px] text-[#374151] leading-relaxed">
        &quot;I, <span className="font-semibold text-[#5046E5]">[Your Full Name]</span>, hereby allow HeyGen to use the footage of me to build a HeyGen Avatar for use on the HeyGen platform.&quot;
      </p>
      <div className="mt-4 p-3 bg-[#FEF3C7] border border-[#F59E0B] rounded-md">
        <p className="text-[14px] text-[#92400E]">
          <strong>Requirements:</strong> Video must be {minDuration}-{maxDuration} seconds, at least 720p resolution, well-lit with clear audio, and in MP4/WebM format.
        </p>
      </div>
    </div>
  )
}
