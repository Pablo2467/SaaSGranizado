export default function ConfirmDialog({ abierto, titulo, mensaje, onConfirmar, onCancelar }) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-tinta-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="font-display font-bold text-lg text-tinta-900">{titulo}</h3>
        <p className="text-tinta-600 text-sm mt-2">{mensaje}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancelar}
            className="flex-1 rounded-lg border border-tinta-300/40 py-2 text-sm font-medium text-tinta-600 hover:bg-tinta-900/5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 rounded-lg bg-frambuesa-500 text-white py-2 text-sm font-semibold hover:bg-frambuesa-600 transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}