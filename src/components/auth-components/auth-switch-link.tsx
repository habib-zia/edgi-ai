'use client'

interface AuthSwitchLinkProps {
  questionText: string
  linkText: string
  onClick: () => void
}

export default function AuthSwitchLink({ questionText, linkText, onClick }: AuthSwitchLinkProps) {
  return (
    <div className="text-center mt-6">
      <p className="text-[#101828] text-base font-normal">
        {questionText}{' '}
        <button
          type="button"
          className="text-[#5046E5] text-[14px] font-semibold hover:underline cursor-pointer"
          onClick={onClick}
        >
          {linkText}
        </button>
      </p>
    </div>
  )
}

