'use client'

import { getPasswordStrength, getPasswordStrengthColor, getPasswordStrengthBgColor } from '@/lib/password-validation'

interface PasswordStrengthIndicatorProps {
  passwordStrength: { score: number; feedback: string[] }
}

export default function PasswordStrengthIndicator({ passwordStrength }: PasswordStrengthIndicatorProps) {
  return (
    <div id="password-strength" className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-600">Password strength:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => {
            const strength = getPasswordStrength(passwordStrength.score)
            return (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= passwordStrength.score ? getPasswordStrengthBgColor(strength) : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>
        <span className={`text-xs font-medium ${getPasswordStrengthColor(getPasswordStrength(passwordStrength.score))}`}>
          {getPasswordStrength(passwordStrength.score).replace('-', ' ')}
        </span>
      </div>
      {passwordStrength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {passwordStrength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

