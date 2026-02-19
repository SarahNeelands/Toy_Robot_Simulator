import { useEffect, useCallback } from "react";
import { apiKeysMoveRobot } from "../api-handlers/robot-api";

type MoveDir = "north" | "south" | "east" | "west";

type Props = 
{
    robotId: string | null;
    tableId: string | null;
    onAfterAction?: () => void;
};

export function useArrowKeyControls({ robotId, tableId, onAfterAction }: Props) 
{
    const handleKeyDown = useCallback(
    async (e: KeyboardEvent) =>
    {
        if (!robotId || !tableId) return;

        const keyToDir: Record<string, MoveDir | null> = 
        {
            ArrowUp: "north",
            ArrowDown: "south",
            ArrowLeft: "west",
            ArrowRight: "east",
        };

        const moveDir = keyToDir[e.key] ?? null;
        if (!moveDir) return;

        e.preventDefault();

        try 
        {
            await apiKeysMoveRobot(robotId, tableId, moveDir);
            onAfterAction?.();
        } 
        catch (err) {console.error("Robot key action failed", err);}
    },
    [robotId, tableId, onAfterAction]);
    useEffect(() => 
    {
        window.addEventListener("keydown", handleKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}
