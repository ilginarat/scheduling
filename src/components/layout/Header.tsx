import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="h-12 bg-white border-b border-gray-200">
            <div className="h-full px-4 flex items-center">
                <div className="w-28">
                    <Image
                        src="/tvinn-logo.svg"
                        alt="TVINN Logo"
                        width={80}
                        height={32}
                        priority
                    />
                </div>
            </div>
        </header>
    );
}
