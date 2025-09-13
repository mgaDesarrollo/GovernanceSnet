"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  HelpCircleIcon,
  BookOpenIcon,
  MessageCircleIcon,
  MailIcon,
  ExternalLinkIcon,
  FileTextIcon,
  UsersIcon,
  VoteIcon,
  SettingsIcon,
  AlertCircleIcon,
} from "lucide-react"
import Link from "next/link"

export default function HelpSupportPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoadingPage(true)
      return
    }
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }
    if (status === "authenticated") {
      setIsLoadingPage(false)
    }
  }, [session, status, router])

  if (isLoadingPage || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircleIcon className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Help & Support</h1>
            <p className="text-slate-400 font-medium">Get help with the SingularityNET Governance Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black border-secondary hover:border-secondary/50 transition-colors overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpenIcon className="h-5 w-5 text-blue-400" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">
                Access comprehensive guides and documentation for the governance platform.
              </p>
              <Link href="https://dev.singularitynet.io/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-secondary text-slate-300 hover:bg-black">
                  View Docs <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black border-secondary hover:border-secondary/50 transition-colors overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircleIcon className="h-5 w-5 text-green-400" />
                Community Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">
                Join our Discord community for real-time help and discussions.
              </p>
              <Link href="https://discord.gg/snet" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-secondary text-slate-300 hover:bg-black">
                  Join Discord <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black border-secondary hover:border-secondary/50 transition-colors overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MailIcon className="h-5 w-5 text-yellow-400" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4">Need direct assistance? Contact our support team via email.</p>
              <Link href="mailto:singularitynetambassadors@gmail.com">              
                <Button variant="outline" className="w-full border-secondary text-slate-300 hover:bg-black">
                  Send Email <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-slate-400">
              Find answers to common questions about the governance platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-secondary">
                <AccordionTrigger className="text-slate-200 hover:text-purple-400">
                  <div className="flex items-center gap-2">
                    <VoteIcon className="h-4 w-4" />
                    How do I vote on proposals?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  To vote on proposals, navigate to the Proposals section from the sidebar. Find the proposal you want
                  to vote on and click "View Details". You'll see voting options (Consent, Object, Abstain) at the
                  bottom of the proposal details. Select your choice and click "Submit Vote".
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-secondary">
                <AccordionTrigger className="text-slate-200 hover:text-purple-400">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    How do I create a new proposal?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  Only users with ADMIN or SUPER_ADMIN roles can create proposals. If you have the required permissions,
                  go to the Proposals section and click "Create New Proposal". Fill in all required fields including
                  title, description, budget, and workgroup assignment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-secondary">
                <AccordionTrigger className="text-slate-200 hover:text-purple-400">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    How do I update my profile?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  Click on "Edit Profile" in the Settings section of the sidebar. You can update your personal
                  information, professional details, skills, social links, and upload your CV. Make sure to save your
                  changes before leaving the page.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-secondary">
                <AccordionTrigger className="text-slate-200 hover:text-purple-400">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    What are the different user roles?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-2">
                    <div>
                      <Badge className="bg-blue-600/20 text-blue-300 border-secondary">CORE_CONTRIBUTOR</Badge> - Can
                      vote on proposals and view collaborator profiles
                    </div>
                    <div>
                      <Badge className="bg-purple-600/20 text-purple-300 border-secondary">ADMIN</Badge> - Can
                      create proposals, manage expired proposals, and view analytics
                    </div>
                    <div>
                      <Badge className="bg-red-600/20 text-red-300 border-secondary">SUPER_ADMIN</Badge> - Full access
                      including user management and all admin features
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-secondary">
                <AccordionTrigger className="text-slate-200 hover:text-purple-400">
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4" />
                    What should I do if I encounter an error?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  If you encounter any errors or issues:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Try refreshing the page</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Check your internet connection</li>
                    <li>If the problem persists, contact support with details about the error</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Getting Started Guide</CardTitle>
            <CardDescription className="text-slate-400">
              New to the platform? Follow these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100 border-b border-secondary pb-2">For New Users</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Complete your profile in the Edit Profile section</li>
                  <li>Explore the Contributors section to see community members</li>
                  <li>Review current proposals in the Proposals section</li>
                  <li>Participate by voting on proposals that interest you</li>
                  <li>Join community discussions on Discord</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100 border-b border-secondary pb-2">
                  For Administrators
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Review the Analytics dashboard for governance insights</li>
                  <li>Create new proposals for community voting</li>
                  <li>Monitor and manage expired proposals</li>
                  <li>Manage user roles and permissions (Super Admin only)</li>
                  <li>Ensure proper governance process compliance</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Need More Help?</CardTitle>
            <CardDescription className="text-slate-400">
              Get in touch with our team for additional support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-100">Contact Information</h3>
                <div className="space-y-2 text-slate-300">
                  <p>
                    <strong>Email:</strong> singularitynetambassadors@gmail.com
                  </p>
                  <p>
                    <strong>Discord:</strong> SingularityNET Community
                  </p>
                  <p>
                    <strong>Response Time:</strong> 24-48 hours
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-100">Office Hours</h3>
                <div className="space-y-2 text-slate-300">
                  <p>
                    <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM UTC
                  </p>
                  <p>
                    <strong>Weekend:</strong> Limited support available
                  </p>
                  <p>
                    <strong>Emergency:</strong> Contact via Discord for urgent issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
