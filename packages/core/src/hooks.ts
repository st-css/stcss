import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StContext } from './context';

export const useSt = () => useContext(StContext);

export const useHasMounted = (): boolean => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    return hasMounted;
};

export const useMediaQueries = <Q extends Record<string, string>>(queries: Q): Record<keyof Q, boolean> => {
    const timeout = useRef<NodeJS.Timeout>();
    const matchesRef = useRef({});

    const matchHandler = useCallback(
        (e: MediaQueryListEvent) => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            const [name] = Object.entries(queries).find(([_, media]) => media === e.media) || [];
            if (name) {
                // match media fires for any CHANGES, so will fire once for the breakpoint we
                // are leaving and one for the breakpoint we are entering. We add a little timeout
                // here, gathering together all the changes in a ref, so we only update once when
                // transitioning between breakpoints
                matchesRef.current = {
                    ...matchesRef.current,
                    [name]: e.matches,
                };
                timeout.current = setTimeout(() => {
                    setMatches(matchesRef.current as Record<keyof Q, boolean>);
                }, 1);
            }
        },
        [queries]
    );

    const [matchMediaMatches, matchMedias] = useMemo(() => {
        const matches: Record<string, boolean> = {};
        const matchMedias: MediaQueryList[] = [];
        Object.entries(queries).forEach(([name, query]) => {
            if (typeof window === 'undefined') {
                matches[name] = false;
                return;
            }
            const matchMedia = window.matchMedia(query);
            matchMedia.addEventListener('change', matchHandler);
            matchMedias.push(matchMedia);
            matches[name] = matchMedia.matches;
        });
        return [matches, matchMedias];
    }, [queries, matchHandler]);

    const [matches, setMatches] = useState(matchMediaMatches as Record<keyof Q, boolean>);

    useEffect(() => {
        return () => {
            clearTimeout(timeout.current as number | undefined);
            matchMedias.forEach((q) => {
                q.removeEventListener('change', matchHandler);
            });
        };
    }, [matchMedias, matchHandler]);

    return matches;
};
