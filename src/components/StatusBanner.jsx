import { useStatus } from "../status";

export default function StatusBanner() {
  const s = useStatus();
  return s.text ? <div className={"status-bar " + s.kind}>{s.text}</div> : null;
}