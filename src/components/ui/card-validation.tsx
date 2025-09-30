'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface CardValidationProps {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  onValidationChange: (isValid: boolean, cardType: string) => void
}

interface ValidationState {
  cardNumber: {
    isValid: boolean
    error: string
    cardType: string
  }
  expiry: {
    isValid: boolean
    error: string
  }
  overall: boolean
}

export default function CardValidation({ 
  cardNumber, 
  expiryMonth, 
  expiryYear, 
  onValidationChange 
}: CardValidationProps) {
  const [validation, setValidation] = useState<ValidationState>({
    cardNumber: { isValid: false, error: '', cardType: '' },
    expiry: { isValid: false, error: '' },
    overall: false
  })

  // Card type detection
  const detectCardType = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '')
    
    if (/^4/.test(cleanNumber)) return 'Visa'
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard'
    if (/^3[47]/.test(cleanNumber)) return 'American Express'
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover'
    if (/^3[0689]/.test(cleanNumber)) return 'Diners Club'
    if (/^35/.test(cleanNumber)) return 'JCB'
    
    return 'Unknown'
  }

  // Luhn algorithm for card number validation
  const validateCardNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\s/g, '')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false
    
    let sum = 0
    let isEven = false
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  // Expiry date validation
  const validateExpiry = (month: string, year: string): boolean => {
    if (!month || !year) return false
    
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    
    const expMonth = parseInt(month)
    const expYear = parseInt(year)
    
    if (expMonth < 1 || expMonth > 12) return false
    if (expYear < currentYear) return false
    if (expYear === currentYear && expMonth < currentMonth) return false
    
    return true
  }

  // Format card number with spaces
  const formatCardNumber = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '')
    const cardType = detectCardType(cleanNumber)
    
    if (cardType === 'American Express') {
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    } else {
      return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
  }

  useEffect(() => {
    const cardType = detectCardType(cardNumber)
    const isCardNumberValid = validateCardNumber(cardNumber)
    const isExpiryValid = validateExpiry(expiryMonth, expiryYear)
    
    const cardNumberError = (() => {
      if (!cardNumber) return ''
      if (cardNumber.length < 13) return 'Card number too short'
      if (!isCardNumberValid) return 'Invalid card number'
      return ''
    })()
    
    const expiryError = (() => {
      if (!expiryMonth || !expiryYear) return ''
      if (!isExpiryValid) return 'Card has expired or invalid date'
      return ''
    })()
    
    const overallValid = isCardNumberValid && isExpiryValid && cardNumber.length >= 13
    
    setValidation({
      cardNumber: {
        isValid: isCardNumberValid,
        error: cardNumberError,
        cardType
      },
      expiry: {
        isValid: isExpiryValid,
        error: expiryError
      },
      overall: overallValid
    })
    
    onValidationChange(overallValid, cardType)
  }, [cardNumber, expiryMonth, expiryYear, onValidationChange])

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'american express':
        return '💳'
      case 'discover':
        return '💳'
      default:
        return '💳'
    }
  }

  const getCardTypeColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'bg-blue-600'
      case 'mastercard':
        return 'bg-red-500'
      case 'american express':
        return 'bg-green-600'
      case 'discover':
        return 'bg-orange-500'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Card Number Validation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Card Number</span>
          {validation.cardNumber.cardType && (
            <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getCardTypeColor(validation.cardNumber.cardType)}`}>
              {validation.cardNumber.cardType}
            </div>
          )}
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={formatCardNumber(cardNumber)}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validation.cardNumber.isValid 
                ? 'border-green-500 bg-green-50' 
                : validation.cardNumber.error 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
            }`}
            readOnly
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.cardNumber.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : validation.cardNumber.error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        </div>
        
        {validation.cardNumber.error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validation.cardNumber.error}
          </p>
        )}
      </div>

      {/* Expiry Date Validation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Expiry Date</span>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={expiryMonth}
              placeholder="MM"
              maxLength={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validation.expiry.isValid 
                  ? 'border-green-500 bg-green-50' 
                  : validation.expiry.error 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
              }`}
              readOnly
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={expiryYear}
              placeholder="YYYY"
              maxLength={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validation.expiry.isValid 
                  ? 'border-green-500 bg-green-50' 
                  : validation.expiry.error 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
              }`}
              readOnly
            />
          </div>
          <div className="flex items-center">
            {validation.expiry.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : validation.expiry.error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        </div>
        
        {validation.expiry.error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validation.expiry.error}
          </p>
        )}
      </div>

      {/* Overall Validation Status */}
      <div className={`p-3 rounded-lg ${
        validation.overall 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {validation.overall ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            validation.overall ? 'text-green-800' : 'text-red-800'
          }`}>
            {validation.overall 
              ? 'Card information is valid' 
              : 'Please check your card information'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
