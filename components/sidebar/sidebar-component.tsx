"use client";

import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Calendar,
  CalendarDays,
  PlusCircle,
  FolderGit2,
  UploadCloud,
  Sparkles,
  Briefcase,
  BrainCircuit,
  Mail,
  GraduationCap,
  StickyNote,
  Edit3,
  Bot,
  History,
  Activity,
  CheckCircle2,
  Sparkle
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar"
import { SidebarProps } from "../ui/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BreadcrumbComponent } from "./breadcrumb-component"
import { useMemo } from "react";
import { Badge } from "../ui/badge";

// Helper to assign sleek Lucide icons based on item/group title
function getNavIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("dashboard") || lower.includes("overview")) return <LayoutDashboard className="size-4 shrink-0" />;
  if (lower.includes("create event")) return <PlusCircle className="size-4 shrink-0" />;
  if (lower.includes("calendar")) return <Calendar className="size-4 shrink-0" />;
  if (lower.includes("upload")) return <UploadCloud className="size-4 shrink-0" />;
  if (lower.includes("document")) return <FolderGit2 className="size-4 shrink-0" />;
  if (lower.includes("resume")) return <Sparkles className="size-4 shrink-0" />;
  if (lower.includes("jd")) return <Briefcase className="size-4 shrink-0" />;
  if (lower.includes("qa") || lower.includes("drive")) return <BrainCircuit className="size-4 shrink-0" />;
  if (lower.includes("placement")) return <GraduationCap className="size-4 shrink-0" />;
  if (lower.includes("mail") || lower.includes("gmail")) return <Mail className="size-4 shrink-0" />;
  if (lower.includes("create note")) return <Edit3 className="size-4 shrink-0" />;
  if (lower.includes("note")) return <StickyNote className="size-4 shrink-0" />;
  if (lower.includes("history")) return <History className="size-4 shrink-0" />;
  if (lower.includes("doubt") || lower.includes("question") || lower.includes("solver")) return <Bot className="size-4 shrink-0" />;
  return <Sparkle className="size-4 shrink-0" />;
}

export function SidebarComponent({
  logo = <GalleryVerticalEnd className="size-4" />,
  companyName = "AI Career Assistant",
  navigationItems,
  breadcrumbItems,
  isAdmin,
  children,
  headerUserNav,
}: SidebarProps) {
  const pathname = usePathname();

  // Filter out admin-only routes if user is not admin
  const filteredNavigationItems = useMemo(
    () => {
      const filteredGroups = navigationItems.filter(item => {
        if (item.adminOnly) {
          return isAdmin;
        }
        return true;
      });

      const filteredItems = filteredGroups.map(group => ({
        ...group,
        items: group.items.filter(subItem => {
          if (subItem.adminOnly) {
            return isAdmin;
          }
          return true;
        }),
      }));
      return filteredItems;
    },
    [navigationItems, isAdmin]
  );

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/60 bg-sidebar/95 backdrop-blur-md">
        <SidebarHeader className="p-3 border-b border-border/40">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-accent/40 rounded-xl transition-all">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 overflow-hidden">
                    {logo}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm tracking-tight text-foreground">{companyName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      PRO WORKSPACE
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="hide-scrollbar px-2 py-3">
          {filteredNavigationItems.map((item) => {
            return (
              <SidebarGroup key={item.title} className="py-1.5">
                <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase px-2">
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {item.items.map((subItem) => {
                      // Check if any nav item in the sidebar has an exact match for the current path
                      const isExactMatch = pathname === subItem.url;
                      const isParentMatch = subItem.url !== '/' && pathname?.startsWith(subItem.url + '/');
                      const hasExactMatchInNav = filteredNavigationItems.some(g => g.items.some(i => i.url === pathname));
                      
                      const isActive = hasExactMatchInNav ? isExactMatch : (isExactMatch || isParentMatch);
                      return (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                              isActive
                                ? "bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20 dark:bg-primary/15"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                            }`}
                          >
                            <Link href={subItem.url} className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2.5">
                                <span className={isActive ? "text-primary" : "text-muted-foreground/70"}>
                                  {getNavIcon(subItem.title)}
                                </span>
                                <span>{subItem.title}</span>
                              </div>
                              {subItem.title === "Placement Emails" && (
                                <span className="size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* Live Service Status Footer */}
        <SidebarFooter className="p-3 border-t border-border/40 bg-sidebar/50">
          <div className="rounded-xl border border-border/60 bg-background/50 p-2.5 space-y-1.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                ML Placement Filter
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                :8000 Live
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <span className="size-1.5 rounded-full bg-indigo-500 inline-block" />
                Google Workspace
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                Connected
              </Badge>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1 rounded-lg hover:bg-accent/60 transition-colors" />
          <Separator orientation="vertical" className="h-4 bg-border/60" />
          <BreadcrumbComponent items={breadcrumbItems.items} />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 text-xs text-muted-foreground">
              <Activity className="size-3.5 text-emerald-500" />
              <span>AI Classifier Active</span>
            </div>
            {headerUserNav}
          </div>
        </header>

        <main className="flex flex-1 flex-col p-6 bg-ambient-mesh min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
