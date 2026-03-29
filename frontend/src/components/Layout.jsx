import { Navbar } from "./Navbar.jsx";

export function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
