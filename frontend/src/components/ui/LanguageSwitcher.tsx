'use client';

import React from 'react';
import { Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/node_modules/react-i18next';
import { useAppStore } from '@/store/appStore';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { setLocale } = useAppStore();

  const changeLanguage = (lng: 'en' | 'fr') => {
    i18n.changeLanguage(lng);
    setLocale(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}