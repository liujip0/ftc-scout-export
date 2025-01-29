import { useMediaQuery } from '@/hooks/use-media-query';
import React, { useState } from 'react';

export function Combobox() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );
}
