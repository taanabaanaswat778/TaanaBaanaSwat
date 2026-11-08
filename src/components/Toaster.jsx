import { useEffect, useState } from "react";

export default function Toaster() {
  const [t, setT] = useState(null);
  useEffect(() => {
    let timer;
    const show = (e) => {
      setT(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), e.detail.action ? 3500 : 2000);
    };
    window.addEventListener("app-toast", show);
    return () => { window.removeEventListener("app-toast", show); clearTimeout(timer); };
  }, []);
  return t ? (
    <div className="mini-toast">
      {t.msg}
      {t.action && <a href={t.action.href}>{t.action.label}</a>}
    </div>
  ) : null;
}