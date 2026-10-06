"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// Global modal scroll lock counter & original style cache
let activeModalsCount = 0;
let originalHtmlOverflow = "";
let originalBodyOverflow = "";
let originalHtmlOverscroll = "";
let originalBodyOverscroll = "";

function lockBackgroundScroll() {
  if (typeof document === "undefined") return;
  if (activeModalsCount === 0) {
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    originalBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
  }
  activeModalsCount++;
}

function unlockBackgroundScroll() {
  if (typeof document === "undefined") return;
  activeModalsCount = Math.max(0, activeModalsCount - 1);
  if (activeModalsCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
    document.body.style.overscrollBehavior = originalBodyOverscroll;
  }
}

function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: DialogPrimitive.Root.Props) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen || false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  React.useEffect(() => {
    if (isOpen) {
      lockBackgroundScroll();
      return () => {
        unlockBackgroundScroll();
      };
    }
  }, [isOpen]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, details?: unknown) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, details as never);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/60 backdrop-blur-xs duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 touch-none overscroll-none select-none",
        className
      )}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const isCustomMaxW = typeof className === "string" && className.includes("max-w-");

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={
          typeof className === "function"
            ? className
            : cn(
                "z-50 grid gap-4 bg-popover text-sm text-popover-foreground outline-none overscroll-contain overflow-y-auto duration-200",
                // Mobile: Modern Bottom Sheet (ensures title/amount/close are never pushed offscreen)
                "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:rounded-t-3xl max-sm:p-4 max-sm:pb-[max(env(safe-area-inset-bottom,0px),1.25rem)] max-sm:max-h-[92dvh] max-sm:border-t max-sm:border-border max-sm:shadow-2xl",
                // Desktop: Centered Dialog
                "sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:rounded-2xl sm:p-6 sm:max-h-[88dvh] sm:border sm:border-border sm:shadow-2xl sm:ring-1 sm:ring-foreground/10",
                // Animations
                "data-open:animate-in data-open:fade-in-0 max-sm:data-open:slide-in-from-bottom sm:data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 max-sm:data-closed:slide-out-to-bottom sm:data-closed:zoom-out-95",
                !isCustomMaxW && "sm:max-w-lg",
                className
              )
        }
        {...props}
      >
        <div className="sm:hidden w-12 h-1.5 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1 shrink-0" aria-hidden="true" />
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 cursor-pointer rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground size-8 p-0 flex items-center justify-center transition-colors"
                size="icon-sm"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
