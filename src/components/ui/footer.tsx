'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { BRAND_NAME } from '@/lib/constants'
import { smoothScrollTo } from '@/lib/utils'
// import { FaFacebook, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
    const pathname = usePathname()

    const navigationLinks = [
        { name: 'Benefits', href: '#benefits' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ\'s', href: '#faq' },
        { name: 'Contact', href: '#contact' }
    ]

    useEffect(() => {
        if (pathname === '/' && window.location.hash) {
            const elementId = window.location.hash.substring(1)
            setTimeout(() => {
                smoothScrollTo(elementId)
            }, 100)
        }
    }, [pathname])

    const handleLinkClick = (e: React.MouseEvent, href: string) => {
        if (pathname === '/') {
            e.preventDefault()
            const elementId = href.substring(1) // Remove the '#'
            smoothScrollTo(elementId)
        }
    }

    // const socialLinks = [
    //     { icon: FaFacebook, href: '#', label: 'Facebook' },
    //     { icon: FaYoutube, href: '#', label: 'YouTube' },
    //     { icon: FaInstagram, href: '#', label: 'Instagram' },
    //     { icon: FaLinkedin, href: '#', label: 'LinkedIn' }
    // ]


    return (
        <footer className="bg-gray-100 border-t border-[#919191]">            
            {/* Main footer content */}
            <div className="bg-white">
                <div className="max-w-[1260px] mx-auto px-3 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Section - Brand & Social */}
                        <div className="space-y-5">
                            {/* Brand */}
                            <div>
                            <Link 
                                href="/"
                                className="text-[#5046E5] text-[26px] font-bold"
                                aria-label={`${BRAND_NAME} - Go to homepage`}
                                >
                                EdgeAI<span className="text-[#E54B46] font-bold">Realty</span>
                                </Link>
                            </div>
                            
                            {/* Description */}
                            <p className="text-[#282828] text-base leading-relaxed max-w-[380px]">
                            Custom AI videos for agents & loan officers—just fill one form, hit submit, and we handle the rest.
                            </p>
                            
                            {/* Social Media */}
                            {/* <div className="flex flex-col gap-4">
                                <h3 className="text-[#282828] font-semibold text-[26px]">Follow Us</h3>
                                <div className="flex gap-8">
                                    {socialLinks.map((social, index) => (
                                        <Link
                                            key={index}
                                            href={social.href}
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-[26px] h-[26px] text-[#282828]" />
                                        </Link>
                                    ))}
                                </div>
                            </div> */}
                        </div>
                        
                        {/* Right Section - Navigation Links */}
                        <div className="lg:justify-self-end">
                            <h3 className="text-[#282828] font-semibold text-[26px] mb-5">Links</h3>
                            <div className="grid grid-cols-1 gap-24 mb-3">
                                {/* Column 1 */}
                                <div className="space-y-3 flex gap-6 flex-wrap items-baseline">
                                    {navigationLinks.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={pathname === '/' ? link.href : `/${link.href}`}
                                            onClick={(e) => handleLinkClick(e, link.href)}
                                            className="block text-[#282828] text-[16px] hover:text-[#5046E5] transition-all duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <Link href="/privacy-policy" className="text-[#282828] text-[16px] hover:text-[#5046E5] transition-all duration-200 underline mt-4">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
