
'use client';

import { useState } from 'react';
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

// Configure the PDF worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

interface Story {
  id: string;
  title: string;
  pdfUrl: string;
}

export default function StoryViewerPage() {
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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  const goToPreviousPage = () => {
    const newPage = currentPage === 2 ? 1 : currentPage - 2;
    if (newPage >= 1) {
      setCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (!numPages) return;
    const newPage = currentPage === 1 ? 2 : currentPage + 2;
    if (newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = numPages ? (currentPage === 1 ? numPages > 1 : currentPage < numPages - 1) : false;

  const getPageNumbersToRender = () => {
    if (currentPage === 1) {
      return [1];
    }
    const pageNumbers = [currentPage];
    if (numPages && currentPage + 1 <= numPages) {
      pageNumbers.push(currentPage + 1);
    }
    return pageNumbers;
  };

  if (isLoading) {
    return (
        <div className="container mx-auto py-12 flex flex-col items-center gap-8">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
                <Skeleton className="h-[70vh] w-[25vw]"/>
                <Skeleton className="h-[70vh] w-[25vw]"/>
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
                <AlertDescription>No se pudo cargar el cuento. Por favor, inténtalo de nuevo.</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!story) {
     return (
        <div className="container mx-auto py-12">
            <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Cuento no encontrado</AlertTitle>
                <AlertDescription>No hemos podido encontrar el cuento que buscas.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl text-gray-800">{story.title}</h1>
        <Button asChild variant="outline" className="mt-4">
            <a href={story.pdfUrl} download>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </a>
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="relative flex items-center justify-center">
          <Document
            file={story.pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={console.error}
            options={options}
            loading={<Skeleton className="h-[80vh] w-[50vw]"/>}
            className="flex justify-center items-start gap-2"
          >
            {getPageNumbersToRender().map(pageNumber => (
                <div key={pageNumber} className="shadow-lg">
                    <Page 
                        pageNumber={pageNumber} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                        width={currentPage === 1 ? 500 : 400}
                    />
                </div>
            ))}
          </Document>
        </div>
      </div>
      
      {numPages && numPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button onClick={goToPreviousPage} disabled={!canGoPrevious} variant="outline" size="icon">
            <ChevronLeft />
          </Button>
          <p className="text-lg font-medium">
            Página {currentPage}{currentPage > 1 && numPages > currentPage + 1 ? ` - ${currentPage + 1}` : ''} de {numPages}
          </p>
          <Button onClick={goToNextPage} disabled={!canGoNext} variant="outline" size="icon">
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
