import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

const Header = () => {
  return (
    <>
      <div className='fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b dark:border-gray-800'>
          <nav className='container mx-auto px-4 py-4 flex items-center justify-between'> 
              <Link href='/'>
              <Image src={"/finwise-logo.png"}
              alt='logo'
              height={60} width ={200}
              className='h-12 w-auto object-contain'/>
              </Link>
          

          <div className='flex items-center space-x-4'>
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <SignedIn>
                  <Link href={"/dashboard"} className='text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 inline-flex items-center gap-2'>
                  <Button variant="outline">
                      <LayoutDashboard size={18}></LayoutDashboard>
                      <span className='hidden md:inline'>Dashboard</span>
                  </Button>
                  </Link>

              </SignedIn>

              <SignedOut>
                <SignInButton forceRedirectUrl="/"> 
                  <Button variant="outline">Login</Button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <div className="relative z-10">
                  <UserButton appearance={{
                    elements:{
                        avatarBox: "w-10 h-10",
                        userButtonPopoverCard: "z-50"
                    },
                  }} />
                </div>
              </SignedIn>

          </div>
          </nav>
      </div>
      {/* Spacer div to prevent content from being hidden under the header */}
      <div className="h-16"></div>
    </>
  )
}

export default Header