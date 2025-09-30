'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'

interface CardPreviewProps {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cardType?: string
  className?: string
}

export default function CardPreview({ 
  cardNumber, 
  expiryMonth, 
  expiryYear, 
  cardType = 'Unknown',
  className = ''
}: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Format card number for display
  const formatCardNumber = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '')
    if (cleanNumber.length === 0) return '•••• •••• •••• ••••'
    
    const masked = cleanNumber.replace(/\d(?=\d{4})/g, '•')
    
    if (cardType === 'American Express') {
      return masked.replace(/(.{4})(.{6})(.{5})/, '$1 $2 $3')
    } else {
      return masked.replace(/(.{4})(?=.{4})/g, '$1 ')
    }
  }

  // Format expiry date
  const formatExpiry = (month: string, year: string): string => {
    if (!month || !year) return 'MM/YY'
    const formattedMonth = month.padStart(2, '0')
    const formattedYear = year.slice(-2)
    return `${formattedMonth}/${formattedYear}`
  }

  // Get card type styling
  const getCardTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return {
          gradient: 'from-blue-600 to-blue-800',
          icon: '💳',
          text: 'VISA'
        }
      case 'mastercard':
        return {
          gradient: 'from-red-500 to-red-700',
          icon: '💳',
          text: 'MASTERCARD'
        }
      case 'american express':
        return {
          gradient: 'from-green-600 to-green-800',
          icon: '💳',
          text: 'AMEX'
        }
      case 'discover':
        return {
          gradient: 'from-orange-500 to-orange-700',
          icon: '💳',
          text: 'DISCOVER'
        }
      default:
        return {
          gradient: 'from-gray-600 to-gray-800',
          icon: '💳',
          text: 'CARD'
        }
    }
  }

  const cardStyle = getCardTypeStyle(cardType)

  return (
    <div className={`relative ${className}`}>
      {/* Card Container */}
      <div 
        className={`relative w-72 h-44 sm:w-80 sm:h-48 rounded-2xl shadow-2xl cursor-pointer transition-transform duration-700 transform-gpu ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${cardStyle.gradient} p-4 sm:p-6 text-white backface-hidden`}>
          {/* Card Type Badge */}
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{cardStyle.icon}</span>
              <span className="text-xs font-bold tracking-wider">{cardStyle.text}</span>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-3 h-3 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Card Number */}
          <div className="mb-4 sm:mb-6">
            <div className="text-lg sm:text-xl font-mono tracking-wider">
              {formatCardNumber(cardNumber)}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="flex justify-end items-end">
            <div className="text-right">
              <div className="text-xs text-white/70 mb-1">EXPIRES</div>
              <div className="text-sm font-semibold">
                {formatExpiry(expiryMonth, expiryYear)}
              </div>
            </div>
          </div>

          {/* Chip */}
          <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 w-6 h-4 sm:w-8 sm:h-6 bg-white/20 rounded-sm"></div>
        </div>

        {/* Back of Card */}
        <div className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${cardStyle.gradient} p-4 sm:p-6 text-white backface-hidden`} style={{ transform: 'rotateY(180deg)' }}>
          {/* Magnetic Strip */}
          <div className="w-full h-6 sm:h-8 bg-black rounded-sm mb-3 sm:mb-4"></div>
          
          {/* CVV Strip */}
          <div className="w-full h-6 sm:h-8 bg-white rounded-sm mb-3 sm:mb-4 flex items-center justify-end pr-3 sm:pr-4">
            <span className="text-black font-mono text-xs sm:text-sm">•••</span>
          </div>

          {/* Card Type */}
          <div className="flex justify-center items-center">
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{cardStyle.icon}</div>
              <div className="text-xs font-bold tracking-wider">{cardStyle.text}</div>
            </div>
          </div>

          {/* Signature Strip */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 h-4 sm:h-6 bg-white/10 rounded-sm"></div>
        </div>
      </div>

      {/* Flip Indicator */}
      <div className="mt-3 sm:mt-4 text-center">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto"
        >
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">{isFlipped ? 'Show Front' : 'Show Back'}</span>
        </button>
      </div>

      {/* Card Info */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1 text-xs sm:text-sm">Card Type</div>
            <div className="font-semibold text-gray-900 text-sm sm:text-base">{cardType}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1 text-xs sm:text-sm">Status</div>
            <div className="font-semibold text-green-600 text-sm sm:text-base">Valid</div>
          </div>
        </div>
      </div>
    </div>
  )
}
