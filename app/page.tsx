"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Users, MessageSquare, TrendingUp, ArrowRight } from "lucide-react"

export default function Home() {
  const { user } = useAuthContext()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to BloggyWave</h1>
        <p className="text-xl mb-8 text-muted-foreground">Share your stories, ideas, and passion with the world</p>
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
        </div>
        {!user && (
          <Link href="/login">
            <Button size="lg" className="animate-bounce">
              Start Blogging Today
            </Button>
          </Link>
        )}
      </motion.section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why BloggyWave?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <BookOpen className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Create</h3>
            <p className="text-muted-foreground">Write and publish your stories with our intuitive editor</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <MessageSquare className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Engage</h3>
            <p className="text-muted-foreground">Connect with readers through comments and discussions</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Users className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Grow</h3>
            <p className="text-muted-foreground">Build your audience and join a community of writers</p>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Features That Set Us Apart</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Modern Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                A sleek, fast, and responsive blogging platform designed for today's writers. Enjoy a
                distraction-free writing experience with powerful formatting tools.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Vibrant Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Connect with fellow writers and readers who share your interests. Get feedback, share
                ideas, and grow your audience organically.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Rich Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Support for various content types including text, images, embedded media, and code
                snippets. Make your stories come alive with multimedia elements.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Engagement Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Built-in features for growing your readership including social sharing, newsletters,
                and analytics to track your blog's performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I start blogging?</AccordionTrigger>
              <AccordionContent>
                Simply sign up for a free account, customize your profile, and start writing! Our intuitive
                editor makes it easy to create and publish your first post in minutes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What can I blog about?</AccordionTrigger>
              <AccordionContent>
                Anything! Tech, travel, lifestyle, food, personal stories - the possibilities are endless.
                Share your unique perspective and experiences with the world.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is BloggyWave free to use?</AccordionTrigger>
              <AccordionContent>
                Yes! BloggyWave offers a generous free tier with all essential features. We also offer premium
                plans with additional features for professional bloggers and growing audiences.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Start Your Blogging Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Join thousands of writers who've found their voice on BloggyWave. Your story matters - share it with the world.
            </p>
            {!user && (
              <Link href="/login">
                <Button size="lg" className="mt-4">
                  Create Your Blog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

