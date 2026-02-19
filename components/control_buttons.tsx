import styles from "./control_buttons.module.css";

type ControlButtonProps = {
  onClick: () => void;
};

export function LeftControlButton({ onClick }: ControlButtonProps) {
  return (
    <button className={styles.leftButton} onClick={onClick}>
      Left
    </button>
  )
}
export  function RightControlButton({ onClick }: ControlButtonProps) {
  return (
    <button className={styles.rightButton} onClick={onClick}>
      Right
    </button>
  )
}

export function MoveButton({ onClick }: ControlButtonProps) {
  return (
    <button className={styles.moveButton} onClick={onClick}>
      Move
    </button>
  )
}

export function ReportButton({ onClick }: ControlButtonProps) {
  return (
    <button className={styles.reportButton} onClick={onClick}>
      Report
    </button>
  )
}