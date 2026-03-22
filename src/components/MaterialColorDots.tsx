/** Renders a row of color dots for a material */
export const MaterialColorDots = ({ colors, size = "sm" }: { colors: string[]; size?: "sm" | "xs" }) => {
  const dotSize = size === "sm" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";
  const overlap = size === "sm" ? "-ml-1" : "-ml-0.5";

  return (
    <div className="flex items-center">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full border border-border shadow-sm ${i > 0 ? overlap : ""}`}
          style={{ backgroundColor: color, zIndex: colors.length - i }}
        />
      ))}
    </div>
  );
};
