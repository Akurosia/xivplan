import { Context as KonvaContext } from 'konva/lib/Context';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { PropsWithChildren } from 'react';
import { Ellipse, Group, Image, Rect, Shape } from 'react-konva';
import useImage from 'use-image';
import { useScene } from '../SceneProvider';
import {
    ALIGN_TO_PIXEL,
    getCanvasArenaEllipse,
    getCanvasArenaRect,
    getCanvasCoord,
    getCanvasX,
    getCanvasY,
    useCanvasArenaEllipse,
    useCanvasArenaRect,
} from '../coord';
import {
    ArenaShape,
    CustomRadialGrid,
    CustomRectangularGrid,
    GridType,
    RadialGrid,
    RectangularGrid,
    Scene,
} from '../scene';
import { degtorad } from '../util';
import { useSceneTheme } from './SceneTheme';

export const ArenaRenderer: React.FC = () => {
    return (
        <>
            <BackgroundRenderer />
            <ArenaClip>
                <BackgroundImage />
                <GridRenderer />
            </ArenaClip>
        </>
    );
};

function getArenaClip(scene: Scene): (context: KonvaContext) => void {
    const rect = getCanvasArenaRect(scene);
    const center = getCanvasCoord(scene, { x: 0, y: 0 });

    switch (scene.arena.shape) {
        case ArenaShape.Circle:
            return (ctx) => {
                ctx.beginPath();
                ctx.ellipse(center.x, center.y, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
                ctx.clip();
                ctx.closePath();
            };

        case ArenaShape.Rectangle:
            return (ctx) => {
                ctx.beginPath();
                ctx.rect(rect.x, rect.y, rect.width, rect.height);
                ctx.clip();
                ctx.closePath();
            };
    }
}

const ArenaClip: React.FC<PropsWithChildren> = ({ children }) => {
    const { scene } = useScene();
    const clip = getArenaClip(scene);

    return <Group clipFunc={clip}>{children}</Group>;
};

const BackgroundImage: React.FC = () => {
    const { scene } = useScene();
    const [image] = useImage(scene.arena.backgroundImage ?? '');

    if (!image) {
        return null;
    }

    const opacity = scene.arena.backgroundOpacity ?? 100;
    const position = getCanvasArenaRect(scene);

    return <Image image={image} opacity={opacity / 100} {...position} />;
};

const BackgroundRenderer: React.FC = () => {
    const { scene } = useScene();

    switch (scene.arena.shape) {
        case ArenaShape.Circle:
            return <CircularBackground />;

        case ArenaShape.Rectangle:
            return <RectangularBackground />;
    }
};

const SHADOW: ShapeConfig = {
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffsetY: 4,
    shadowBlur: 6,
};

const CircularBackground: React.FC = () => {
    const position = useCanvasArenaEllipse();
    const theme = useSceneTheme();

    return <Ellipse {...position} {...theme.arena} {...SHADOW} />;
};

const RectangularBackground: React.FC = () => {
    const position = useCanvasArenaRect();
    const theme = useSceneTheme();

    // Align to pixel makes the rectangle one pixel wider than intended.
    position.width -= 1;
    position.height -= 1;

    return <Rect {...position} {...theme.arena} {...SHADOW} {...ALIGN_TO_PIXEL} />;
};

const GridRenderer: React.FC = () => {
    const { scene } = useScene();

    switch (scene.arena.grid.type) {
        case GridType.None:
            return null;

        case GridType.Radial:
            return <RadialGridRenderer grid={scene.arena.grid} />;

        case GridType.Rectangular:
            return <RectangularGridRenderer grid={scene.arena.grid} />;

        case GridType.CustomRectangular:
            return <CustomRectangularGridRenderer grid={scene.arena.grid} />;

        case GridType.CustomRadial:
            return <CustomRadialGridRenderer grid={scene.arena.grid} />;
    }
};

interface GridProps<T> {
    grid: T;
}

function modPositive(x: number, y: number) {
    return ((x % y) + y) % y;
}

function getRingGridDivs(divs: number, radiusX: number, radiusY: number) {
    return Array.from({ length: divs - 1 }, (_, i) => ({
        radiusX: ((i + 1) / divs) * radiusX,
        radiusY: ((i + 1) / divs) * radiusY,
    }));
}

function circlePointAtAngle(t: number, radiusX: number, radiusY: number) {
    t = modPositive(t - Math.PI / 2, Math.PI * 2);

    const r = Math.sqrt(radiusX * radiusX + radiusY * radiusY);
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);

    return { x, y };
}

function degToRad(angle: number) {
    return (angle * Math.PI) / 180;
}

function getSpokeGridDivs(divs: number, startAngle: number | undefined, radiusX: number, radiusY: number) {
    if (divs <= 1) {
        return [];
    }

    const startRad = degToRad(startAngle ?? 0);

    return Array.from({ length: divs }, (_, i) =>
        circlePointAtAngle(startRad + (i / divs) * Math.PI * 2, radiusX, radiusY),
    );
}

const RadialGridRenderer: React.FC<GridProps<RadialGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const { scene } = useScene();
    const clip = getArenaClip(scene);
    const position = getCanvasArenaEllipse(scene);

    const rings = getRingGridDivs(grid.radialDivs, position.radiusX, position.radiusY);
    const spokes = getSpokeGridDivs(grid.angularDivs, grid.startAngle, position.radiusX, position.radiusY);

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                clip(ctx);

                ctx.beginPath();

                for (const spoke of spokes) {
                    ctx.moveTo(position.x, position.y);
                    ctx.lineTo(position.x + spoke.x, position.y + spoke.y);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);

                for (const ring of rings) {
                    ctx.beginPath();
                    ctx.ellipse(position.x, position.y, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStrokeShape(shape);
                }
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};

function getLinearGridDivs(divs: number, start: number, distance: number) {
    return Array.from({ length: divs - 1 }, (_, i) => start + ((i + 1) / divs) * distance);
}

const RectangularGridRenderer: React.FC<GridProps<RectangularGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const { scene } = useScene();

    const position = getCanvasArenaRect(scene);

    const rows = getLinearGridDivs(grid.rows, position.y, position.height);
    const cols = getLinearGridDivs(grid.columns, position.x, position.width);

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                for (const x of cols) {
                    ctx.moveTo(x, position.y);
                    ctx.lineTo(x, position.y + position.height);
                }

                for (const y of rows) {
                    ctx.moveTo(position.x, y);
                    ctx.lineTo(position.x + position.width, y);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};

const CustomRectangularGridRenderer: React.FC<GridProps<CustomRectangularGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const { scene } = useScene();
    const clip = getArenaClip(scene);
    const position = getCanvasArenaRect(scene);

    return (
        <Shape
            sceneFunc={(context, shape) => {
                clip(context);

                context.beginPath();

                for (const column of grid.columns) {
                    const x = getCanvasX(scene, column);
                    context.moveTo(x, position.y);
                    context.lineTo(x, position.y + position.height);
                }

                for (const row of grid.rows) {
                    const y = getCanvasY(scene, row);
                    context.moveTo(position.x, y);
                    context.lineTo(position.x + position.width, y);
                }

                context.closePath();
                context.fillStrokeShape(shape);
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};

const CustomRadialGridRenderer: React.FC<GridProps<CustomRadialGrid>> = ({ grid }) => {
    const theme = useSceneTheme();
    const { scene } = useScene();
    const clip = getArenaClip(scene);
    const position = getCanvasArenaEllipse(scene);

    const spokes = grid.spokes.map((angle) => circlePointAtAngle(degtorad(angle), position.radiusX, position.radiusY));

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                clip(ctx);

                ctx.beginPath();

                for (const spoke of spokes) {
                    ctx.moveTo(position.x, position.y);
                    ctx.lineTo(position.x + spoke.x, position.y + spoke.y);
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);

                for (const ring of grid.rings) {
                    ctx.beginPath();
                    ctx.ellipse(position.x, position.y, ring, ring, 0, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStrokeShape(shape);
                }
            }}
            {...theme.grid}
            {...ALIGN_TO_PIXEL}
        />
    );
};
