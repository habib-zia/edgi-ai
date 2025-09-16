'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PiHeadsetBold } from "react-icons/pi"
import { apiService } from '@/lib/api-service'

// Zod validation schema
const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
  question: z.string().min(10, 'Question must be at least 10 characters')
})

type ContactFormData = z.infer<typeof contactFormSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try
    {
      const messageData = {
        fullName: data.fullName,
        position: data.position,
        email: data.email,
        phone: data.phone,
        subject: `Contact from ${data.fullName} - ${data.position}`,
        question: data.question
      }
      
      const response = await apiService.sendContactMessage(messageData)

      if (response.success)
      {
        setSubmitSuccess(true)
        reset()
        setTimeout(() => setSubmitSuccess(false), 5000)
      } else
      {
        throw new Error(response.message || 'Failed to submit form')
      }
    } catch (error)
    {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.')
    } finally
    {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1260px] mx-auto px-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-14 items-start">

          {/* Left Section - Information */}
          <div className="space-y-8">
            {/* Real Support Guarantee Box */}
            <div className="bg-[#ECEFFD] border max-w-[432px] border-[#ECEFFD] w-full rounded-[16px] px-4 py-[15.2px]">
              <div className="flex items-center gap-4">
                <div className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center">
                  <PiHeadsetBold className="w-[31px] h-[31px] text-[#5046E5]" />
                </div>
                <div>
                  <p className="text-[#5046E5] font-medium text-[18px] leading-[24px]">
                    <span className="font-medium">Real Support Guarantee:</span> A real team<br />
                    member will respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="md:text-[38px] text-[30px] md:leading-[46px] font-semibold text-[#282828]">
                We get it. Sometimes you <br className='md:block hidden' /> just need to talk to a <br className='md:block hidden' /> human - reach out to us here.
              </h2>
            </div>

            {/* Description */}
            <p className="text-[#5F5F5F] text-[20px] max-w-lg leading-[27px]">
              Edge AI Realty was built for the underdog—the agent who feels left behind by tech, overwhelmed by video, and unsure where to start. We know the feeling.
            </p>
          </div>

          {/* Right Section - Contact Form */}
          <div>
            <h3 className="md:text-[56px] text-[40px] font-semibold text-[#282828] mb-6 leading-[40px]">
              Connect with Us
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Full Name"
                    className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${errors.fullName ? 'ring-2 ring-red-500' : ''
                      }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('position')}
                    type="text"
                    placeholder="Position / Title"
                    className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${errors.position ? 'ring-2 ring-red-500' : ''
                      }`}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Email Address"
                    className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${errors.email ? 'ring-2 ring-red-500' : ''
                      }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('phone')}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Phone Number"
                    maxLength={17}
                    onKeyPress={(e) => {
                      // Allow only numbers and backspace
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace')
                      {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white ${errors.phone ? 'ring-2 ring-red-500' : ''
                      }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Third Row - Text Area */}
              <div>
                <textarea
                  {...register('question')}
                  placeholder="Question"
                  rows={5}
                  className={`w-full px-4 py-3 bg-[#EEEEEE] hover:bg-[#F5F5F5] border-0 rounded-[8px] text-gray-800 placeholder-[#11101066] transition-all duration-300 focus:outline-none focus:ring focus:ring-[#5046E5] focus:bg-white resize-none ${errors.question ? 'ring-2 ring-red-500' : ''
                    }`}
                />
                {errors.question && (
                  <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
                )}
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Thank you! Your message has been sent successfully. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    {submitError}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col md:flex-row lg:flex-wrap lg:flex-row gap-4 pt-2 justify-end">
                {/* <button
                  type="button"
                  className="py-[11.2px] xl:max-w-[303px] max-w-full w-full bg-transparent border-2 border-[#5046E5] text-[#5046E5] rounded-full font-semibold text-[20px] leading-[32px] hover:bg-[#5046E5] hover:text-white px-2 transition-all duration-300 focus:outline-none cursor-pointer"
                >
                  Email Response Preferred
                </button> */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-[11.2px] xl:max-w-[218px] max-w-full w-full bg-[#5046E5] text-white rounded-full font-semibold text-[20px] leading-[32px] hover:bg-transparent hover:text-[#5046E5] border-2 border-[#5046E5] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5046E5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}