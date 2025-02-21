import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4">
            <div className="flex items-center space-x-8">
                {/* Logo */}
                <div className="w-32">
                    <Image
                        src="/tvinn-logo.svg"
                        alt="TVINN Logo"
                        width={100}
                        height={40}
                        priority
                    />
                </div>

                {/* Navigation Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-gray-500">
                    <Link href="/" className="hover:text-gray-700">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/materials" className="hover:text-gray-700">
                        My Materials
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900">Machine Scheduling</span>
                </nav>
            </div>
        </header>
    );
}
