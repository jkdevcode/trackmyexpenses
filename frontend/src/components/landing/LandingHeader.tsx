import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";

export const LandingHeader = () => {
  return (
    <HeroNavbar maxWidth="xl" position="sticky">
      <NavbarBrand>
        <p className="font-bold text-inherit text-xl">TrackMyExpenses</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#features">
            Características
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#how-it-works">
            Cómo funciona
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="/login">Iniciar Sesión</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="/register" variant="flat">
            Crear Cuenta
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
