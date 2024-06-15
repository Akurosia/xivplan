import { Field } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged2 } from '../../prefabs/useSpinChanged';
import { TowerZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_COUNT = 1;
const MAX_COUNT = 4;

export const TowerCountControl: React.FC<PropertiesControlProps<TowerZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const count = useMemo(() => commonValue(objects, (obj) => obj.count), [objects]);

    const onCountChanged = useSpinChanged2((count: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, count })) }),
    );

    const soakSuffix = count === 1 ? ' player' : ' players';

    return (
        <Field label="Soak count">
            <SpinButtonUnits
                value={count}
                onChange={onCountChanged}
                min={MIN_COUNT}
                max={MAX_COUNT}
                step={1}
                suffix={soakSuffix}
            />
        </Field>
    );
};
