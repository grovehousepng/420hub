'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { pushEvent } from '@/lib/gtm';

interface TrackedLinkProps {
    href: string;
    className?: string;
    children: ReactNode;
    eventName: string;
    eventData: Record<string, any>;
}

export default function TrackedLink({ href, className, children, eventName, eventData }: TrackedLinkProps) {
    const handleClick = () => {
        pushEvent(eventName, eventData);
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    );
}
