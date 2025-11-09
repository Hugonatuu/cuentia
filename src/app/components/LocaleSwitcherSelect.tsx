'use client';

import { useParams } from 'next/navigation';
import { Locale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

type Props = {
  defaultValue: string;
  label: string;
  options: { value: string; label: string }[];
};

export const  LocaleSwitcherSelect = ({
  defaultValue,
  label,
  options,
}: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onLocaleChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale }
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-3"
          disabled={isPending}
          aria-label={label}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium uppercase">{defaultValue}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end" forceMount>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onLocaleChange(option.value as Locale)}
            className="cursor-pointer"
            disabled={option.value === defaultValue || isPending}
          >
            <span
              className={option.value === defaultValue ? 'font-bold' : ''}
            >
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}