'use client';

import { useState } from 'react';
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { communityStoriesCollectionRef } from '@/firebase/firestore/references';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';

interface CommunityStory {
  id: string;
  title: string;
  coverImageUrl: string;
  pdfUrl: string;
  language: 'es' | 'en' | 'fr' | 'it' | 'de' | 'pt';
}

const languageCategories = [
  { lang: 'all', emoji: '🌍', label: 'all' },
  { lang: 'es', emoji: '🇪🇸', label: 'es' },
  { lang: 'en', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', label: 'en' },
  { lang: 'fr', emoji: '🇫🇷', label: 'fr' },
  { lang: 'it', emoji: '🇮🇹', label: 'it' },
  { lang: 'de', emoji: '🇩🇪', label: 'de' },
  { lang: 'pt', emoji: '🇵🇹', label: 'pt' },
];


export default function ComunidadPage() {
  const t = useTranslations('ComunidadPage');
  const firestore = useFirestore();
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | CommunityStory['language']>('all');
  
  const communityStoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return communityStoriesCollectionRef(firestore);
  }, [firestore]);

  const { data: stories, isLoading, error } = useCollection<CommunityStory>(communityStoriesQuery);

  const filteredStories = selectedLanguage === 'all'
    ? stories
    : stories?.filter(story => story.language === selectedLanguage);

  const selectedLanguageLabel = t(`languageCategories.${selectedLanguage}`);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-gray-800">
          {t('pageTitle')}
        </h1>
        <p className="max-w-3xl mx-auto text-primary mt-4 font-body">
          {t('pageDescription')}
        </p>
      </div>

       <div className="mb-8 flex justify-center">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="default" className="min-w-[150px]">
                    {t('languageDropdownTrigger', { selectedLanguageLabel })}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {languageCategories.map(({ lang, emoji, label }) => (
                <DropdownMenuItem
                    key={lang}
                    onSelect={() => setSelectedLanguage(lang as 'all' | CommunityStory['language'])}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span> {t(`languageCategories.${label}`)}
                  </span>
                </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-auto w-full aspect-[2/3] rounded-lg" />
                    <Skeleton className="h-6 w-full mt-2" />
                     <Skeleton className="h-10 w-full mt-4" />
                </div>
            ))}
        </div>
      )}

      {error && (
         <Alert variant="destructive">
            <AlertTitle>{t('errorTitle')}</AlertTitle>
            <AlertDescription>
                {t('errorDescription')}
            </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredStories && filteredStories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredStories.map((story) => (
            <Card key={story.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardContent className="p-0">
                <Link href={`/comunidad/leer/${story.id}`}>
                  <Image
                    src={story.coverImageUrl}
                    alt={story.title}
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover aspect-[2/3]"
                  />
                </Link>
              </CardContent>
              <CardHeader>
                <CardTitle className="text-lg text-center">{story.title}</CardTitle>
              </CardHeader>
              <CardFooter className="mt-auto p-4">
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={`/comunidad/leer/${story.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('readStoryButton')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !error && (!filteredStories || filteredStories.length === 0) && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-800">
                {t('noStoriesTitle')}
            </h2>
            <p className="mt-1 text-md text-muted-foreground">
                {t('noStoriesDescription')}
            </p>
        </div>
      )}
    </div>
  );
}