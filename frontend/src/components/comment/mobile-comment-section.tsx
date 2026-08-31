import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';

const SNAP_POINTS = [0.65, 0.95];

type MobileCommentSectionProps = {
  children: React.ReactNode;
};

export default function MobileCommentSection({
  children,
}: MobileCommentSectionProps) {
  return (
    <Drawer snapPoints={SNAP_POINTS} activeSnapPoint={SNAP_POINTS[0]}>
      <DrawerTrigger>
        <div>
          <h2>Comments</h2>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Comments</DrawerTitle>
        </DrawerHeader>
        <div>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
