"use client"

import * as React from "react"
import Link from "next/link"
import { useSidebar } from "./ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "./ui/sidebar"
import Image from "next/image"

export function MobileHeader() {
    const { isMobile } = useSidebar()

    if (!isMobile) {
        return null
    }

    return (
        <header className="fixed left-0 w-full top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 py-2 md:hidden">
            <div className="flex flex-1 items-center">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-28 h-auto" priority />
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="h-6" />
                <SidebarTrigger />
            </div>
        </header>
    )
}