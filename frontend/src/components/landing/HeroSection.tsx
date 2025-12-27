import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center py-20 gap-8 text-center px-4">
      <div className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Controla tus gastos <span className="text-primary text-6xl">sin perder tiempo</span>
        </h1>
        <p className="text-xl text-default-500 max-w-2xl mx-auto">
          Sube una foto de tu factura y deja que el OCR haga el trabajo sucio. 
          Edita, confirma y olvídate. La forma más simple de llevar tus cuentas.
        </p>
      </div>
      <div className="flex gap-4">
        <Button as={Link} color="primary" size="lg" href="/register" className="px-8 font-semibold">
          Empezar Gratis
        </Button>
        <Button as={Link} variant="bordered" size="lg" href="#how-it-works" className="px-8">
          Saber más
        </Button>
      </div>
      <div className="mt-12 w-full max-w-5xl rounded-2xl overflow-hidden border border-default-200 bg-default-50 shadow-2xl aspect-video flex items-center justify-center text-default-300">
        {/* Placeholder for Dashboard Image/Preview */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-default-200" />
          <p className="italic text-sm">Vista previa de la interfaz</p>
        </div>
      </div>
    </section>
  );
};
