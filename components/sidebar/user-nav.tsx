"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogoutButton } from "../ui/logout-button";
import { authService } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, User } from "lucide-react";

export function UserNav() {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: authService.getSession,
  });

  const user = session?.user;
  const email = user?.email || '';
  const fullName = user?.user_metadata?.full_name || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || '';
  const initials = email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0 overflow-hidden"
        >
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold text-xs">
              { initials }
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 shadow-xl border-border/70 backdrop-blur-xl bg-popover/95 rounded-2xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold">
              {initials}
            </div>
            <div className="flex flex-col space-y-0.5 overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground flex items-center gap-1.5">
                {fullName}
                <ShieldCheck className="size-3.5 text-indigo-500 shrink-0" />
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {email || 'candidate@domain.com'}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1.5 bg-border/50" />
        <div className="px-2 py-1 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Google Workspace Session</span>
          <span className="text-emerald-500 font-medium">Connected</span>
        </div>
        <DropdownMenuSeparator className="my-1.5 bg-border/50" />
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl cursor-pointer p-0">
          <LogoutButton showIcon className="justify-start w-full px-2 py-1.5 text-xs font-medium" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
