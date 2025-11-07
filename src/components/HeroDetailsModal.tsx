import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { HeroDetails } from "./HeroDetails";
import { useHeroDetails } from "../queries/useHeroDetailsQuery";

interface HeroDetailsModalProps {
  isOpen: boolean;
  heroId: number | null;
  onClose: () => void;
}

/**
 * Modal component for displaying hero details with graph visualization.
 * Shows a dialog containing the hero details graph when a hero is selected.
 * @param isOpen - Boolean indicating whether the modal is open
 * @param heroId - Unique identifier of the selected hero (null if no hero selected)
 * @param onClose - Callback function to close the modal
 */
export const HeroDetailsModal: React.FC<HeroDetailsModalProps> = ({
  isOpen,
  heroId,
  onClose,
}) => {
  const { heroDetails, isLoading, isError } = useHeroDetails(heroId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[80vw]! sm:max-w-[80vw]! w-full h-[90vh] flex flex-col bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Hero Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View detailed information and connections for the selected Star Wars character.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="text-center space-y-2">
              <h4 className="text-lg text-foreground">Loading hero details...</h4>
              <p className="text-sm text-muted-foreground">Fetching character information</p>
            </div>
          ) : isError ? (
            <div className="text-center space-y-4 max-w-md mx-auto p-4">
              <h4 className="text-lg text-destructive">Failed to load hero</h4>
              <p className="text-sm text-muted-foreground">
                Unable to fetch character information. Please try selecting another hero or check your connection.
              </p>
              {heroId && (
                <p className="text-xs text-muted-foreground">Hero ID: {heroId}</p>
              )}
            </div>
          ) : heroDetails ? (
            <HeroDetails heroDetails={heroDetails} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

