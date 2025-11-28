'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { storyDocRef } from '@/firebase/firestore/references';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface Story {
  id: string;
  title: string;
  pdfUrl?: string;
  pages?: string[];
}

export default function StoryViewerPage() {
  const t = useTranslations('StoryViewerPage');
  const { storyId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const currentStoryRef = useMemoFirebase(() => {
    if (!firestore || !user || !storyId) return null;
    const sId = Array.isArray(storyId) ? storyId[0] : storyId;
    return storyDocRef(firestore, user.uid, sId);
  }, [firestore, user, storyId]);

  const { data: story, isLoading, error } = useDoc<Story>(currentStoryRef);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!story) return;

    if (story.pdfUrl) {
      setPdfFile(story.pdfUrl);
    }
  }, [story]);

  useEffect(() => {
    if(!story?.pdfUrl) return;

    function updateSize() {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const isDoublePage = currentPage > 1 && numPages && currentPage < numPages;
        // We'll aim for about 90% of container width, capped at a reasonable max.
        const targetWidth = Math.min(containerWidth * 0.9, isDoublePage ? 800 : 500);
        setPageWidth(isDoublePage ? targetWidth / 2 : targetWidth);
      }
    }
    
    window.addEventListener('resize', updateSize);
    updateSize(); // Initial size calculation
    
    return () => window.removeEventListener('resize', updateSize);
  }, [currentPage, numPages, story?.pdfUrl]);


  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  const handlePageChange = (newPage: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50); // Short delay to allow render before fading in
    }, 200); // Duration of the fade-out transition
  };

  const goToPreviousPage = () => {
    if (!canGoPrevious) return;
    const newPage = currentPage === 2 ? 1 : currentPage - 2;
    if (newPage >= 1) {
      handlePageChange(newPage);
    }
  };

  const goToNextPage = () => {
    if (!canGoNext) return;
    if (!numPages) return;
    const newPage = currentPage === 1 ? 2 : currentPage + 2;
    if (newPage <= numPages) {
      handlePageChange(newPage);
    }
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = numPages ? (currentPage === 1 ? numPages > 1 : currentPage < numPages - 1) : false;

  const getPageNumbersToRender = () => {
    if (!numPages) return [];
    if (currentPage === 1) {
      return [1];
    }
    const pageNumbers = [currentPage];
    if (currentPage + 1 <= numPages) {
      pageNumbers.push(currentPage + 1);
    }
    return pageNumbers;
  };
  
  if (isLoading) {
    return (
        <div className="container mx-auto py-12 flex flex-col items-center gap-8">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
                <Skeleton className="h-[70vh] w-full"/>
            </div>
             <Skeleton className="h-12 w-64" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto py-12">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{t('errors.loadError')}</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!story || (!story.pdfUrl && !story.pages)) {
     return (
        <div className="container mx-auto py-12">
            <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>{t('errors.notFound')}</AlertTitle>
                <AlertDescription>{t('errors.notFoundDescription')}</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8" ref={containerRef}>
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl text-gray-800">{story.title}</h1>
        {pdfFile && (
          <Button asChild variant="outline" className="mt-4">
              <a href={pdfFile} download={`${story.title}.pdf`}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('controls.download')}
              </a>
          </Button>
        )}
      </div>

      {story.pdfUrl ? (
          <>
            <div className="flex justify-center">
              <div 
                className={cn(
                  "relative flex items-center justify-center transition-opacity duration-200",
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                )}
              >
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => console.error("Error al cargar el PDF:", error.message)}
                  loading={<Skeleton className="h-[80vh] w-full max-w-[500px]"/>}
                  className="flex justify-center items-start gap-2"
                >
                  {pageWidth > 0 && getPageNumbersToRender().map(pageNumber => (
                      <div key={pageNumber} className="shadow-lg">
                          <Page 
                              pageNumber={pageNumber} 
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              width={pageWidth}
                          />
                      </div>
                  ))}
                </Document>
              </div>
            </div>
            
            {numPages && numPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button onClick={goToPreviousPage} disabled={!canGoPrevious || isTransitioning} variant="outline" size="icon">
                  <ChevronLeft />
                  <span className="sr-only">{t('controls.previous')}</span>
                </Button>
                <p className="text-lg font-medium w-28 text-center">
                  {currentPage > 1 && numPages > currentPage + 1 
                    ? t('controls.pageRange', { currentPage, nextPage: currentPage + 1 })
                    : t('controls.page', { currentPage })
                  }
                </p>
                <Button onClick={goToNextPage} disabled={!canGoNext || isTransitioning} variant="outline" size="icon">
                  <ChevronRight />
                  <span className="sr-only">{t('controls.next')}</span>
                </Button>
              </div>
            )}
          </>
      ) : (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
                {story.pages?.map((pageText, index) => (
                    <div key={index} className="prose lg:prose-xl text-justify">
                        <p className='font-serif text-lg leading-relaxed'>{pageText}</p>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}
