import React, { PropsWithChildren, useState } from 'react';
import { SceneSelection, SelectionContext } from './SelectionContext';

export const SelectionProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<SceneSelection>(new Set());

    return <SelectionContext.Provider value={state}>{children}</SelectionContext.Provider>;
};
