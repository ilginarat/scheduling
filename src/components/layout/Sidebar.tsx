import Link from "next/link";
import { Home, LayoutGrid, Bell, Plus } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-8">
            {/* Home Icon */}
            <Link href="/" className="text-gray-500 hover:text-gray-900">
                <Home size={24} />
            </Link>

            {/* Machine Scheduling Icon */}
            <Link href="/scheduling" className="text-blue-600">
                <LayoutGrid size={24} />
            </Link>

            {/* Notifications Icon */}
            <Link
                href="/notifications"
                className="text-gray-500 hover:text-gray-900"
            >
                <Bell size={24} />
            </Link>

            {/* Add New Icon */}
            <Link href="/new" className="text-gray-500 hover:text-gray-900">
                <Plus size={24} />
            </Link>
        </aside>
    );
}
