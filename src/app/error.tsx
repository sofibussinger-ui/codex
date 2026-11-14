"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1>No pudimos completar la operación</h1>
      <p>
        Tu información no se muestra por un problema de conexión o
        configuración. Intentá nuevamente.
      </p>
      <button className="mt-4 underline" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
