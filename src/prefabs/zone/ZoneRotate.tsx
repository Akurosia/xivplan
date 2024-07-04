import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { RefObject, useMemo, useRef } from 'react';
import { Circle, Group, Path } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import counterClockwise from '../../assets/zone/rotate_ccw.png';
import clockwise from '../../assets/zone/rotate_cw.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { CENTER_DOT_RADIUS, SELECTED_PROPS } from '../../render/SceneTheme';
import { LayerName } from '../../render/layers';
import { CircleZone, ObjectType } from '../../scene';
import { useKonvaCache } from '../../useKonvaCache';
import { usePanelDrag } from '../../usePanelDrag';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useShowHighlight } from '../highlight';
import { getArrowStyle, getShadowColor, getZoneStyle } from './style';

const DEFAULT_RADIUS = 25;
const DEFAULT_OPACITY = 50;
const CLOCKWISE_COLOR = '#fc972b';
const COUNTER_CLOCKWISE_COLOR = '#0066ff';

export const ZoneRotateClockwise: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Rotating clockwise"
            icon={clockwise}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RotateCW,
                        color: CLOCKWISE_COLOR,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

export const ZoneRotateCounterClockwise: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Rotating counter-clockwise"
            icon={counterClockwise}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RotateCCW,
                        color: COUNTER_CLOCKWISE_COLOR,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.RotateCW,
            color: CLOCKWISE_COLOR,
            opacity: DEFAULT_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const Arrow: React.FC<ShapeConfig> = (props) => {
    return <Path data="M0-4-7 3-6 4-3 4 0 1 3 4 6 4 7 3Z" lineJoin="round" {...props} />;
};

const ARROW_SCALE = 1 / 24;
const ARROW_ANGLES = [45, 90, 135, 225, 270, 315];

interface RotateRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
    groupRef: RefObject<Konva.Group>;
}

const RotateRenderer: React.FC<RotateRendererProps> = ({ object, radius, groupRef, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const isClockwise = object.type === ObjectType.RotateCW;

    const style = useMemo(
        () => getZoneStyle(object.color, Math.max(50, object.opacity), radius * 2, object.hollow),
        [object.color, object.opacity, object.hollow, radius],
    );

    const arrow = useMemo(() => {
        const scale = radius * ARROW_SCALE;

        return {
            ...getArrowStyle(object.color, 100),
            offsetX: -1 / ARROW_SCALE,
            scaleX: scale,
            scaleY: scale * (isClockwise ? -1 : 1),
            stroke: getShadowColor(object.color),
            strokeWidth: radius / 15,
        } as ShapeConfig;
    }, [object.color, radius, isClockwise]);

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [object, radius, arrow, isDragging]);

    return (
        <>
            {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Group opacity={(object.opacity * 2) / 100} ref={groupRef}>
                <Circle radius={radius} {...style} />

                {ARROW_ANGLES.map((r, i) => (
                    <Arrow key={i} rotation={r} fillAfterStrokeEnabled strokeScaleEnabled={false} {...arrow} />
                ))}

                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
            </Group>
        </>
    );
};

const RotateContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer object={object} onTransformEnd={() => groupRef.current?.clearCache()}>
            {(props) => <RotateRenderer object={object} {...props} groupRef={groupRef} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], LayerName.Ground, RotateContainer);

const RotateDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, isNested }) => {
    const name = object.type === ObjectType.RotateCW ? 'Clockwise' : 'Counter-clockwise';
    const icon = object.type === ObjectType.RotateCW ? clockwise : counterClockwise;

    return <DetailsItem icon={icon} name={name} object={object} color={object.color} isNested={isNested} />;
};

registerListComponent<CircleZone>([ObjectType.RotateCW, ObjectType.RotateCCW], RotateDetails);
