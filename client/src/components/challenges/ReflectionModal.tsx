import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reflection: string) => void;
  isSubmitting: boolean;
}

export function ReflectionModal({ isOpen, onClose, onSubmit, isSubmitting }: ReflectionModalProps) {
  const [reflection, setReflection] = useState("");

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit(reflection.trim());
      setReflection("");
    }
  };

  const handleClose = () => {
    setReflection("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="reflection-modal max-w-lg">
        <DialogHeader>
          <DialogTitle className="challenge-header text-xl">
            What came up for you?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="challenge-body text-sm text-muted-foreground">
            Did anything feel uncomfortable—but honest?
          </p>
          
          <Textarea
            className="challenge-input min-h-[120px] resize-none text-white placeholder:text-gray-400"
            placeholder="Share your thoughts and feelings about this challenge..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            disabled={isSubmitting}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => !reflection && (e.target.placeholder = 'Share your thoughts and feelings about this challenge...')}
          />
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="button-primary"
              onClick={handleSubmit}
              disabled={!reflection.trim() || isSubmitting}
            >
              {isSubmitting ? "Completing..." : "Complete Challenge"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}