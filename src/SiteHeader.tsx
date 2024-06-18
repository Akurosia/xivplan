import { Button, Link, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherMoonFilled, WeatherSunnyFilled } from '@fluentui/react-icons';
import React, { HTMLAttributes, useContext } from 'react';
import { AboutDialog } from './AboutDialog';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpProvider';
import { DarkModeContext } from './ThemeProvider';
import { ToolbarContext } from './ToolbarProvider';
import logoUrl from './logo.svg';

const HEADER_HEIGHT = '48px';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        columnGap: '20px',
        minHeight: HEADER_HEIGHT,
        paddingInlineEnd: '30px',
    },
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        display: 'block',
        width: '32px',
        height: '32px',
        paddingLeft: '8px',
        paddingRight: '8px',
    },
    commandBar: {
        // TODO: should probably tie this to panel width
        // TODO: handle small windows more gracefully
        marginLeft: '122px',
        flexGrow: 1,
    },
    link: {
        color: tokens.colorNeutralForeground2,
    },
    toggleLabel: {
        color: tokens.colorNeutralForeground2,
        fontWeight: 500,
    },
    theme: {
        minWidth: '130px',
    },
});

export const SiteHeader: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const classes = useStyles();
    const [, setHelpOpen] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const [commands] = useContext(ToolbarContext);

    return (
        <header className={mergeClasses(classes.root, className)} {...props}>
            <div className={classes.brand}>
                <img src={logoUrl} alt="Site logo" className={classes.icon} />
                <Text size={500} weight="semibold">
                    XIVPlan
                </Text>
            </div>
            <div className={classes.commandBar}>{commands}</div>

            <Link onClick={() => setHelpOpen(true)} className={classes.link}>
                Help
            </Link>
            <AboutDialog className={classes.link} />
            <ExternalLink className={classes.link} href="https://github.com/joelspadin/xivplan" noIcon>
                GitHub
            </ExternalLink>
            <div>
                <Button
                    appearance="subtle"
                    className={classes.theme}
                    icon={darkMode ? <WeatherMoonFilled /> : <WeatherSunnyFilled />}
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? 'Dark theme' : 'Light theme'}
                </Button>
            </div>
        </header>
    );
};
