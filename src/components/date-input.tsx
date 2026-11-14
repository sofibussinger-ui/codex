"use client";
import { useEffect, useRef } from "react";
export function DateInput({
  name,
  initial,
}: {
  name: string;
  initial?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initial && input.current) {
      const d = new Date(initial);
      input.current.value = new Date(
        d.getTime() - d.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
    }
  }, [initial]);
  return (
    <>
      <input
        ref={input}
        aria-label="Fecha y hora"
        type="datetime-local"
        required
        onChange={(e) => {
          const d = new Date(e.target.value);
          if (hidden.current)
            hidden.current.value = Number.isNaN(d.getTime())
              ? ""
              : d.toISOString();
        }}
      />
      <input
        ref={hidden}
        type="hidden"
        name={name}
        defaultValue={initial || ""}
      />
      <small>Horario local de tu dispositivo.</small>
    </>
  );
}
