import React from 'react'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import Hero from '@/components/Home/Hero'
import Teacher from '@/components/Home/Teacher'
import Learning from '@/components/Home/Learning'
import FreeResourses from '@/components/Home/FreeResourses'
import Faq from '@/components/Home/Faq'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <Teacher />
        <Learning />
        <FreeResourses />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
