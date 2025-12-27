export const FeatureShowcase = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Tu historial, <span className="text-primary">siempre a mano</span>
          </h2>
          <p className="text-lg text-default-500">
            Olvídate de las pilas de papeles y los Excel manuales. 
            TrackMyExpenses organiza tus gastos por categorías y te ofrece una vista clara de dónde se va tu dinero cada mes.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">✓</div>
              <span>Filtros avanzados por fecha y monto</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">✓</div>
              <span>Categorización automática inteligente</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">✓</div>
              <span>Exportación de datos para tu contabilidad</span>
            </li>
          </ul>
        </div>
        <div className="bg-default-100 rounded-3xl aspect-square flex items-center justify-center text-default-300 border border-default-200 shadow-inner">
          <p className="italic">Visualización del Historial</p>
        </div>
      </div>
    </section>
  );
};
