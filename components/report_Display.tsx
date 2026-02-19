
import "./report_Display.css";

type ReportDisplayProps = {
    yCord: number;
    xCord: number;
    direction: string;
}

export default function ReportDisplay({ yCord, xCord, direction }: ReportDisplayProps) {
    return (
        <div className="report-display">
            <h2>Current Placement: ({xCord}, {yCord}) </h2>
            <h2>Facing: {direction}</h2>
        </div>
    )
}