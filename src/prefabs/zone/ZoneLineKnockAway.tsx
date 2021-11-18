import Konva from 'konva';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/line_knock_away.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { ChevronConfig, ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 250;

export const ZoneLineKnockAway: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Line knock away"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.LineKnockAway,
                        width: DEFAULT_WIDTH,
                        height: DEFAULT_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineKnockAway, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const OFFSCREEN_X = -1000;
const OFFSCREEN_Y = -1000;

const ARROW_SIZE_FRAC = 0.3;
const ARROW_HEIGHT_FRAC = 3 / 5;
const ARROW_PAD = 0.08;

const LineKnockAwayRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const [pattern, setPattern] = useState<HTMLImageElement>();
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height)),
        [object.color, object.opacity, object.width, object.height],
    );
    const { fill, ...stroke } = style;

    const patternWidth = object.width;
    const patternHeight = object.width / 2;

    const arrow = useMemo(() => {
        const width = patternWidth * ARROW_SIZE_FRAC;
        const height = width * ARROW_HEIGHT_FRAC;

        return {
            ...getArrowStyle(object.color, object.opacity * 3),
            width,
            height,
            y: patternHeight / 2,
            chevronAngle: 40,
            opacity: (object.opacity * 2) / 100,
        } as ChevronConfig;
    }, [object.color, object.opacity, patternWidth, patternHeight]);

    const arrowRef = useRef<Konva.Group>(null);
    useEffect(() => {
        arrowRef.current?.toImage({
            // This seems like a hack. Is there a better way to draw offscreen?
            x: OFFSCREEN_X,
            y: OFFSCREEN_Y,
            width: patternWidth,
            height: patternHeight,
            callback: setPattern,
        });
    }, [patternWidth, patternHeight, object.color, object.opacity, arrowRef]);

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <>
            <ResizeableObjectContainer object={object} transformerProps={{ keepRatio: false }}>
                {(groupProps) => (
                    <Group {...groupProps}>
                        {showHighlight && (
                            <Rect
                                offsetX={highlightOffset / 2}
                                offsetY={highlightOffset / 2}
                                width={highlightWidth}
                                height={highlightHeight}
                                {...SELECTED_PROPS}
                            />
                        )}
                        <Rect
                            width={object.width}
                            height={object.height}
                            fillPatternImage={pattern}
                            fillPatternOffsetX={patternWidth / 2}
                            fillPatternOffsetY={patternHeight / 2}
                            fillPatternX={object.width / 2}
                            fillPatternY={object.height / 2}
                            fillPatternRepeat="repeat-y"
                            {...stroke}
                        />
                    </Group>
                )}
            </ResizeableObjectContainer>
            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <Rect width={patternWidth} height={patternHeight} fill={fill} />
                <ChevronTail x={patternWidth * ARROW_PAD} rotation={-90} {...arrow} />
                <ChevronTail x={patternWidth * (1 - ARROW_PAD)} rotation={90} {...arrow} />
            </Group>
        </>
    );
};

registerRenderer<RectangleZone>(ObjectType.LineKnockAway, LayerName.Ground, LineKnockAwayRenderer);

const LineKnockAwayDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, isNested }) => {
    return <DetailsItem icon={icon} name="Line knock away" object={object} color={object.color} isNested={isNested} />;
};

registerListComponent<RectangleZone>(ObjectType.LineKnockAway, LineKnockAwayDetails);

// Properties control registered in ZoneRectangle.tsx
