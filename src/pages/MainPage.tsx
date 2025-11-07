import InfiniteScroll from "react-infinite-scroll-component";
import HeroCard from "../components/HeroCard";
import { HeroCardSkeleton } from "../components/HeroCardSkeleton";
import { HeroDetailsModal } from "../components/HeroDetailsModal";
import { useHeroesList } from "../queries/useHeroesQuery";
import { useHeroModal } from "../hooks/useHeroModal";
import { Button } from "~/components/ui/button";

/**
 * Main page component for displaying a scrollable list of Star Wars heroes.
 * Implements infinite scroll functionality to load heroes as the user scrolls.
 * Opens a modal with hero details graph when a hero card is clicked.
 */
export const MainPage = () => {
  const { heroes, loadMoreHeroes, hasNextPage, isLoading, isFetching, isError, error } = useHeroesList();
  const { selectedHeroId, isModalOpen, handleOpenModal, handleCloseModal } =
    useHeroModal();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background min-h-screen max-w-[1400px] mx-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <HeroCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-destructive">Error loading heroes</h2>
          <p className="text-muted-foreground">
            {error?.message || "Failed to load Star Wars characters. Please check your connection and try again."}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-foreground mb-6 text-center p-4">Star Wars Characters</h1>
      <div className="max-w-[1400px] mx-auto p-6">
        <InfiniteScroll
          dataLength={heroes.length}
          next={loadMoreHeroes}
          hasMore={hasNextPage}
          loader={null}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
        >
          {heroes.map((hero) => (
            <div key={hero.url} onClick={() => handleOpenModal(hero.id)} className="w-full">
              <HeroCard {...hero} />
            </div>
          ))}
          {isFetching && hasNextPage && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`fetching-skeleton-${index}`} className="w-full">
                  <HeroCardSkeleton />
                </div>
              ))}
            </>
          )}
        </InfiniteScroll>
      </div>
      <HeroDetailsModal
        isOpen={isModalOpen}
        heroId={selectedHeroId}
        onClose={handleCloseModal}
      />
    </div>
  );
};

