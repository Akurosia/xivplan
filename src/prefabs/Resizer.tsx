import Konva from 'konva';
import { Box } from 'konva/lib/shapes/Transformer';
import React, { RefObject, useCallback, useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { ActivePortal } from '../render/Portals';
import { ResizeableObject, SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsOnlySelected } from '../SelectionProvider';
import { clamp } from '../util';

const DEFAULT_MIN_SIZE = 20;

const SNAP_ANGLE = 15;
const ROTATION_SNAPS = Array.from({ length: 360 / SNAP_ANGLE }).map((_, i) => i * SNAP_ANGLE);

const MIN_ANCHOR_SIZE = 6;
const MAX_ANCHOR_SIZE = 10;

export interface ResizerProps {
    index: number;
    object: ResizeableObject;
    nodeRef: RefObject<Konva.Group>;
    dragging?: boolean;
    minWidth?: number;
    minHeight?: number;
    children: (onTransformEnd: (evt: Konva.KonvaEventObject<Event>) => void) => React.ReactElement;
}

export const Resizer: React.VFC<ResizerProps> = ({
    index,
    object,
    nodeRef,
    dragging,
    minWidth,
    minHeight,
    children,
}) => {
    const [scene, dispatch] = useScene();
    const isSelected = useIsOnlySelected(index);
    const trRef = useRef<Konva.Transformer>(null);

    const minWidthRequired = minWidth ?? DEFAULT_MIN_SIZE;
    const minHeightRequired = minHeight ?? DEFAULT_MIN_SIZE;

    const anchorSize = clamp((object.width + object.height) / 10, MIN_ANCHOR_SIZE, MAX_ANCHOR_SIZE);

    useEffect(() => {
        if (isSelected && trRef.current && nodeRef.current) {
            trRef.current.nodes([nodeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, nodeRef, trRef]);

    const onTransformEnd = useCallback(() => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }

        const newProps = {
            x: Math.round(object.x + node.x()),
            y: Math.round(object.y - node.y()),
            rotation: Math.round(node.rotation()),
            width: Math.round(Math.max(minWidthRequired, object.width * node.scaleX())),
            height: Math.round(Math.max(minHeightRequired, object.height * node.scaleY())),
        };

        node.scaleX(1);
        node.scaleY(1);
        node.x(0);
        node.y(0);
        node.clearCache();

        dispatch({ type: 'update', index, value: { ...object, ...newProps } as SceneObject });
    }, [index, object, minWidthRequired, minHeightRequired, scene, dispatch, nodeRef]);

    const boundBoxFunc = useCallback(
        (oldBox: Box, newBox: Box) => {
            if (newBox.width < minWidthRequired || newBox.height < minHeightRequired) {
                return oldBox;
            }
            return newBox;
        },
        [minWidthRequired, minHeightRequired],
    );

    return (
        <>
            {children(onTransformEnd)}
            {isSelected && (
                <ActivePortal isActive>
                    <Transformer
                        ref={trRef}
                        visible={!dragging}
                        centeredScaling
                        rotationSnaps={ROTATION_SNAPS}
                        rotationSnapTolerance={2}
                        boundBoxFunc={boundBoxFunc}
                        anchorSize={anchorSize}
                    />
                </ActivePortal>
            )}
        </>
    );
};
