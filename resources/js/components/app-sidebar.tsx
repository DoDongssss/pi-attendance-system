import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Clock,
    FileBarChart2,
    LayoutGrid,
    ScanLine,
    ScrollText,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { usePage } from '@inertiajs/react';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const permissions = auth?.permissions ?? [];
    const can = (permission: string) => permissions.includes(permission);

    const mainNavItems: NavItem[] = [
        // {
        //     title: 'Dashboard',
        //     href: dashboard(),
        //     icon: LayoutGrid,
        // },
        // Staff + Admin
        ...(can('attendance.checkin') || can('attendance.view') ? [{
            title: 'Attendance',
            href: '/attendance',
            icon: Clock,
        }] : []),
        ...(can('attendance.checkin') || can('attendance.view') ? [{
            title: 'Kiosk',
            href: '/attendance/kiosk',
            icon: ScanLine, 
        }] : []),

        // Admin only
        ...(can('pi.view') ? [{
            title: 'Persons of Interest',
            href: '/pi',
            icon: Users,
        }] : []),

        ...(can('attendance.process') ? [{
            title: 'Schedules',
            href: '/schedules',
            icon: CalendarDays,
        }] : []),

        ...(can('attendance.process') ? [{
            title: 'Absence Processing',
            href: '/attendance/process',
            icon: ClipboardList,
        }] : []),

        ...(can('report.view') ? [{
            title: 'Reports',
            href: '/reports',
            icon: FileBarChart2,
        }] : []),

        ...(can('report.view') ? [{
            title: 'Audit Log',
            href: '/audit',
            icon: ScrollText,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}