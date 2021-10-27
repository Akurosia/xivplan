import Konva from 'konva';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/line_knockback.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useIsGroupSelected } from '../../SelectionProvider';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_SIZE = 150;

export const ZoneLineKnockback: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Line knockback"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.LineKnockback,
                        width: DEFAULT_SIZE,
                        height: DEFAULT_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineKnockback, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const OFFSCREEN_X = -1000;
const OFFSCREEN_Y = -1000;

const PATTERN_W = 50;
const PATTERN_H = 50;
const ARROW_W = 25;
const ARROW_H = 15;

const LineKnockbackRenderer: React.FC<RendererProps<RectangleZone>> = ({ object, index }) => {
    const isSelected = useIsGroupSelected(index);
    const [pattern, setPattern] = useState<HTMLImageElement>();
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height)),
        [object.color, object.opacity, object.width, object.height],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);
    const { fill, ...stroke } = style;

    const arrowRef = useRef<Konva.Group>(null);
    useEffect(() => {
        arrowRef.current?.toImage({
            // This seems like a hack. Is there a better way to draw offscreen?
            x: OFFSCREEN_X,
            y: OFFSCREEN_Y,
            width: PATTERN_W,
            height: PATTERN_H,
            callback: setPattern,
        });
    }, [fill, arrow, object.opacity, arrowRef]);

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <>
            <ResizeableObjectContainer object={object} index={index}>
                {(groupProps) => (
                    <Group {...groupProps}>
                        {isSelected && (
                            <Rect
                                offsetX={highlightOffset / 2}
                                offsetY={highlightOffset / 2}
                                width={highlightWidth}
                                height={highlightHeight}
                                rotation={object.rotation}
                                {...SELECTED_PROPS}
                            />
                        )}
                        <Rect
                            width={object.width}
                            height={object.height}
                            rotation={object.rotation}
                            fillPatternImage={pattern}
                            fillPatternOffsetX={PATTERN_W / 2}
                            fillPatternOffsetY={PATTERN_H / 2}
                            fillPatternX={object.width / 2}
                            fillPatternY={object.height / 2}
                            fillPatternRepeat="repeat"
                            {...stroke}
                        />
                    </Group>
                )}
            </ResizeableObjectContainer>

            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <Rect width={PATTERN_W} height={PATTERN_H} fill={fill} />
                <ChevronTail
                    width={ARROW_W}
                    height={ARROW_H}
                    chevronAngle={40}
                    x={PATTERN_W / 2}
                    y={PATTERN_H / 2 + ARROW_H}
                    rotation={180}
                    opacity={(object.opacity * 2) / 100}
                    {...arrow}
                />
            </Group>
        </>
    );
};

registerRenderer<RectangleZone>(ObjectType.LineKnockback, LayerName.Ground, LineKnockbackRenderer);

const LineKnockbackDetails: React.FC<ListComponentProps<RectangleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Line knockback" index={index} />;
};

registerListComponent<RectangleZone>(ObjectType.LineKnockback, LineKnockbackDetails);

// Properties control registered in ZoneRectangle.tsx
