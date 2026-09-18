import { useEffect, useState } from "react";

export default function ToastHost() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hide;
    function onToast(e) {
      setMsg(e.detail || "Copied");
      setShow(true);
      clearTimeout(hide);
      hide = setTimeout(() => setShow(false), 2600);
    }
    window.addEventListener("portfolio-toast", onToast);
    return () => {
      window.removeEventListener("portfolio-toast", onToast);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div className={`toast-host ${show ? "is-visible" : ""}`} role="status">
      <span className="toast-dot" />
      <span>{msg}</span>
    </div>
  );
}
