import React, { useMemo } from 'react';
import { Circle, Ring } from 'react-konva';
import icon from '../../assets/zone/donut.png';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { DonutZone, ObjectType } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getZoneStyle } from './style';

const NAME = 'Donut';

const DEFAULT_OUTER_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 50;

export const ZoneDonut: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Donut,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<DonutZone>(ObjectType.Donut, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Donut,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            innerRadius: DEFAULT_INNER_RADIUS,
            radius: DEFAULT_OUTER_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface DonutRendererProps extends RendererProps<DonutZone> {
    radius: number;
    innerRadius: number;
    isDragging?: boolean;
}

const DonutRenderer: React.FC<DonutRendererProps> = ({ object, radius, innerRadius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );

    return (
        <>
            {showHighlight && (
                <Ring
                    innerRadius={innerRadius - style.strokeWidth / 2}
                    outerRadius={radius + style.strokeWidth / 2}
                    {...SELECTED_PROPS}
                />
            )}
            <Ring innerRadius={innerRadius} outerRadius={radius} {...style} />

            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
        </>
    );
};

const DonutContainer: React.FC<RendererProps<DonutZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object} allowInnerRadius>
            {(props) => <DonutRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<DonutZone>(ObjectType.Donut, LayerName.Ground, DonutContainer);

const DonutDetails: React.FC<ListComponentProps<DonutZone>> = ({ object, ...props }) => {
    return <DetailsItem icon={icon} name={NAME} object={object} color={object.color} {...props} />;
};

registerListComponent<DonutZone>(ObjectType.Donut, DonutDetails);
