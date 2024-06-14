import { classNamesFunction, Theme, useTheme } from '@fluentui/react';
import { IStyle } from '@fluentui/style-utilities';
import React, { PropsWithChildren, useMemo } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Route,
    RouterProvider,
    useLocation,
    useSearchParams,
} from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { parseSceneLink } from './file/share';
import { FileOpenPage } from './FileOpenPage';
import { HelpProvider } from './HelpProvider';
import { MainPage } from './MainPage';
import { SceneProvider } from './SceneProvider';
import { SiteHeader } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';
import { ToolbarProvider } from './ToolbarProvider';

interface IAppStyles {
    root: IStyle;
    header: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

function getStyles(theme: Theme): IAppStyles {
    return {
        root: {
            colorScheme: theme.isInverted ? 'dark' : 'light',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: `auto minmax(400px, auto) 1fr`,
            gridTemplateRows: `min-content auto 1fr`,
            gridTemplateAreas: `
                "header     header  header"
                "left-panel steps   right-panel"
                "left-panel content right-panel"
            `,
        },
        header: {
            gridArea: 'header',
        },
    };
}

export const BaseProviders: React.FC<PropsWithChildren> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const { hash } = useLocation();

    const sceneFromLink = useMemo(() => {
        try {
            return parseSceneLink(hash, searchParams);
        } catch (ex) {
            console.error('Invalid plan data from URL', ex);
        }
    }, [hash, searchParams]);

    return (
        <ThemeProvider>
            <HelpProvider>
                <ToolbarProvider>
                    <SceneProvider initialScene={sceneFromLink}>
                        <DirtyProvider>{children}</DirtyProvider>
                    </SceneProvider>
                </ToolbarProvider>
            </HelpProvider>
        </ThemeProvider>
    );
};

const Layout: React.FC = () => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    return (
        <BaseProviders>
            <div className={classNames.root}>
                <SiteHeader className={classNames.header} />
                <Outlet />
            </div>
        </BaseProviders>
    );
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="open" element={<FileOpenPage />} />
        </Route>,
    ),
);

export const App: React.FC = () => {
    return <RouterProvider router={router} />;
};
