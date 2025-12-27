export const HowItWorks = () => {
  const steps = [
    {
      title: "Sube o Toma Foto",
      description: "Carga tu factura desde tu ordenador o toma una foto directamente con tu móvil.",
      icon: "📸",
    },
    {
      title: "Extracción Inteligente",
      description: "Nuestro sistema OCR lee automáticamente la fecha, el comercio y el importe total por ti.",
      icon: "🔍",
    },
    {
      title: "Confirma y Guarda",
      description: "Verifica que los datos sean correctos y añádelos a tu historial con un solo clic.",
      icon: "✅",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-default-50 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold">Cómo funciona</h2>
          <p className="text-default-500 max-w-xl mx-auto">
            Hemos simplificado el proceso al máximo para que registrar un gasto no te quite más de 10 segundos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 bg-background rounded-2xl border border-default-100 shadow-sm transition-transform hover:-translate-y-1">
              <span className="text-5xl mb-6">{step.icon}</span>
              <h3 className="text-xl font-bold mb-3">{index + 1}. {step.title}</h3>
              <p className="text-default-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
