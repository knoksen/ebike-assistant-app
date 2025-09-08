import { renderWithProviders } from "../../test/test-utils";
import { screen, within, fireEvent, waitFor } from "@testing-library/react";
import Header from "../../components/Header";

const PRIMARY = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/guides", label: "Guides", icon: "📖" },
  { path: "/rides", label: "Rides", icon: "🚲" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
  { path: "/about", label: "About", icon: "ℹ️" },
];

const SECONDARY = [
  { path: "/diagnostics", label: "Diagnostics", icon: "🔧" },
  { path: "/tuneup", label: "Tuneup", icon: "🔨" },
  { path: "/boost", label: "Power Boost", icon: "⚡" },
  { path: "/parts", label: "Parts", icon: "⚙️" },
  { path: "/maintenance", label: "Maintenance", icon: "🛠️" },
];

const mobileNavItems = [...PRIMARY, ...SECONDARY];

describe("Header", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  test("renders brand elements", () => {
    renderWithProviders(<Header />);

    const link = screen.getByRole("link", { name: /e-bike assistant/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveClass("group", "flex", "items-center", "space-x-3");

    const logo = within(link).getByAltText("E-Bike Assistant");
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe("IMG");
    expect(logo).toHaveAttribute("src", expect.stringContaining("ebike-icon"));
    expect(logo).toHaveClass("w-8", "h-8", "relative", "transform");

    const title = within(link).getByText("E-Bike Assistant");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass(
      "text-lg",
      "font-semibold",
      "bg-gradient-to-r",
      "from-blue-600",
      "to-green-600",
      "dark:from-blue-400",
      "dark:to-green-400",
      "bg-clip-text",
      "text-transparent"
    );
  });

  test("renders desktop navigation", () => {
    renderWithProviders(<Header />, { route: "/" });

    const desktopNav = screen.getByRole("navigation", {
      name: "Desktop navigation",
    });

    expect(desktopNav).toHaveClass(
      "hidden",
      "md:flex",
      "items-center",
      "gap-2"
    );

    // Only check PRIMARY segment items (initially visible)
    PRIMARY.forEach(({ label, path }) => {
      // Use data-testid instead of icon regex
      const link = within(desktopNav).getByTestId(
        `nav-${label.toLowerCase().replace(" ", "-")}`
      );
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", path);

      expect(link).toHaveClass(
        "relative",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "w-20",
        "h-20",
        "rounded-lg",
        "text-sm",
        "transition-all",
        "duration-300"
      );

      if (path === "/") {
        expect(link).toHaveClass("bg-gray-100", "text-gray-900", "shadow-sm");
      } else {
        expect(link).toHaveClass("text-gray-600");
      }
    });
  });
  test("renders mobile navigation when menu is open", () => {
    renderWithProviders(<Header />, { route: "/diagnostics" });

    const menuButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(menuButton);

    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveClass(
      "md:hidden",
      "py-2",
      "overflow-x-auto",
      "whitespace-nowrap",
      "scrollbar-thin"
    );

    // Check all mobile nav items (both primary and secondary)
    mobileNavItems.forEach(({ label, path }) => {
      const mobileNav = screen.getByLabelText("Mobile navigation");
      const link = within(mobileNav).getByTestId(
        `nav-${label.toLowerCase().replace(" ", "-")}`
      );
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", path);
      expect(link).toHaveClass(
        "px-3",
        "py-2",
        "rounded-lg",
        "text-sm",
        "transition-all",
        "duration-300",
        "flex",
        "flex-col",
        "items-center",
        "space-y-1"
      );

      if (path === "/diagnostics") {
        expect(link).toHaveClass("bg-blue-100", "text-blue-600");
      } else {
        expect(link).toHaveClass("text-gray-600");
      }
    });
  });

  test("toggles theme mode", () => {
    renderWithProviders(<Header />, { theme: { isDark: false } });

    const themeButton = screen.getByTitle("Toggle dark mode");
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveClass(
      "relative",
      "p-2",
      "rounded-lg",
      "bg-gradient-to-br",
      "from-blue-500/10",
      "to-green-500/10",
      "dark:from-blue-400/5",
      "dark:to-green-400/5",
      "transition-all",
      "duration-300",
      "group",
      "overflow-hidden"
    );

    // Initial state (light mode)
    const sunSvg = screen.getByLabelText("light mode");
    expect(sunSvg).toBeInTheDocument();

    // Toggle to dark mode
    fireEvent.click(themeButton);
    const moonSvg = screen.getByLabelText("dark mode");
    expect(moonSvg).toBeInTheDocument();
  });

  test("persists theme preference", () => {
    renderWithProviders(<Header />, { theme: { isDark: false } });
    const themeButton = screen.getByTitle("Toggle dark mode");

    // Initial state is light mode
    const sunSvg = screen.getByLabelText("light mode");
    expect(sunSvg).toBeInTheDocument();

    // Toggle to dark mode
    fireEvent.click(themeButton);
    const moonSvg = screen.getByLabelText("dark mode");
    expect(moonSvg).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Toggle back to light mode
    fireEvent.click(themeButton);
    const newSunSvg = screen.getByLabelText("light mode");
    expect(newSunSvg).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("applies correct styles to home link", async () => {
    renderWithProviders(<Header />, { route: "/" });

    const desktopNav = screen.getByLabelText("Desktop navigation");

    // Home should be active
    const homeLink = within(desktopNav).getByTestId("nav-home");
    expect(homeLink).toHaveClass("bg-gray-100", "text-gray-900", "shadow-sm");

    // Other PRIMARY segment links should be inactive
    PRIMARY.filter((item) => item.path !== "/").forEach((item) => {
      const link = within(desktopNav).getByTestId(
        `nav-${item.label.toLowerCase().replace(" ", "-")}`
      );
      expect(link).toHaveClass("text-gray-600");
      expect(link).not.toHaveClass("bg-gray-100", "shadow-sm");
    });
  });

  test("applies correct styles to diagnostics link", async () => {
    const { getByLabelText } = renderWithProviders(<Header />, {
      route: "/diagnostics",
    });

    const desktopNav = getByLabelText("Desktop navigation");

    // Wait for secondary segment to be active (since diagnostics is in secondary)
    await waitFor(() => {
      // Switch to secondary segment first
      const toggleButton = within(desktopNav).getByLabelText("Toggle segment");
      fireEvent.click(toggleButton);
    });

    // Wait for diagnostics to be active
    await waitFor(() => {
      const diagnosticsLink = within(desktopNav).getByTestId("nav-diagnostics");
      expect(diagnosticsLink).toHaveClass(
        "bg-gray-100",
        "text-gray-900",
        "shadow-sm"
      );
    });

    // Other links should be inactive
    await waitFor(() => {
      SECONDARY.forEach((item) => {
        const link = within(desktopNav).getByTestId(
          `nav-${item.label.toLowerCase().replace(" ", "-")}`
        );
        if (item.path !== "/diagnostics") {
          expect(link).toHaveClass("text-gray-600");
          expect(link).not.toHaveClass("bg-gray-100", "shadow-sm");
        }
      });
    });
  });
  test("navigates to boost route and applies correct styles", async () => {
    renderWithProviders(<Header />, {
      route: "/",
    });

    const desktopNav = screen.getByLabelText("Desktop navigation");

    // Initially home should be active
    await waitFor(() => {
      const homeLink = within(desktopNav).getByTestId("nav-home");
      expect(homeLink).toHaveClass("bg-gray-100");
    });

    // Switch to secondary segment (where boost lives)
    const toggleButton = screen.getByLabelText("Toggle segment");
    fireEvent.click(toggleButton);

    // Wait for segment switch and navigation to first secondary item (diagnostics)
    await waitFor(() => {
      const diagnosticsLink = within(desktopNav).getByTestId("nav-diagnostics");
      expect(diagnosticsLink).toHaveClass("bg-gray-100");
    });

    // Now navigate to boost within the secondary segment
    const boostLink = within(desktopNav).getByTestId("nav-power-boost");
    fireEvent.click(boostLink);

    // Wait for boost to become active
    await waitFor(() => {
      const boostLink = within(desktopNav).getByTestId("nav-power-boost");
      const diagnosticsLink = within(desktopNav).getByTestId("nav-diagnostics");

      expect(boostLink).toHaveClass("bg-gray-100");
      expect(diagnosticsLink).not.toHaveClass("bg-gray-100");
    });
  });

  test("Desktop navigation has correct structure and accessibility", async () => {
    renderWithProviders(<Header />);

    // Check the main navigation container
    const desktopNav = screen.getByLabelText("Desktop navigation");
    expect(desktopNav).toBeInTheDocument();
    expect(desktopNav).toHaveAttribute("role", "navigation");
    expect(desktopNav).toHaveClass(
      "hidden",
      "md:flex",
      "items-center",
      "gap-2"
    );

    const toggleButton = within(desktopNav).getByLabelText("Toggle segment");
    expect(toggleButton).toBeInTheDocument();

    const connectButton = within(desktopNav).getByLabelText(
      /connect device|disconnect device/i
    );
    expect(connectButton).toBeInTheDocument();

    // Check that all primary navigation items are present
    PRIMARY.forEach((item) => {
      const navLink = within(desktopNav).getByTestId(
        `nav-${item.label.toLowerCase().replace(" ", "-")}`
      );
      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveAttribute("href", item.path);
      expect(navLink).toHaveAttribute("aria-label", item.label);

      expect(navLink).toHaveClass(
        "relative",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "w-20",
        "h-20",
        "rounded-lg"
      );
    });
  });

  test("mobile menu has correct accessibility and styling", () => {
    renderWithProviders(<Header />);

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass(
      "md:hidden",
      "p-2",
      "rounded-lg",
      "bg-gradient-to-br",
      "from-blue-500/10",
      "to-green-500/10"
    );

    const mobileNav = screen.getByLabelText("Mobile navigation");
    expect(mobileNav).toHaveClass(
      "hidden",
      "md:hidden",
      "py-2",
      "overflow-x-auto",
      "whitespace-nowrap",
      "scrollbar-thin"
    );
  });

  test("toggles mobile menu visibility", () => {
    renderWithProviders(<Header />);

    // Mobile nav should start hidden
    const [mobileNav] = screen.getAllByRole("navigation", { name: /mobile/i });
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveClass("hidden");

    // Click menu button to show nav
    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);
    expect(mobileNav).not.toHaveClass("hidden");

    // Click menu button again to hide nav
    fireEvent.click(menuButton);
    expect(mobileNav).toHaveClass("hidden");
  });
});
