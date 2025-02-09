import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import React, { FC, ReactNode } from 'react';

export interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  tabs?: string[];
  children?: ReactNode;
}

export const Tabs: FC<TabsProps> = React.forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const { tabs, className, children, ...rest } = props;
  return (
    <div>
      {tabs && (
        <div className="tabs-header flex border-b">
          {tabs.map((tab, i) => (
            <button key={i} className="px-4 py-2 focus:outline-none">
              {tab}
            </button>
          ))}
        </div>
      )}
      <TabsPrimitive.Root ref={ref} className={cn(className)} {...rest}>
        {children}
      </TabsPrimitive.Root>
    </div>
  );
});

Tabs.displayName = 'Tabs';

export { TabsList, TabsTrigger, TabsContent } from './atoms/tabs';
export default Tabs; 