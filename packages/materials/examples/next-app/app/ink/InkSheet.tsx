'use client';

import * as React from 'react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@starlight/materials/primitives';

// The client island on the ink route: a sheet needs state, so the trigger and the sheet
// hydrate; the page around them stays a Server Component.
export function InkSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button material="ink">Open the sheet</Button>
      </SheetTrigger>
      <SheetContent side="right" material="ink">
        <SheetHeader>
          <SheetTitle>Ink sheet</SheetTitle>
          <SheetDescription>
            100dvh tall, so the phone URL bar never hides this footer. Padded on the edge it touches by the safe-area inset.
            Scrolls on its own axis only.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 px-6 text-body-sm opacity-80">
          <p>Entry and exit are opacity and transform. Under reduced motion both are cuts.</p>
          <p>The close control is a 44px target and carries the same focus ring as every other primitive.</p>
        </div>
        <SheetFooter>
          <Button material="paper">Confirm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
