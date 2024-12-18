import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { Virtualizer, useStaticVirtualizerMeasure } from '@fluentui/react-virtualizer';
import React, { useMemo } from 'react';
import { StatusIcon } from '../prefabs/StatusIcon';

const ICON_SIZE = 32;
const ICON_MARGIN = 8;
const ITEM_SIZE = ICON_SIZE + ICON_MARGIN;

export interface StatusItemIcon {
    id: number;
    url: string;
}

export interface StatusItem {
    name: string;
    icon: StatusItemIcon;
    maxStacks: number;
}

export interface StatusGridProps {
    className?: string;
    columns: number;
    items: StatusItem[];
}

export const StatusGrid: React.FC<StatusGridProps> = ({ className, columns, items }) => {
    const classes = useStyles();

    const rows = useMemo(() => {
        return chunked(items, columns);
    }, [items, columns]);

    const { virtualizerLength, bufferItems, bufferSize, scrollRef, containerSizeRef } = useStaticVirtualizerMeasure({
        defaultItemSize: ITEM_SIZE,
    });

    return (
        <div className={mergeClasses(classes.container, className)} role="list" ref={scrollRef}>
            <Virtualizer
                numItems={rows.length}
                virtualizerLength={virtualizerLength}
                bufferItems={bufferItems}
                bufferSize={bufferSize}
                itemSize={ITEM_SIZE}
                containerSizeRef={containerSizeRef}
            >
                {(index) => {
                    const row = rows[index];

                    return (
                        <div key={`row-${index}`} className={classes.row}>
                            {row?.map((item, i) => {
                                const itemIndex = columns * index + i;

                                return (
                                    <div
                                        key={`item-${itemIndex}`}
                                        role="listitem"
                                        aria-posinset={itemIndex}
                                        aria-setsize={items.length}
                                        className={classes.item}
                                    >
                                        <StatusIcon
                                            name={item.name}
                                            icon={item.icon.url}
                                            iconId={item.icon.id}
                                            maxStacks={item.maxStacks}
                                            scale={2}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            </Virtualizer>
        </div>
    );
};

function chunked<T>(items: T[], chunkSize: number): T[][] {
    chunkSize = Math.max(1, chunkSize);

    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push(items.slice(i, i + chunkSize));
    }

    return chunks;
}

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexFlow: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
        width: '100%',
        height: '100%',
    },
    row: {
        display: 'flex',
        gap: `${ICON_MARGIN}px`,
        marginBottom: `${ICON_MARGIN}px`,
    },
    item: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${ICON_SIZE}px`,
        height: `${ICON_SIZE}px`,
    },
});
