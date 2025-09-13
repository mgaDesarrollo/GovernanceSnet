"use client"

import { useSessionWithRefresh } from "@/hooks/use-session"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  FileTextIcon,
  UsersIcon,
  BarChart3Icon,
  UserCogIcon,
  HelpCircleIcon,
  BotIcon,
  LogOutIcon,
  ActivityIcon,
  HomeIcon,
  UserIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { MobileHeader } from "@/components/mobile-header"
import Image from "next/image"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { useTheme } from "@/components/context/theme-context"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"

// Definir los elementos del menú con permisos
const getMenuItems = (userRole: string) => {

  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon
    },
    {
      title: "Proposals",
      url: "/dashboard/proposals",
      icon: FileTextIcon
    },
    {
      title: "Contributors",
      url: "/dashboard/contributors",
      icon: UsersIcon
    },
    {
      title: "Workgroups",
      url: "/dashboard/workgroups",
      icon: BarChart3Icon
    },

    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3Icon
    }
  ]

  const adminItems: { title: string; url: string; icon: any }[] = [

  ]

  const superAdminItems = [
    {
      title: "User Management",
      url: "/dashboard/user-management",
      icon: UserCogIcon
    }
  ]

  const settingsItems = [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: UserIcon
    }
  ]

  const supportItems = [
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: HelpCircleIcon
    },
    {
      title: "Assistant",
      url: "/dashboard/assistant",
      icon: BotIcon
    },
    {
      title: "Assistant Docs",
      url: "/dashboard/assistant-docs",
      icon: BotIcon
    },
  ]

  return {
    main: baseItems,
    admin: userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? adminItems : [],
    superAdmin: userRole === "SUPER_ADMIN" ? superAdminItems : [],
    settings: settingsItems,
    support: supportItems
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, refreshSession, signOut } = useSessionWithRefresh()
  const currentPath = usePathname()
  const { theme } = useTheme()
  const { open, setOpen, isMobile } = useSidebar()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  const userRole = user.role
  const userStatus = user.status
  const menuItems = getMenuItems(userRole)

  const getStatusBadgeInfo = (status?: string) => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "Available",
          className: "bg-green-500/20 text-green-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-green-400" />,
        }
      case "BUSY":
        return {
          text: "Busy",
          className: "bg-yellow-500/20 text-yellow-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-yellow-400" />,
        }
      case "VERY_BUSY":
        return {
          text: "Very Busy",
          className: "bg-red-500/20 text-red-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-red-400" />,
        }
      default:
        return {
          text: "Unknown",
          className: "bg-gray-500/20 text-gray-300 border-gray-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-gray-400" />,
        }
    }
  }

  const statusInfo = getStatusBadgeInfo(userStatus)

  return (
    <SidebarProvider>
      <MobileHeader />
      <div className="min-h-screen text-white flex w-full h-full">
        <Sidebar className="border-none">
          {
            isMobile ? "" : (
              <div onClick={() => setOpen(!open)} className={cn("shadow size-10 rounded-sm absolute top-1/2 -right-5 flex justify-center items-center -translate-y-1/2 z-50", open ? "-right-5" : "-right-10")}>
                <SidebarTrigger className={cn("w-full h-full bg-secondary! [&_svg]:bg-secondary! [&_svg]:stroke-white!", open ? "" : "rounded-l-none")} />
              </div>
            )
          }

          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-3 ">
              <Image
                alt="SingularityNET Logo"
                src={theme === "dark" ? "/images/isotipo.svg" : "/images/isotipo-black.svg"}
                width={36}
                height={36}
                priority
                className="w-9 h-auto"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white tracking-wide">Governance</h1>
                <p className="text-xs text-gray-400 font-medium">Dashboard</p>
              </div>
              <ThemeToggleButton className="ml-7" />
            </div>

            <div className="flex items-center gap-3 text-sm bg-gray-900/50 rounded-lg mx-2">
              <Avatar className="h-8 w-8 border-2 border-secondary">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-purple-600/20 text-purple-300 text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-white truncate text-sm">{user.name || "User"}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 border-secondary bg-purple-600/20 text-purple-300 capitalize"
                  >
                    {userRole?.replace("_", " ") || "N/A"}
                  </Badge>
                  {userStatus && (
                    <Badge variant="outline" className={`text-xs px-1 py-0 capitalize ${statusInfo.className}`}>
                      {statusInfo.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.main.map((item) => (
                    <SidebarMenuItem key={item?.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item?.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300 data-[active=true]:border-secondary"
                      >
                        <Link href={item?.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item?.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {menuItems.admin.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.admin.map((item) => (
                      <SidebarMenuItem key={item?.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={currentPath === item?.url}
                          className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                        >
                          <Link href={item?.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item?.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {menuItems.superAdmin.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Super Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.superAdmin.map((item) => (
                      <SidebarMenuItem key={item?.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={currentPath === item?.url}
                          className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                        >
                          <Link href={item?.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item?.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.settings.map((item) => (
                    <SidebarMenuItem key={item?.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item?.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <Link href={item?.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item?.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.support.map((item) => (
                    <SidebarMenuItem key={item?.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item?.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <Link href={item?.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item?.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem className="px-2">
                <span className="font-medium">AGIX Price: {config.agix.price}</span>

              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    // Usar el signOut del hook que ya está disponible
                    signOut()
                  }}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full justify-start"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Header removed */}

          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}