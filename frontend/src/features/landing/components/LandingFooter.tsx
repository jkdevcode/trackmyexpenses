import { Link } from "@heroui/link";

export const LandingFooter = () => {
  return (
    <footer className="w-full py-12 border-t border-default-100 bg-background px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-xl">TrackMyExpenses</p>
          <p className="text-default-400 text-sm">
            © 2025 Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-8">
          <Link className="text-sm" color="foreground" href="/terms">
            Términos
          </Link>
          <Link className="text-sm" color="foreground" href="/privacy">
            Privacidad
          </Link>
          <Link
            className="text-sm"
            color="foreground"
            href="mailto:info@trackmyexpenses.com"
          >
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
};
