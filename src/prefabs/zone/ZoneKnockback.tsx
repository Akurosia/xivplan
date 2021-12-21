import React, { useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/knockback.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_RADIUS = 150;

export const ZoneKnockback: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Circular knockback"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Knockback,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Knockback, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Knockback,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const CHEVRON_ANGLES = Array.from({ length: 16 }).map((_, i) => (i * 360) / 16);

interface KnockbackRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
}

const KnockbackRenderer: React.FC<KnockbackRendererProps> = ({ object, radius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const ring = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);

    const { cx, cw, ch, ca } = useMemo(() => {
        return {
            cx: radius,
            cw: radius * 0.24,
            ch: radius * 0.12,
            ca: 40,
        };
    }, [radius]);

    return (
        <>
            {showHighlight && <Circle radius={radius + ring.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Circle radius={radius} {...ring} strokeEnabled={false} opacity={0.5} />

            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={ring.stroke} />}

            {CHEVRON_ANGLES.map((r, i) => (
                <Group key={i} rotation={r} listening={false}>
                    {[0.25, 0.52, 0.85].map((s, j) => (
                        <ChevronTail
                            key={j}
                            offsetY={cx * s}
                            chevronAngle={ca}
                            width={cw * s}
                            height={ch * s}
                            opacity={object.opacity / 100}
                            {...arrow}
                        />
                    ))}
                </Group>
            ))}
        </>
    );
};

const KnockbackContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <KnockbackRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Knockback, LayerName.Ground, KnockbackContainer);

const KnockbackDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, isNested }) => {
    return <DetailsItem icon={icon} name="Knockback" object={object} color={object.color} isNested={isNested} />;
};

registerListComponent<CircleZone>(ObjectType.Knockback, KnockbackDetails);

// Properties control registered in ZoneCircle.tsx
