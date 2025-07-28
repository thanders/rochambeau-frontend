import { JSX } from "preact";
import { tw } from "twind";

type Variant = "primary" | "secondary" | "success" | "danger" | "warning";

const baseClasses =
  "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";

const variantClasses: Record<Variant, string> = {
  primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  secondary: "text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
  success: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
  danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  warning: "text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300",
};

interface ButtonProps
  extends JSX.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  variant?: Variant;
  href?: string; // Optional - presence triggers rendering <a> instead of <button>
}

export function Button(
  { variant = "primary", class: className = "", href, ...props }: ButtonProps,
) {
  const classes = tw(`${baseClasses} ${variantClasses[variant]} ${className}`);

  if (href) {
    return (
      <a
        {...(props as JSX.HTMLAttributes<HTMLAnchorElement>)}
        href={href}
        class={classes}
      />
    );
  }

  return (
    <button
      {...(props as JSX.HTMLAttributes<HTMLButtonElement>)}
      class={classes}
    />
  );
}
